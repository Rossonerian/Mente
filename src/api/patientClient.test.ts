import { createPatientBindingClient, createPatientClient } from './patientClient';

jest.mock('./config', () => ({ getApiBaseUrl: () => 'http://localhost:8000/v1' }));

describe('PatientClient authentication boundary', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('uses only the device token for patient calls', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'session-1' }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const client = createPatientClient('device-token');
    await client.getMemories();
    await client.startGame({ activity_type: 'MEMORY_TRAIN', client_session_id: 'client-session-1' });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8000/v1/patient/memories', expect.objectContaining({ headers: expect.objectContaining({ 'X-Patient-Token': 'device-token' }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8000/v1/patient/game-sessions', expect.objectContaining({ method: 'POST', headers: expect.not.objectContaining({ Authorization: expect.anything() }) }));
  });

  it('does not attach a caregiver credential while binding a patient device', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ patient_token: 'device-token' }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    await createPatientBindingClient().bind('123456');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/v1/patient/bind', expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }));
  });
});
