function getBrowserStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export const caregiverSessionStorage = {
  async getItem(key: string) {
    return getBrowserStorage()?.getItem(key) ?? null;
  },
  async removeItem(key: string) {
    getBrowserStorage()?.removeItem(key);
  },
  async setItem(key: string, value: string) {
    getBrowserStorage()?.setItem(key, value);
  },
};

// Browsers do not provide the native secure-storage guarantee. This is deliberately explicit.
export const caregiverSessionStorageSecurity = 'web-local-storage' as const;
