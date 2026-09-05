import { caregiverSettingsSchema } from './settingsSchema';

const validValues = {
  localTime: '09:00', timezone: 'Asia/Kolkata', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], quietStart: '', quietEnd: '',
  languageCode: 'en-IN', active: false, allowOneRetry: false, sameDayEnabled: true, routineEnabled: false,
  caregiverPhoneE164: '', remindersPaused: false,
};

describe('caregiverSettingsSchema', () => {
  it('requires at least one valid weekday and paired quiet hours', () => {
    const result = caregiverSettingsSchema.safeParse({ ...validValues, daysOfWeek: [], quietStart: '21:00' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(expect.arrayContaining(['daysOfWeek', 'quietEnd']));
    }
  });

  it('rejects malformed time and caregiver phone values before submit', () => {
    const result = caregiverSettingsSchema.safeParse({ ...validValues, localTime: '9am', caregiverPhoneE164: '555-0100' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(expect.arrayContaining(['localTime', 'caregiverPhoneE164']));
    }
  });
});
