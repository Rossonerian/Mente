import { ApiError } from './errors';

type ExpoEnvironment = Record<string, string | undefined>;

const environment = (globalThis as typeof globalThis & { process?: { env?: ExpoEnvironment } }).process?.env;
const apiBaseUrl = environment?.EXPO_PUBLIC_API_BASE_URL?.trim();

export function getApiBaseUrl(): string {
  if (!apiBaseUrl) {
    throw new ApiError({
      kind: 'configuration',
      message: 'EXPO_PUBLIC_API_BASE_URL is required to use live Mente data.',
    });
  }
  try {
    const url = new URL(apiBaseUrl);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) {
      throw new Error('Unsupported URL protocol');
    }
    return apiBaseUrl.replace(/\/$/, '');
  } catch {
    throw new ApiError({
      kind: 'configuration',
      message: 'EXPO_PUBLIC_API_BASE_URL must be an HTTPS URL or a localhost HTTP URL.',
    });
  }
}

export function getSupabasePublicConfig(): { url: string; publishableKey: string } | null {
  const url = environment?.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = environment?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') throw new Error('Unsupported URL protocol');
    return { url: url.replace(/\/$/, ''), publishableKey };
  } catch {
    throw new ApiError({
      kind: 'configuration',
      message: 'EXPO_PUBLIC_SUPABASE_URL must be an HTTPS URL.',
    });
  }
}

export const isDevelopmentMockMode = __DEV__ && environment?.EXPO_PUBLIC_MENTE_MOCK_MODE === 'true';
