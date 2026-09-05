import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppRouter } from './src/navigation/AppRouter';
<<<<<<< HEAD
import { AppProviders } from './src/providers/AppProviders';
=======
>>>>>>> origin/new_components

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
<<<<<<< HEAD
      <AppProviders><AppRouter /></AppProviders>
=======
      <AppRouter />
>>>>>>> origin/new_components
    </SafeAreaProvider>
  );
}
