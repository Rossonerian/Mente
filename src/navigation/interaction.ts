import type { PatientRoute } from '../types';

export function getNextPromptIndex(currentIndex: number, promptCount: number): number | null {
  if (promptCount <= 0 || currentIndex < 0 || currentIndex >= promptCount - 1) return null;
  return currentIndex + 1;
}

export function hidesPatientTabs(route: PatientRoute): boolean {
  return route === 'in-game' || route === 'complete';
}
