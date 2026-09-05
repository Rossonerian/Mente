import { createCaregiverClient } from './caregiverClient';

jest.mock('./config', () => ({ getApiBaseUrl: () => 'http://localhost:8000/v1' }));

describe('CaregiverClient settings contract', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('uses the FastAPI settings paths, PUT payloads, and caregiver bearer token', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ patient_id: 'patient-1' }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const client = createCaregiverClient('caregiver-token');

    await client.getCallSchedule('patient-1');
    await client.updateCallSchedule('patient-1', { local_time: '09:00', timezone: 'Asia/Kolkata', days_of_week: [0], quiet_start: null, quiet_end: null, language_code: 'en-IN', active: false, allow_one_retry: false });
    await client.getNotificationPreferences('patient-1');
    await client.updateNotificationPreferences('patient-1', { same_day_enabled: true, routine_enabled: false, caregiver_phone_e164: null, reminders_paused: false });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8000/v1/patients/patient-1/call-schedule', expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer caregiver-token' }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8000/v1/patients/patient-1/call-schedule', expect.objectContaining({ method: 'PUT', body: expect.stringContaining('"local_time":"09:00"') }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:8000/v1/patients/patient-1/notification-preferences', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, 'http://localhost:8000/v1/patients/patient-1/notification-preferences', expect.objectContaining({ method: 'PUT', body: expect.stringContaining('"same_day_enabled":true') }));
  });

  it('uses caregiver-only family-memory and alert routes', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const client = createCaregiverClient('caregiver-token');

    await client.listMemories('patient-1');
    await client.listAlerts('patient-1');
    await client.acknowledgeAlert('patient-1', 'alert-1');

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8000/v1/patients/patient-1/memories?active_only=true', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer caregiver-token' }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8000/v1/patients/patient-1/alerts', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer caregiver-token' }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:8000/v1/patients/patient-1/alerts/alert-1/acknowledge', expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer caregiver-token' }) }));
  });
});
