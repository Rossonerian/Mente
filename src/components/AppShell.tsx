import type { ReactNode } from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { caregiverTheme, patientTheme } from '../theme/tokens-enhanced';
import type { AppRole, TabItem } from '../types';
import { BottomTabBar } from './BottomTabBar';
import { GlassBackdrop } from './glass/GlassBackdrop';
import { PreviewBar } from './PreviewBar';
import { AppLogo } from './AppLogo';

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

  const bgImage = role === 'caregiver' ? require('../../assets/images/bg-caregiver.png') : require('../../assets/images/bg-patient.png');

  const webBackgroundStyle = Platform.OS === 'web' ? { position: 'fixed' as any, top: 0, left: 0, width: '100vw' as any, height: '100vh' as any, zIndex: -1 } : {};

  return (
    <View style={[{ flex: 1, backgroundColor }, Platform.OS === 'web' && { minHeight: '100vh' as any }]}>
      <Image source={bgImage} style={[StyleSheet.absoluteFill, webBackgroundStyle]} resizeMode="cover" />
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <GlassBackdrop theme={role}>
          {showPreviewBar ? <PreviewBar role={role} onSwitchRole={onSwitchRole} /> : null}
        <View style={styles.content}>
          <AppLogo />
          <View style={styles.screenContent}>{children}</View>
        </View>
        {showTabs ? <BottomTabBar role={role} tabs={tabs} activeRoute={activeRoute} onNavigate={onNavigate} /> : null}
      </GlassBackdrop>
      </SafeAreaView>
    </View>
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
  backgroundImage: {
    flex: 1,
  },
});
