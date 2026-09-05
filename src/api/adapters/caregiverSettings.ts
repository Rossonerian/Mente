import type { PatientDto } from '../contracts/caregiver';
import type {
  CallScheduleDto,
  CallScheduleUpsertDto,
  NotificationPreferenceDto,
  NotificationPreferenceUpsertDto,
} from '../contracts/settings';

export interface CaregiverSettingsFormValues {
  localTime: string;
  timezone: string;
  daysOfWeek: number[];
  quietStart: string;
  quietEnd: string;
  languageCode: string;
  active: boolean;
  allowOneRetry: boolean;
  sameDayEnabled: boolean;
  routineEnabled: boolean;
  caregiverPhoneE164: string;
  remindersPaused: boolean;
}

export interface CaregiverSettingsViewModel extends CaregiverSettingsFormValues {
  patientId: string;
  patientName: string;
  patientPhoneConfigured: boolean;
  scheduleUpdatedAt?: string;
  notificationUpdatedAt?: string;
  hasSavedSettings: boolean;
}

type SettingsPatient = Pick<PatientDto, 'id' | 'preferred_name' | 'phone_e164' | 'timezone'>;

export function createDefaultCaregiverSettings(patient: SettingsPatient): CaregiverSettingsViewModel {
  return {
    patientId: patient.id,
    patientName: patient.preferred_name,
    patientPhoneConfigured: Boolean(patient.phone_e164),
    localTime: '09:00',
    timezone: patient.timezone,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    quietStart: '',
    quietEnd: '',
    languageCode: 'en-IN',
    active: false,
    allowOneRetry: false,
    sameDayEnabled: true,
    routineEnabled: false,
    caregiverPhoneE164: '',
    remindersPaused: false,
    hasSavedSettings: false,
  };
}

export function adaptCaregiverSettings({
  patient,
  schedule,
  notificationPreference,
}: {
  patient: SettingsPatient;
  schedule: CallScheduleDto | null;
  notificationPreference: NotificationPreferenceDto | null;
}): CaregiverSettingsViewModel {
  const defaults = createDefaultCaregiverSettings(patient);
  return {
    ...defaults,
    localTime: schedule?.local_time ?? defaults.localTime,
    timezone: schedule?.timezone ?? defaults.timezone,
    daysOfWeek: schedule?.days_of_week ?? defaults.daysOfWeek,
    quietStart: schedule?.quiet_start ?? '',
    quietEnd: schedule?.quiet_end ?? '',
    languageCode: schedule?.language_code ?? defaults.languageCode,
    active: schedule?.active ?? defaults.active,
    allowOneRetry: schedule?.allow_one_retry ?? defaults.allowOneRetry,
    sameDayEnabled: notificationPreference?.same_day_enabled ?? defaults.sameDayEnabled,
    routineEnabled: notificationPreference?.routine_enabled ?? defaults.routineEnabled,
    caregiverPhoneE164: notificationPreference?.caregiver_phone_e164 ?? '',
    remindersPaused: notificationPreference?.reminders_paused ?? defaults.remindersPaused,
    scheduleUpdatedAt: schedule?.updated_at,
    notificationUpdatedAt: notificationPreference?.updated_at,
    hasSavedSettings: Boolean(schedule || notificationPreference),
  };
}

export function toCaregiverSettingsRequests(values: CaregiverSettingsFormValues): {
  schedule: CallScheduleUpsertDto;
  notificationPreference: NotificationPreferenceUpsertDto;
} {
  return {
    schedule: {
      local_time: values.localTime.trim(),
      timezone: values.timezone.trim(),
      days_of_week: [...new Set(values.daysOfWeek)].sort((a, b) => a - b),
      quiet_start: emptyToNull(values.quietStart),
      quiet_end: emptyToNull(values.quietEnd),
      language_code: values.languageCode.trim(),
      active: values.active,
      allow_one_retry: values.allowOneRetry,
    },
    notificationPreference: {
      same_day_enabled: values.sameDayEnabled,
      routine_enabled: values.routineEnabled,
      caregiver_phone_e164: emptyToNull(values.caregiverPhoneE164),
      reminders_paused: values.remindersPaused,
    },
  };
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}
