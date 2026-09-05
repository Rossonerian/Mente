const patientTokenKey = 'mente.patient-device-token';
const pendingWriteKey = 'mente.patient-pending-game-write';

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export const patientDeviceStore = {
  async clearToken() { storage()?.removeItem(patientTokenKey); },
  async getPendingWrite() { return storage()?.getItem(pendingWriteKey) ?? null; },
  async getToken() { return storage()?.getItem(patientTokenKey) ?? null; },
  async removePendingWrite() { storage()?.removeItem(pendingWriteKey); },
  async setPendingWrite(value: string) { storage()?.setItem(pendingWriteKey, value); },
  async setToken(value: string) { storage()?.setItem(patientTokenKey, value); },
};

// This is deliberately not labeled secure: browsers do not offer the native storage guarantee.
export const patientDeviceStoreSecurity = 'web-local-storage' as const;
