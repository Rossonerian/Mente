import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';
import { CaregiverAuthProvider } from '../auth/CaregiverAuthContext';
import { queryClientConfig } from './queryPolicy';
import { installQueryNetworkListener } from './queryNetwork';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  useEffect(() => {
    installQueryNetworkListener();
  }, []);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="menteCaregiver">
      <QueryClientProvider client={queryClient}>
        <CaregiverAuthProvider>{children}</CaregiverAuthProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
