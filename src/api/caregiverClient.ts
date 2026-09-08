import { getApiBaseUrl } from './config';
import type { AssetDto, AssetSignedUrlDto, CaregiverUserDto, DevelopmentAccessCodeDto, FamilyDto, PatientDto, PatientOverviewDto, SessionDto } from './contracts/caregiver';
import type { MemoryDto } from './contracts/patient';
import type {
  CallScheduleDto,
  CallScheduleUpsertDto,
  NotificationPreferenceDto,
  NotificationPreferenceUpsertDto,
} from './contracts/settings';
import { createHttpClient } from './http';
import { getSupabaseClient } from '../auth/supabase';

export interface CaregiverClient {
  getMe(signal?: AbortSignal): Promise<CaregiverUserDto>;
  createProfile(input: { display_name: string }): Promise<CaregiverUserDto>;
  createFamily(input: { name: string; mode: 'SOLO' | 'GROUP' }): Promise<FamilyDto>;
  createPatient(familyId: string, input: { preferred_name: string; legal_name?: string | null; phone_e164?: string | null; timezone: string; preferred_language: string; high_energy_local_time?: string | null }): Promise<PatientDto>;
  getOverview(patientId: string, signal?: AbortSignal): Promise<PatientOverviewDto>;
  listAssets(patientId: string, signal?: AbortSignal): Promise<AssetDto[]>;
  getAssetSignedUrl(patientId: string, assetId: string): Promise<AssetSignedUrlDto>;
  deleteAsset(patientId: string, assetId: string): Promise<{ message: string }>;
  listFamilies(signal?: AbortSignal): Promise<FamilyDto[]>;
  listFamilyPatients(familyId: string, signal?: AbortSignal): Promise<PatientDto[]>;
  getDevelopmentAccessCode(patientId: string, signal?: AbortSignal): Promise<DevelopmentAccessCodeDto>;
  listSessions(patientId: string, source?: 'CALL' | 'GAME', signal?: AbortSignal): Promise<SessionDto[]>;
  listMemories(patientId: string, signal?: AbortSignal): Promise<MemoryDto[]>;
  listAlerts(patientId: string, signal?: AbortSignal): Promise<import('./contracts/caregiver').AlertDto[]>;
  acknowledgeAlert(patientId: string, alertId: string): Promise<import('./contracts/caregiver').AlertDto>;
  getCallSchedule(patientId: string, signal?: AbortSignal): Promise<CallScheduleDto | null>;
  updateCallSchedule(patientId: string, input: CallScheduleUpsertDto): Promise<CallScheduleDto>;
  getNotificationPreferences(patientId: string, signal?: AbortSignal): Promise<NotificationPreferenceDto | null>;
  updateNotificationPreferences(patientId: string, input: NotificationPreferenceUpsertDto): Promise<NotificationPreferenceDto>;
}

export function createCaregiverClient(accessToken: string): CaregiverClient {
  const http = createHttpClient({
    baseUrl: getApiBaseUrl(),
    getHeaders: (accessTokenOverride) => ({ Authorization: `Bearer ${accessTokenOverride ?? accessToken}` }),
    refreshAccessToken: async () => {
      const client = getSupabaseClient();
      if (!client) return null;
      const { data, error } = await client.auth.refreshSession();
      return error ? null : data.session?.access_token ?? null;
    },
  });
  return {
    getMe: (signal) => http.get('/auth/me', { signal }),
    createProfile: (input) => http.post('/auth/profile', { body: input }),
    createFamily: (input) => http.post('/families', { body: input }),
    createPatient: (familyId, input) => http.post(`/families/${encodeURIComponent(familyId)}/patients`, { body: input }),
    getOverview: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/overview`, { signal }),
    listAssets: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/assets`, { signal }),
    getAssetSignedUrl: (patientId, assetId) => http.post(`/patients/${encodeURIComponent(patientId)}/assets/${encodeURIComponent(assetId)}/signed-url`),
    deleteAsset: (patientId, assetId) => http.delete(`/patients/${encodeURIComponent(patientId)}/assets/${encodeURIComponent(assetId)}`),
    listFamilies: (signal) => http.get('/families', { signal }),
    listFamilyPatients: (familyId, signal) => http.get(`/families/${encodeURIComponent(familyId)}/patients`, { signal }),
    getDevelopmentAccessCode: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/development-access-code`, { signal }),
    listSessions: (patientId, source, signal) => {
      const query = source ? `?source=${source}` : '';
      return http.get(`/patients/${encodeURIComponent(patientId)}/sessions${query}`, { signal });
    },
    listMemories: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/memories?active_only=true`, { signal }),
    listAlerts: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/alerts`, { signal }),
    acknowledgeAlert: (patientId, alertId) => http.post(`/patients/${encodeURIComponent(patientId)}/alerts/${encodeURIComponent(alertId)}/acknowledge`),
    getCallSchedule: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/call-schedule`, { signal }),
    updateCallSchedule: (patientId, input) => http.put(`/patients/${encodeURIComponent(patientId)}/call-schedule`, { body: input }),
    getNotificationPreferences: (patientId, signal) => http.get(`/patients/${encodeURIComponent(patientId)}/notification-preferences`, { signal }),
    updateNotificationPreferences: (patientId, input) => http.put(`/patients/${encodeURIComponent(patientId)}/notification-preferences`, { body: input }),
  };
}
