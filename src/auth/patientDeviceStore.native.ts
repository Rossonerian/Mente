import * as SecureStore from 'expo-secure-store';

const patientTokenKey = 'mente.patient-device-token';
const pendingWriteKey = 'mente.patient-pending-game-write';

export const patientDeviceStore = {
  clearToken: () => SecureStore.deleteItemAsync(patientTokenKey),
  getPendingWrite: () => SecureStore.getItemAsync(pendingWriteKey),
  getToken: () => SecureStore.getItemAsync(patientTokenKey),
  removePendingWrite: () => SecureStore.deleteItemAsync(pendingWriteKey),
  setPendingWrite: (value: string) => SecureStore.setItemAsync(pendingWriteKey, value),
  setToken: (value: string) => SecureStore.setItemAsync(patientTokenKey, value),
};

export const patientDeviceStoreSecurity = 'native-secure-store' as const;
