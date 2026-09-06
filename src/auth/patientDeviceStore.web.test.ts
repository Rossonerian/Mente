import { patientDeviceStore, patientDeviceStoreSecurity } from './patientDeviceStore.web';

describe('web patient device credential boundary', () => {
  beforeEach(async () => {
    await patientDeviceStore.clearToken();
    await patientDeviceStore.removePendingWrite();
  });

  it('uses an explicit non-persistent browser strategy', async () => {
    await patientDeviceStore.setToken('device-token');
    await patientDeviceStore.setPendingWrite('{"sessionId":"session-1"}');

    expect(patientDeviceStoreSecurity).toBe('web-memory-only');
    await expect(patientDeviceStore.getToken()).resolves.toBe('device-token');
    await expect(patientDeviceStore.getPendingWrite()).resolves.toBe('{"sessionId":"session-1"}');
  });
});
