import { createHttpClient } from './http';

describe('createHttpClient', () => {
  it('adds a caller-owned authorization header and decodes JSON responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'patient-1' }),
    });
    const client = createHttpClient({
      baseUrl: 'https://api.example.test/v1',
      getHeaders: () => ({ Authorization: 'Bearer caregiver-token' }),
      fetchImpl: fetchMock,
    });

    await expect(client.get<{ id: string }>('/patients/patient-1')).resolves.toEqual({ id: 'patient-1' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/v1/patients/patient-1',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer caregiver-token' }) }),
    );
  });

  it('normalizes an unauthorized response without exposing a raw backend detail', async () => {
    const client = createHttpClient({
      baseUrl: 'https://api.example.test/v1',
      fetchImpl: jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid or expired caregiver token' }),
      }),
    });

    await expect(client.get('/auth/me')).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'unauthorized',
      status: 401,
      message: 'Your session has ended. Please sign in again.',
    });
  });

  it('refreshes once after a 401 and never loops', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'expired' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const refreshAccessToken = jest.fn().mockResolvedValue('refreshed-token');
    const client = createHttpClient({
      baseUrl: 'https://api.example.test/v1',
      getHeaders: (override) => ({ Authorization: `Bearer ${override ?? 'old-token'}` }),
      refreshAccessToken,
      fetchImpl: fetchMock,
    });

    await expect(client.get('/auth/me')).resolves.toEqual({ ok: true });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://api.example.test/v1/auth/me', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer refreshed-token' }),
    }));
  });
});
