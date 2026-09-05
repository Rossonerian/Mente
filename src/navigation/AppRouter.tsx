<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
=======
import { useState } from 'react';
>>>>>>> origin/new_components
import { AppShell } from '../components/AppShell';
import { caregiverTabs, getDefaultRoute, isCaregiverTabRoute, isPatientTabRoute, patientTabs } from './routes';
import { hidesPatientTabs } from './interaction';
import { CaregiverFamilyScreen } from '../screens/caregiver/CaregiverFamilyScreen';
import { CaregiverHistoryScreen } from '../screens/caregiver/CaregiverHistoryScreen';
import { CaregiverHomeScreen } from '../screens/caregiver/CaregiverHomeScreen';
import { CaregiverSettingsScreen } from '../screens/caregiver/CaregiverSettingsScreen';
import { CaregiverSetupScreen } from '../screens/caregiver/CaregiverSetupScreen';
<<<<<<< HEAD
import { CaregiverLoadingScreen, CaregiverSignInScreen } from '../screens/caregiver/CaregiverAccessScreen';
=======
>>>>>>> origin/new_components
import { PatientCompleteScreen } from '../screens/patient/PatientCompleteScreen';
import { PatientFamilyScreen } from '../screens/patient/PatientFamilyScreen';
import { PatientHelpScreen } from '../screens/patient/PatientHelpScreen';
import { PatientInGameScreen } from '../screens/patient/PatientInGameScreen';
import { PatientPlayScreen } from '../screens/patient/PatientPlayScreen';
import type { AppRole, AppRoute, CaregiverRoute, PatientRoute } from '../types';
<<<<<<< HEAD
import { useCaregiverAuth } from '../auth/CaregiverAuthContext';
import { isDevelopmentMockMode } from '../api/config';
import { ConnectedFeatureState } from '../screens/ConnectedFeatureState';
import { PatientDeviceAccessScreen } from '../screens/patient/PatientDeviceAccessScreen';
import { patientDeviceStore } from '../auth/patientDeviceStore';
import type { MemoryDto, PatientSessionDto } from '../api/contracts/patient';

export function AppRouter() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<AppRole>('caregiver');
  const [route, setRoute] = useState<AppRoute>(getDefaultRoute('caregiver'));
  const [patientToken, setPatientToken] = useState<string | null>(null);
  const [patientDeviceLoading, setPatientDeviceLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<{ session: PatientSessionDto; memories: MemoryDto[] } | null>(null);

  useEffect(() => {
    let active = true;
    patientDeviceStore.getToken().then((token) => { if (active) setPatientToken(token); }).finally(() => { if (active) setPatientDeviceLoading(false); });
    return () => { active = false; };
  }, []);

  const switchRole = () => {
    if (role === 'caregiver') queryClient.removeQueries({ queryKey: ['caregiver'] });
=======

export function AppRouter() {
  const [role, setRole] = useState<AppRole>('caregiver');
  const [route, setRoute] = useState<AppRoute>(getDefaultRoute('caregiver'));

  const switchRole = () => {
>>>>>>> origin/new_components
    const nextRole: AppRole = role === 'caregiver' ? 'patient' : 'caregiver';
    setRole(nextRole);
    setRoute(getDefaultRoute(nextRole));
  };

  const navigateCaregiver = (nextRoute: CaregiverRoute) => setRoute(nextRoute);
  const navigatePatient = (nextRoute: PatientRoute) => setRoute(nextRoute);
<<<<<<< HEAD
  const { state: caregiverAuth } = useCaregiverAuth();

  if (role === 'caregiver') {
    if (!isDevelopmentMockMode && caregiverAuth.kind === 'loading') {
      return <AppShell role="caregiver" tabs={caregiverTabs} activeRoute="home" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false}><CaregiverLoadingScreen /></AppShell>;
    }
    if (!isDevelopmentMockMode && caregiverAuth.kind === 'signed-out') {
      return <AppShell role="caregiver" tabs={caregiverTabs} activeRoute="home" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false}><CaregiverSignInScreen configured={caregiverAuth.configured} /></AppShell>;
    }
=======

  if (role === 'caregiver') {
>>>>>>> origin/new_components
    const showTabs = isCaregiverTabRoute(route);
    return (
      <AppShell
        role="caregiver"
        tabs={caregiverTabs}
        activeRoute={showTabs ? route : 'setup'}
        onNavigate={(nextRoute) => { if (isCaregiverTabRoute(nextRoute as AppRoute)) navigateCaregiver(nextRoute as CaregiverRoute); }}
        onSwitchRole={switchRole}
        showTabs={showTabs}
        showPreviewBar={showTabs}
      >
<<<<<<< HEAD
        {route === 'home' && caregiverAuth.kind === 'signed-in' ? <CaregiverHomeScreen onNavigate={navigateCaregiver} accessToken={caregiverAuth.accessToken} caregiverId={caregiverAuth.user.id} /> : null}
        {route === 'home' && isDevelopmentMockMode ? <CaregiverHomeScreen onNavigate={navigateCaregiver} accessToken={null} caregiverId={null} /> : null}
        {route === 'history' ? <CaregiverHistoryScreen caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
        {route === 'family' ? <CaregiverFamilyScreen onOpenSetup={() => navigateCaregiver('setup')} caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
        {route === 'settings' ? <CaregiverSettingsScreen onOpenSetup={() => navigateCaregiver('setup')} onSwitchRole={switchRole} caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
        {route === 'setup' ? <CaregiverSetupScreen onBack={() => navigateCaregiver('settings')} caregiverId={caregiverAuth.kind === 'signed-in' ? caregiverAuth.user.id : null} accessToken={caregiverAuth.kind === 'signed-in' ? caregiverAuth.accessToken : null} /> : null}
=======
        {route === 'home' ? <CaregiverHomeScreen onNavigate={navigateCaregiver} /> : null}
        {route === 'history' ? <CaregiverHistoryScreen /> : null}
        {route === 'family' ? <CaregiverFamilyScreen onOpenSetup={() => navigateCaregiver('setup')} /> : null}
        {route === 'settings' ? <CaregiverSettingsScreen onOpenSetup={() => navigateCaregiver('setup')} onSwitchRole={switchRole} /> : null}
        {route === 'setup' ? <CaregiverSetupScreen onBack={() => navigateCaregiver('settings')} /> : null}
>>>>>>> origin/new_components
      </AppShell>
    );
  }

<<<<<<< HEAD
  if (!isDevelopmentMockMode && patientDeviceLoading) return <AppShell role="patient" tabs={patientTabs} activeRoute="play" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false}><ConnectedFeatureState role="patient" title="Preparing this device" body="Checking whether this device is connected to a family…" /></AppShell>;
  if (!isDevelopmentMockMode && !patientToken) return <AppShell role="patient" tabs={patientTabs} activeRoute="play" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false}><PatientDeviceAccessScreen onBound={() => { void patientDeviceStore.getToken().then(setPatientToken); }} /></AppShell>;

=======
>>>>>>> origin/new_components
  const showTabs = isPatientTabRoute(route) && !hidesPatientTabs(route);
  return (
    <AppShell
      role="patient"
      tabs={patientTabs}
      activeRoute={showTabs ? route : 'play'}
      onNavigate={(nextRoute) => { if (isPatientTabRoute(nextRoute as AppRoute)) navigatePatient(nextRoute as PatientRoute); }}
      onSwitchRole={switchRole}
      showTabs={showTabs}
      showPreviewBar={showTabs}
    >
<<<<<<< HEAD
      {route === 'play' ? <PatientPlayScreen onNavigate={navigatePatient} patientToken={patientToken} onStart={(session, memories) => { setActiveGame({ session, memories }); navigatePatient('in-game'); }} /> : null}
      {route === 'family' ? <PatientFamilyScreen patientToken={patientToken} /> : null}
      {route === 'help' ? <PatientHelpScreen onNavigate={navigatePatient} /> : null}
      {route === 'in-game' ? <PatientInGameScreen session={activeGame?.session} memories={activeGame?.memories} patientToken={patientToken} onComplete={() => navigatePatient('complete')} /> : null}
      {route === 'complete' ? <PatientCompleteScreen onReturnToPlay={() => { setActiveGame(null); navigatePatient('play'); }} onFamily={() => navigatePatient('family')} /> : null}
=======
      {route === 'play' ? <PatientPlayScreen onNavigate={navigatePatient} /> : null}
      {route === 'family' ? <PatientFamilyScreen /> : null}
      {route === 'help' ? <PatientHelpScreen onNavigate={navigatePatient} /> : null}
      {route === 'in-game' ? <PatientInGameScreen onComplete={() => navigatePatient('complete')} /> : null}
      {route === 'complete' ? <PatientCompleteScreen onReturnToPlay={() => navigatePatient('play')} onFamily={() => navigatePatient('family')} /> : null}
>>>>>>> origin/new_components
    </AppShell>
  );
}
