import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { caregiverTheme, patientTheme } from '../theme/tokens-enhanced';
import type { AppRole, TabItem } from '../types';
import { BottomTabBar } from './BottomTabBar';
import { GlassBackdrop } from './glass/GlassBackdrop';
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
      <GlassBackdrop theme={role}>
        {showPreviewBar ? <PreviewBar role={role} onSwitchRole={onSwitchRole} /> : null}
        <View style={styles.content}>
          <View style={styles.screenContent}>{children}</View>
        </View>
        {showTabs ? <BottomTabBar role={role} tabs={tabs} activeRoute={activeRoute} onNavigate={onNavigate} /> : null}
      </GlassBackdrop>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  screenContent: {
    flex: 1,
    zIndex: 1,
  },
});
