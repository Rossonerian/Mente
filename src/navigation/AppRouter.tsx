import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppShell } from '../components/AppShell';
import { caregiverTabs, getDefaultRoute, isCaregiverTabRoute, isPatientTabRoute, patientTabs } from './routes';
import { hidesPatientTabs } from './interaction';
import { CaregiverFamilyScreen } from '../screens/caregiver/CaregiverFamilyScreen';
import { CaregiverHistoryScreen } from '../screens/caregiver/CaregiverHistoryScreen';
import { CaregiverHomeScreen } from '../screens/caregiver/CaregiverHomeScreen';
import { CaregiverSettingsScreen } from '../screens/caregiver/CaregiverSettingsScreen';
import { CaregiverSetupScreen } from '../screens/caregiver/CaregiverSetupScreen';
import { CaregiverLoadingScreen, CaregiverProfileSetupScreen, CaregiverRegistrationScreen, CaregiverSignInScreen } from '../screens/caregiver/CaregiverAccessScreen';
import { PatientCompleteScreen } from '../screens/patient/PatientCompleteScreen';
import { PatientFamilyScreen } from '../screens/patient/PatientFamilyScreen';
import { PatientHelpScreen } from '../screens/patient/PatientHelpScreen';
import { PatientInGameScreen } from '../screens/patient/PatientInGameScreen';
import { PatientPlayScreen } from '../screens/patient/PatientPlayScreen';
import type { AppRole, AppRoute, CaregiverRoute, PatientRoute } from '../types';
import { useCaregiverAuth } from '../auth/CaregiverAuthContext';
import { isDevelopmentBuild, isDevelopmentMockMode } from '../api/config';
import { ConnectedFeatureState } from '../screens/ConnectedFeatureState';
import { PatientDeviceAccessScreen } from '../screens/patient/PatientDeviceAccessScreen';
import { patientDeviceStore } from '../auth/patientDeviceStore';
import type { MemoryDto, PatientSessionDto } from '../api/contracts/patient';
import { adaptMemoryToFamilyMember } from '../api/adapters/caregiverFamily';
import { menteMockData } from '../data/mockData';
import { shouldShowRoleSwitcher } from './rolePreview';

export function AppRouter() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<AppRole>('caregiver');
  const [route, setRoute] = useState<AppRoute>(getDefaultRoute('caregiver'));
  const [showRegistration, setShowRegistration] = useState(false);
  const [patientToken, setPatientToken] = useState<string | null>(null);
  const [patientDeviceLoading, setPatientDeviceLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<{ patientToken: string | null; session: PatientSessionDto; memories: MemoryDto[] } | null>(null);

  useEffect(() => {
    let active = true;
    patientDeviceStore.getToken().then((token) => { if (active) setPatientToken(token); }).finally(() => { if (active) setPatientDeviceLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    void queryClient.cancelQueries({ queryKey: ['patient'] });
    queryClient.removeQueries({ queryKey: ['patient'] });
  }, [patientToken, queryClient]);

  const switchRole = () => {
    const queryKey = role === 'caregiver' ? ['caregiver'] : ['patient'];
    void queryClient.cancelQueries({ queryKey });
    queryClient.removeQueries({ queryKey });
    const nextRole: AppRole = role === 'caregiver' ? 'patient' : 'caregiver';
    setRole(nextRole);
    setRoute(getDefaultRoute(nextRole));
  };

  const navigateCaregiver = (nextRoute: CaregiverRoute) => setRoute(nextRoute);
  const navigatePatient = (nextRoute: PatientRoute) => setRoute(nextRoute);
  const { state: caregiverAuth, refreshProfile } = useCaregiverAuth();

  if (role === 'caregiver') {
    if (!isDevelopmentMockMode && caregiverAuth.kind === 'loading') {
      return <AppShell role="caregiver" tabs={caregiverTabs} activeRoute="home" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={false}><CaregiverLoadingScreen /></AppShell>;
    }
    if (!isDevelopmentMockMode && caregiverAuth.kind === 'signed-out') {
      return <AppShell role="caregiver" tabs={caregiverTabs} activeRoute="home" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={false}>{showRegistration ? <CaregiverRegistrationScreen configured={caregiverAuth.configured} onBack={() => setShowRegistration(false)} /> : <CaregiverSignInScreen configured={caregiverAuth.configured} onRegister={() => setShowRegistration(true)} />}</AppShell>;
    }
    if (!isDevelopmentMockMode && caregiverAuth.kind === 'signed-in' && caregiverAuth.profileStatus === 'checking') {
      return <AppShell role="caregiver" tabs={caregiverTabs} activeRoute="home" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={false}><CaregiverLoadingScreen /></AppShell>;
    }
    if (!isDevelopmentMockMode && caregiverAuth.kind === 'signed-in' && caregiverAuth.profileStatus === 'missing') {
      return <AppShell role="caregiver" tabs={caregiverTabs} activeRoute="home" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={false}><CaregiverProfileSetupScreen accessToken={caregiverAuth.accessToken} onComplete={() => { void refreshProfile(); }} /></AppShell>;
    }
    const showTabs = isCaregiverTabRoute(route);
    return (
      <AppShell
        role="caregiver"
        tabs={caregiverTabs}
        activeRoute={showTabs ? route : 'setup'}
        onNavigate={(nextRoute) => { if (isCaregiverTabRoute(nextRoute as AppRoute)) navigateCaregiver(nextRoute as CaregiverRoute); }}
        onSwitchRole={switchRole}
        showTabs={showTabs}
        showPreviewBar={shouldShowRoleSwitcher({ isDevelopmentBuild, showTabs })}
      >
        {route === 'home' && caregiverAuth.kind === 'signed-in' ? <CaregiverHomeScreen onNavigate={navigateCaregiver} accessToken={caregiverAuth.accessToken} caregiverId={caregiverAuth.user.id} /> : null}
        {route === 'home' && isDevelopmentMockMode ? <CaregiverHomeScreen onNavigate={navigateCaregiver} accessToken={null} caregiverId={null} /> : null}
        {route === 'history' ? <CaregiverHistoryScreen caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
        {route === 'family' ? <CaregiverFamilyScreen onOpenSetup={() => navigateCaregiver('setup')} caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
        {route === 'settings' ? <CaregiverSettingsScreen onOpenSetup={() => navigateCaregiver('setup')} onSwitchRole={switchRole} caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
        {route === 'setup' ? <CaregiverSetupScreen onBack={() => navigateCaregiver('settings')} onSaved={() => navigateCaregiver('family')} caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
      </AppShell>
    );
  }

  if (!isDevelopmentMockMode && patientDeviceLoading) return <AppShell role="patient" tabs={patientTabs} activeRoute="play" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={isDevelopmentBuild}><ConnectedFeatureState role="patient" title="Preparing this device" body="Checking whether this device is connected to a family…" /></AppShell>;
  if (!isDevelopmentMockMode && !patientToken) return <AppShell role="patient" tabs={patientTabs} activeRoute="play" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={isDevelopmentBuild}><PatientDeviceAccessScreen onBound={() => { void patientDeviceStore.getToken().then(setPatientToken); }} /></AppShell>;

  const showTabs = isPatientTabRoute(route) && !hidesPatientTabs(route);
  return (
    <AppShell
      role="patient"
      tabs={patientTabs}
      activeRoute={showTabs ? route : 'play'}
      onNavigate={(nextRoute) => { if (isPatientTabRoute(nextRoute as AppRoute)) navigatePatient(nextRoute as PatientRoute); }}
      onSwitchRole={switchRole}
      showTabs={showTabs}
      showPreviewBar={shouldShowRoleSwitcher({ isDevelopmentBuild, showTabs })}
    >
      {route === 'play' ? <PatientPlayScreen onNavigate={navigatePatient} patientToken={patientToken} onStart={(session, memories) => { setActiveGame({ patientToken, session, memories }); navigatePatient('in-game'); }} /> : null}
      {route === 'family' ? <PatientFamilyScreen patientToken={patientToken} /> : null}
      {route === 'help' ? <PatientHelpScreen onNavigate={navigatePatient} /> : null}
      {route === 'in-game' ? <PatientInGameScreen session={activeGame?.patientToken === patientToken ? activeGame.session : null} memories={activeGame?.patientToken === patientToken ? activeGame.memories : []} patientToken={patientToken} onComplete={() => navigatePatient('complete')} onExit={() => { setActiveGame(null); navigatePatient('play'); }} /> : null}
      {route === 'complete' ? <PatientCompleteScreen familyNames={isDevelopmentMockMode ? menteMockData.family.map(({ name }) => name) : activeGame?.patientToken === patientToken ? activeGame.memories.map(adaptMemoryToFamilyMember).map(({ name }) => name) : []} onReturnToPlay={() => { setActiveGame(null); navigatePatient('play'); }} onFamily={() => navigatePatient('family')} /> : null}
    </AppShell>
  );
}
