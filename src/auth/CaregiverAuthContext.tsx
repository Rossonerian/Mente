import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isDevelopmentMockMode } from '../api/config';
import { ApiError } from '../api/errors';
import { createCaregiverClient } from '../api/caregiverClient';
import { getSupabaseClient } from './supabase';
import { getSafeCaregiverSignInMessage, getSafeCaregiverSignUpMessage } from './caregiverAuthError';

export type CaregiverAuthState =
  | { kind: 'loading' }
  | { kind: 'signed-out'; configured: boolean }
  | { kind: 'signed-in'; accessToken: string; user: User; profileStatus: 'checking' | 'ready' | 'missing' | 'error' };

interface CaregiverAuthValue {
  state: CaregiverAuthState;
  signIn(email: string, password: string): Promise<string | null>;
  signUp(email: string, password: string, displayName: string): Promise<{ message: string | null; requiresConfirmation: boolean }>;
  refreshProfile(): Promise<void>;
  signOut(): Promise<void>;
}

const CaregiverAuthContext = createContext<CaregiverAuthValue | null>(null);

export function CaregiverAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const client = useMemo(() => {
    if (isDevelopmentMockMode) return null;
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);
  const [state, setState] = useState<CaregiverAuthState>(() => (
    client ? { kind: 'loading' } : { kind: 'signed-out', configured: false }
  ));
  const previousCaregiverId = useRef<string | null>(null);
  const sessionVersion = useRef(0);

  useEffect(() => {
    const caregiverId = state.kind === 'signed-in' ? state.user.id : null;
    if (previousCaregiverId.current !== caregiverId) {
      void queryClient.cancelQueries({ queryKey: ['caregiver'] });
      queryClient.removeQueries({ queryKey: ['caregiver'] });
      previousCaregiverId.current = caregiverId;
    }
  }, [queryClient, state]);

  const applySession = async (session: Session | null) => {
    const version = sessionVersion.current + 1;
    sessionVersion.current = version;
    if (!session) {
      setState({ kind: 'signed-out', configured: true });
      return;
    }
    setState({ kind: 'signed-in', accessToken: session.access_token, user: session.user, profileStatus: 'checking' });
    try {
      await createCaregiverClient(session.access_token).getMe();
      if (sessionVersion.current === version) {
        setState({ kind: 'signed-in', accessToken: session.access_token, user: session.user, profileStatus: 'ready' });
      }
    } catch (error) {
      if (sessionVersion.current !== version) return;
      if (error instanceof ApiError && error.code === 'CAREGIVER_PROFILE_NOT_PROVISIONED') {
        setState({ kind: 'signed-in', accessToken: session.access_token, user: session.user, profileStatus: 'missing' });
      } else {
        setState({ kind: 'signed-in', accessToken: session.access_token, user: session.user, profileStatus: 'error' });
      }
    }
  };

  useEffect(() => {
    if (!client) return undefined;
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (mounted) void applySession(data.session);
    }).catch(() => {
      if (mounted) setState({ kind: 'signed-out', configured: true });
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (mounted) void applySession(session);
    });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo<CaregiverAuthValue>(() => ({
    state,
    async signIn(email, password) {
      if (!client) return 'Caregiver sign-in is not configured on this build.';
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      return error ? getSafeCaregiverSignInMessage(error.message) : null;
    },
    async signUp(email, password, displayName) {
      if (!client) return { message: 'Caregiver sign-up is not configured on this build.', requiresConfirmation: false };
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) return { message: getSafeCaregiverSignUpMessage(error.message), requiresConfirmation: false };
      return {
        message: data.session ? null : 'Check your email to confirm your caregiver account, then sign in.',
        requiresConfirmation: !data.session,
      };
    },
    async refreshProfile() {
      if (!client) return;
      const { data } = await client.auth.getSession();
      await applySession(data.session);
    },
    async signOut() {
      queryClient.removeQueries({ queryKey: ['caregiver'] });
      if (client) await client.auth.signOut();
    },
  }), [client, queryClient, state]);

  return <CaregiverAuthContext.Provider value={value}>{children}</CaregiverAuthContext.Provider>;
}

export function useCaregiverAuth(): CaregiverAuthValue {
  const value = useContext(CaregiverAuthContext);
  if (!value) throw new Error('useCaregiverAuth must be used within CaregiverAuthProvider');
  return value;
}
