import type { FieldPath } from 'react-hook-form';

export interface CaregiverSetupFormFields {
  familyName: string;
  preferredName: string;
  legalName?: string;
  phoneE164: string;
  timezone: string;
  languageCode: string;
}

export function toSetupFormField(field: string): FieldPath<CaregiverSetupFormFields> {
  if (field === 'name') return 'familyName';
  if (field === 'preferredLanguage') return 'languageCode';
  if (field === 'preferred_name') return 'preferredName';
  if (field === 'phone_e164') return 'phoneE164';
  if (field === 'legal_name') return 'legalName';
  if (field === 'preferred_language') return 'languageCode';
  return field as FieldPath<CaregiverSetupFormFields>;
}
