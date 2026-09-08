let patientToken: string | null = null;
let pendingWrite: string | null = null;

export const patientDeviceStore = {
  async clearToken() { patientToken = null; },
  async getPendingWrite() { return pendingWrite; },
  async getToken() { return patientToken; },
  async removePendingWrite() { pendingWrite = null; },
  async setPendingWrite(value: string) { pendingWrite = value; },
  async setToken(value: string) { patientToken = value; },
};

// Browser patient access is intentionally memory-only; a refresh requires a new caregiver-assisted bind.
export const patientDeviceStoreSecurity = 'web-memory-only' as const;
