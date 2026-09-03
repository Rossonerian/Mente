import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { caregiverTabs, getDefaultRoute, isCaregiverTabRoute, isPatientTabRoute, patientTabs } from './routes';
import { hidesPatientTabs } from './interaction';
import { CaregiverFamilyScreen } from '../screens/caregiver/CaregiverFamilyScreen';
import { CaregiverHistoryScreen } from '../screens/caregiver/CaregiverHistoryScreen';
import { CaregiverHomeScreen } from '../screens/caregiver/CaregiverHomeScreen';
import { CaregiverSettingsScreen } from '../screens/caregiver/CaregiverSettingsScreen';
import { CaregiverSetupScreen } from '../screens/caregiver/CaregiverSetupScreen';
import { PatientCompleteScreen } from '../screens/patient/PatientCompleteScreen';
import { PatientFamilyScreen } from '../screens/patient/PatientFamilyScreen';
import { PatientHelpScreen } from '../screens/patient/PatientHelpScreen';
import { PatientInGameScreen } from '../screens/patient/PatientInGameScreen';
import { PatientPlayScreen } from '../screens/patient/PatientPlayScreen';
import type { AppRole, AppRoute, CaregiverRoute, PatientRoute } from '../types';

export function AppRouter() {
  const [role, setRole] = useState<AppRole>('caregiver');
  const [route, setRoute] = useState<AppRoute>(getDefaultRoute('caregiver'));

  const switchRole = () => {
    const nextRole: AppRole = role === 'caregiver' ? 'patient' : 'caregiver';
    setRole(nextRole);
    setRoute(getDefaultRoute(nextRole));
  };

  const navigateCaregiver = (nextRoute: CaregiverRoute) => setRoute(nextRoute);
  const navigatePatient = (nextRoute: PatientRoute) => setRoute(nextRoute);

  if (role === 'caregiver') {
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
        {route === 'home' ? <CaregiverHomeScreen onNavigate={navigateCaregiver} /> : null}
        {route === 'history' ? <CaregiverHistoryScreen /> : null}
        {route === 'family' ? <CaregiverFamilyScreen onOpenSetup={() => navigateCaregiver('setup')} /> : null}
        {route === 'settings' ? <CaregiverSettingsScreen onOpenSetup={() => navigateCaregiver('setup')} onSwitchRole={switchRole} /> : null}
        {route === 'setup' ? <CaregiverSetupScreen onBack={() => navigateCaregiver('settings')} /> : null}
      </AppShell>
    );
  }

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
      {route === 'play' ? <PatientPlayScreen onNavigate={navigatePatient} /> : null}
      {route === 'family' ? <PatientFamilyScreen /> : null}
      {route === 'help' ? <PatientHelpScreen onNavigate={navigatePatient} /> : null}
      {route === 'in-game' ? <PatientInGameScreen onComplete={() => navigatePatient('complete')} /> : null}
      {route === 'complete' ? <PatientCompleteScreen onReturnToPlay={() => navigatePatient('play')} onFamily={() => navigatePatient('family')} /> : null}
    </AppShell>
  );
}
