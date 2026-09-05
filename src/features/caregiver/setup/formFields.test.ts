import { toSetupFormField } from './formFields';

describe('caregiver setup validation mapping', () => {
  it('maps FastAPI family and patient field names to the matching form fields', () => {
    expect(toSetupFormField('name')).toBe('familyName');
    expect(toSetupFormField('preferredLanguage')).toBe('languageCode');
    expect(toSetupFormField('phoneE164')).toBe('phoneE164');
  });
});
