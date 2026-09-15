import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppRouter } from './src/navigation/AppRouter';
import { AppProviders } from './src/providers/AppProviders';

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, width: '100%', height: '100%' }}>
      <StatusBar style="dark" />
      <AppProviders><AppRouter /></AppProviders>
    </SafeAreaProvider>
  );
}
