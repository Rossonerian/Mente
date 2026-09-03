import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppRouter } from './src/navigation/AppRouter';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppRouter />
    </SafeAreaProvider>
  );
}
