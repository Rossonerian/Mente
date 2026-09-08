import { getSupabaseClient } from './supabase';

const mockAuth = {
  startAutoRefresh: jest.fn(),
  stopAutoRefresh: jest.fn(),
};
const mockCreateClient = jest.fn((..._args: unknown[]) => ({ auth: mockAuth }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (url: string, key: string, options: unknown) => mockCreateClient(url, key, options),
}));
jest.mock('../api/config', () => ({
  getSupabasePublicConfig: () => ({ url: 'https://identity.example.test', publishableKey: 'publishable-test-key' }),
}));

describe('Supabase client boundary', () => {
  it('creates one persistent public client with native refresh settings', () => {
    const first = getSupabaseClient();
    const second = getSupabaseClient();

    expect(second).toBe(first);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://identity.example.test',
      'publishable-test-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
          storage: expect.any(Object),
        }),
      }),
    );
  });
});
