export const patientDeviceStore = {
  async clearToken(): Promise<void> {},
  async getPendingWrite(): Promise<string | null> { return null; },
  async getToken(): Promise<string | null> { return null; },
  async removePendingWrite(): Promise<void> {},
  async setPendingWrite(_value: string): Promise<void> {},
  async setToken(_value: string): Promise<void> {},
};

export const patientDeviceStoreSecurity = 'unavailable' as const;
