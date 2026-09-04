export const caregiverSettingsKeys = {
  root: (caregiverId: string) => ['caregiver', caregiverId, 'settings'] as const,
  context: (caregiverId: string) => ['caregiver', caregiverId, 'settings', 'context'] as const,
  detail: (caregiverId: string, patientId: string) => ['caregiver', caregiverId, 'settings', patientId] as const,
};
