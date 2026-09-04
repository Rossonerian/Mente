import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '../api/config';
import { caregiverSessionStorage } from './caregiverSessionStorage';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  if (!client) {
    client = createClient(config.url, config.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: caregiverSessionStorage,
      },
    });
  }
  return client;
}
