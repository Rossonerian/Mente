export interface CallScheduleUpsertDto {
  local_time: string;
  timezone: string;
  days_of_week: number[];
  quiet_start: string | null;
  quiet_end: string | null;
  language_code: string;
  active: boolean;
  allow_one_retry: boolean;
}

export interface CallScheduleDto extends CallScheduleUpsertDto {
  id: string;
  patient_id: string;
  updated_at: string;
}

export interface NotificationPreferenceUpsertDto {
  same_day_enabled: boolean;
  routine_enabled: boolean;
  caregiver_phone_e164: string | null;
  reminders_paused: boolean;
}

export interface NotificationPreferenceDto extends NotificationPreferenceUpsertDto {
  patient_id: string;
  updated_at: string;
}
