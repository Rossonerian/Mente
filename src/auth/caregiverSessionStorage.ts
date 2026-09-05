// Metro resolves the native or web implementation at runtime. This fallback keeps TypeScript's
// platform-agnostic resolver aware of the shared storage contract.
export const caregiverSessionStorage = {
  async getItem(_key: string): Promise<string | null> {
    return null;
  },
  async removeItem(_key: string): Promise<void> {},
  async setItem(_key: string, _value: string): Promise<void> {},
};

export const caregiverSessionStorageSecurity = 'unavailable' as const;
