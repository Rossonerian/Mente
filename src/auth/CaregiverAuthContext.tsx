import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isDevelopmentMockMode } from '../api/config';
import { getSupabaseClient } from './supabase';
import { getSafeCaregiverSignInMessage } from './caregiverAuthError';

type CaregiverAuthState =
  | { kind: 'loading' }
  | { kind: 'signed-out'; configured: boolean }
  | { kind: 'signed-in'; accessToken: string; user: User };

interface CaregiverAuthValue {
  state: CaregiverAuthState;
  signIn(email: string, password: string): Promise<string | null>;
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

  useEffect(() => {
    const caregiverId = state.kind === 'signed-in' ? state.user.id : null;
    if (previousCaregiverId.current !== caregiverId) {
      void queryClient.cancelQueries({ queryKey: ['caregiver'] });
      queryClient.removeQueries({ queryKey: ['caregiver'] });
      previousCaregiverId.current = caregiverId;
    }
  }, [queryClient, state]);

  useEffect(() => {
    if (!client) return undefined;
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (mounted) setState(fromSession(data.session));
    }).catch(() => {
      if (mounted) setState({ kind: 'signed-out', configured: true });
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (mounted) setState(fromSession(session));
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

function fromSession(session: Session | null): CaregiverAuthState {
  return session ? { kind: 'signed-in', accessToken: session.access_token, user: session.user } : { kind: 'signed-out', configured: true };
}
