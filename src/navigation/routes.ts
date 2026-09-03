import type {
  AppRole,
  AppRoute,
  CaregiverRoute,
  CaregiverTabRoute,
  PatientRoute,
  PatientTabRoute,
  TabItem,
} from '../types';

export const caregiverTabs: readonly TabItem<CaregiverTabRoute>[] = [
  { route: 'home', label: 'Home', icon: 'home-outline' },
  { route: 'history', label: 'History', icon: 'time-outline' },
  { route: 'family', label: 'Family', icon: 'people-outline' },
  { route: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export const patientTabs: readonly TabItem<PatientTabRoute>[] = [
  { route: 'play', label: 'Play', icon: 'sparkles-outline' },
  { route: 'family', label: 'Family', icon: 'people-outline' },
  { route: 'help', label: 'Help', icon: 'help-circle-outline' },
];

export function getDefaultRoute(role: 'caregiver'): CaregiverRoute;
export function getDefaultRoute(role: 'patient'): PatientRoute;
export function getDefaultRoute(role: AppRole): AppRoute;
export function getDefaultRoute(role: AppRole): AppRoute {
  return role === 'caregiver' ? 'home' : 'play';
}

export function getRoleTabs(role: 'caregiver'): readonly TabItem<CaregiverTabRoute>[];
export function getRoleTabs(role: 'patient'): readonly TabItem<PatientTabRoute>[];
export function getRoleTabs(role: AppRole): readonly TabItem[];
export function getRoleTabs(role: AppRole): readonly TabItem[] {
  return role === 'caregiver' ? caregiverTabs : patientTabs;
}

export function isCaregiverTabRoute(route: AppRoute): route is CaregiverTabRoute {
  return caregiverTabs.some((tab) => tab.route === route);
}

export function isPatientTabRoute(route: AppRoute): route is PatientTabRoute {
  return patientTabs.some((tab) => tab.route === route);
}
