import {
  adaptCaregiverSettings,
  createDefaultCaregiverSettings,
  toCaregiverSettingsRequests,
} from './caregiverSettings';

describe('caregiver settings adapters', () => {
  it('adapts the two FastAPI settings resources into one settings form model', () => {
    expect(adaptCaregiverSettings({
      patient: { id: 'patient-1', preferred_name: 'Asha', phone_e164: '+919999999999', timezone: 'Asia/Kolkata' },
      schedule: {
        id: 'schedule-1', patient_id: 'patient-1', local_time: '09:30', timezone: 'Asia/Kolkata',
        days_of_week: [0, 2, 4], quiet_start: '21:00', quiet_end: '07:00', language_code: 'en-IN',
        active: true, allow_one_retry: true, updated_at: '2026-01-01T00:00:00Z',
      },
      notificationPreference: {
        patient_id: 'patient-1', same_day_enabled: true, routine_enabled: false,
        caregiver_phone_e164: '+918888888888', reminders_paused: false, updated_at: '2026-01-01T00:00:00Z',
      },
    })).toMatchObject({
      patientId: 'patient-1', patientName: 'Asha', localTime: '09:30', daysOfWeek: [0, 2, 4],
      active: true, sameDayEnabled: true, caregiverPhoneE164: '+918888888888',
    });
  });

  it('uses documented FastAPI defaults when neither resource exists yet', () => {
    expect(createDefaultCaregiverSettings({ id: 'patient-1', preferred_name: 'Asha', phone_e164: null, timezone: 'Asia/Kolkata' }))
      .toMatchObject({ localTime: '09:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], active: false, sameDayEnabled: true });
  });

  it('maps camel-case form values to the exact schedule and notification request payloads', () => {
    expect(toCaregiverSettingsRequests({
      localTime: '09:30', timezone: 'Asia/Kolkata', daysOfWeek: [0, 2, 4], quietStart: '21:00', quietEnd: '07:00',
      languageCode: 'en-IN', active: true, allowOneRetry: true, sameDayEnabled: true, routineEnabled: false,
      caregiverPhoneE164: '+918888888888', remindersPaused: false,
    })).toEqual({
      schedule: { local_time: '09:30', timezone: 'Asia/Kolkata', days_of_week: [0, 2, 4], quiet_start: '21:00', quiet_end: '07:00', language_code: 'en-IN', active: true, allow_one_retry: true },
      notificationPreference: { same_day_enabled: true, routine_enabled: false, caregiver_phone_e164: '+918888888888', reminders_paused: false },
    });
  });
});
