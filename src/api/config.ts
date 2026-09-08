import { ApiError } from './errors';

// Compile-time shape only; this does not introduce a Node runtime into the app.
declare const process: {
  readonly env: {
    readonly EXPO_PUBLIC_API_BASE_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    readonly EXPO_PUBLIC_MENTE_MOCK_MODE?: string;
  };
};

// Expo statically replaces these direct references in release bundles.
// Do not alias process.env: native/web clients have no runtime environment source.
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export function getApiBaseUrl(): string {
  if (!apiBaseUrl) {
    throw new ApiError({
      kind: 'configuration',
      message: 'EXPO_PUBLIC_API_BASE_URL is required to use live Mente data.',
    });
  }
  try {
    const url = new URL(apiBaseUrl);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
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
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url && !publishableKey) return null;
  if (!url || !publishableKey) {
    throw new ApiError({ kind: 'configuration', message: 'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured together.' });
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && __DEV__)) throw new Error('Unsupported URL protocol');
    return { url: url.replace(/\/$/, ''), publishableKey };
  } catch {
    throw new ApiError({
      kind: 'configuration',
      message: 'EXPO_PUBLIC_SUPABASE_URL must be an HTTPS URL.',
    });
  }
}

export const isDevelopmentMockMode = __DEV__ && process.env.EXPO_PUBLIC_MENTE_MOCK_MODE === 'true';
export const isDevelopmentBuild = __DEV__;
