import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { caregiverTheme, patientTheme } from '../theme/tokens';
import type { AppRole, TabItem } from '../types';
import { BottomTabBar } from './BottomTabBar';
import { PreviewBar } from './PreviewBar';

export function AppShell({
  role,
  children,
  activeRoute,
  tabs,
  onNavigate,
  onSwitchRole,
  showTabs = true,
  showPreviewBar = true,
}: {
  role: AppRole;
  children: ReactNode;
  activeRoute: string;
  tabs: readonly TabItem[];
  onNavigate: (route: string) => void;
  onSwitchRole: () => void;
  showTabs?: boolean;
  showPreviewBar?: boolean;
}) {
  const backgroundColor = role === 'caregiver' ? caregiverTheme.colors.background : patientTheme.colors.background;
  const safeAreaEdges: readonly ('top' | 'right' | 'bottom' | 'left')[] = showTabs
    ? ['top', 'left', 'right']
    : ['top', 'left', 'right', 'bottom'];

  return (
    <SafeAreaView edges={safeAreaEdges} style={[styles.safeArea, { backgroundColor }]}>
      {showPreviewBar ? <PreviewBar role={role} onSwitchRole={onSwitchRole} /> : null}
      <View style={styles.content}>{children}</View>
      {showTabs ? <BottomTabBar role={role} tabs={tabs} activeRoute={activeRoute} onNavigate={onNavigate} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
