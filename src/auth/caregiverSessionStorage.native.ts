import * as SecureStore from 'expo-secure-store';

export const caregiverSessionStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

export const caregiverSessionStorageSecurity = 'native-secure-store' as const;
