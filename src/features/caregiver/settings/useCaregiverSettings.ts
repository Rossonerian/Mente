import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import {
  adaptCaregiverSettings,
  type CaregiverSettingsFormValues,
  type CaregiverSettingsViewModel,
  toCaregiverSettingsRequests,
} from '../../../api/adapters/caregiverSettings';
import { createCaregiverClient, type CaregiverClient } from '../../../api/caregiverClient';
import { ApiError } from '../../../api/errors';
import type { CallScheduleDto, NotificationPreferenceDto } from '../../../api/contracts/settings';
import { caregiverSettingsKeys } from './queryKeys';
import { loadCaregiverContext } from '../loadCaregiverContext';

export type CaregiverSettingsState =
  | { kind: 'loading' }
  | { kind: 'empty'; retry: () => void }
  | { kind: 'session-expired' }
  | { kind: 'forbidden' }
  | { kind: 'offline'; retry: () => void; staleData?: CaregiverSettingsViewModel }
  | { kind: 'error'; error: ApiError; retry: () => void; staleData?: CaregiverSettingsViewModel }
  | { kind: 'ready'; data: CaregiverSettingsViewModel; isRefreshing: boolean; refresh: () => void; isStale: boolean };

interface SettingsContext {
  patient: { id: string; preferred_name: string; phone_e164: string | null; timezone: string };
}

interface SettingsResources {
  schedule: CallScheduleDto | null;
  notificationPreference: NotificationPreferenceDto | null;
}

interface UpdateSettingsInput {
  patientId: string;
  values: CaregiverSettingsFormValues;
  updateSchedule: boolean;
  updateNotificationPreference: boolean;
}

export function isCurrentCaregiverSession(
  current: { caregiverId: string; accessToken: string },
  expected: { caregiverId: string; accessToken: string },
): boolean {
  return current.caregiverId === expected.caregiverId && current.accessToken === expected.accessToken;
}

export interface UpdateSettingsResult {
  schedule?: CallScheduleDto;
  notificationPreference?: NotificationPreferenceDto;
}

export function useCaregiverSettingsQuery({ caregiverId, accessToken }: { caregiverId: string; accessToken: string }): CaregiverSettingsState {
  const clientResult = useMemo((): { client: CaregiverClient | null; configurationError: ApiError | null } => {
    try {
      return { client: createCaregiverClient(accessToken), configurationError: null };
    } catch (error) {
      return { client: null, configurationError: error instanceof ApiError ? error : new ApiError({ kind: 'configuration', message: 'Mente is not configured for live data.' }) };
    }
  }, [accessToken]);
  const { client } = clientResult;
  const context = useQuery({
    queryKey: caregiverSettingsKeys.context(caregiverId),
    enabled: Boolean(client),
    queryFn: async ({ signal }): Promise<SettingsContext | null> => {
      return loadCaregiverContext(client!, signal);
    },
  });
  const patientId = context.data?.patient.id;
  const resources = useQuery({
    queryKey: caregiverSettingsKeys.detail(caregiverId, patientId ?? 'none'),
    enabled: Boolean(patientId),
    queryFn: async ({ signal }): Promise<SettingsResources> => {
      const [schedule, notificationPreference] = await Promise.all([
        client!.getCallSchedule(patientId!, signal),
        client!.getNotificationPreferences(patientId!, signal),
      ]);
      return { schedule, notificationPreference };
    },
  });

  const staleData = context.data?.patient && resources.data
    ? adaptCaregiverSettings({ patient: context.data.patient, ...resources.data })
    : undefined;
  const retry = () => void Promise.all([context.refetch(), resources.refetch()]);
  const error = clientResult.configurationError ?? asApiError(context.error) ?? asApiError(resources.error);
  if (error?.kind === 'unauthorized') return { kind: 'session-expired' };
  if (error?.kind === 'forbidden') return { kind: 'forbidden' };
  if (error?.kind === 'offline') return { kind: 'offline', retry, staleData };
  if (error) return { kind: 'error', error, retry, staleData };
  if (context.isPending || (patientId && resources.isPending)) return { kind: 'loading' };
  if (!context.data || !resources.data) return { kind: 'empty', retry };
  const data = staleData!;
  return {
    kind: 'ready',
    data,
    isRefreshing: resources.isFetching || context.isFetching,
    refresh: () => void Promise.all([context.refetch(), resources.refetch()]),
    isStale: resources.isStale || context.isStale,
  };
}

export function useUpdateCaregiverSettingsMutation({ caregiverId, accessToken }: { caregiverId: string; accessToken: string }) {
  const queryClient = useQueryClient();
  const client = useMemo(() => createCaregiverClient(accessToken), [accessToken]);
  const currentSession = useRef({ caregiverId, accessToken });
  useEffect(() => {
    currentSession.current = { caregiverId, accessToken };
  }, [accessToken, caregiverId]);
  const isCurrentSession = () => isCurrentCaregiverSession(currentSession.current, { caregiverId, accessToken });
  return useMutation({
    mutationFn: async ({ patientId, values, updateSchedule, updateNotificationPreference }: UpdateSettingsInput): Promise<UpdateSettingsResult> => {
      const requests = toCaregiverSettingsRequests(values);
      const result: UpdateSettingsResult = {};
      if (updateSchedule) result.schedule = await client.updateCallSchedule(patientId, requests.schedule);
      if (updateNotificationPreference) result.notificationPreference = await client.updateNotificationPreferences(patientId, requests.notificationPreference);
      return result;
    },
    onSuccess: (result, input) => {
      if (!isCurrentSession()) return;
      applySettingsSaveSuccess(queryClient, caregiverId, input.patientId, result);
    },
    onError: (_error, input) => {
      if (!isCurrentSession()) return;
      void queryClient.invalidateQueries({ queryKey: caregiverSettingsKeys.detail(caregiverId, input.patientId) });
    },
  });
}

export function applySettingsSaveSuccess(
  queryClient: QueryClient,
  caregiverId: string,
  patientId: string,
  result: UpdateSettingsResult,
): void {
  const queryKey = caregiverSettingsKeys.detail(caregiverId, patientId);
  queryClient.setQueryData<SettingsResources>(queryKey, (current) => ({
    schedule: result.schedule ?? current?.schedule ?? null,
    notificationPreference: result.notificationPreference ?? current?.notificationPreference ?? null,
  }));
  void queryClient.invalidateQueries({ queryKey });
}

export function mergeSavedFormValues(
  values: CaregiverSettingsFormValues,
  result: UpdateSettingsResult,
): CaregiverSettingsFormValues {
  return {
    ...values,
    ...(result.schedule ? {
      localTime: result.schedule.local_time,
      timezone: result.schedule.timezone,
      daysOfWeek: result.schedule.days_of_week,
      quietStart: result.schedule.quiet_start ?? '',
      quietEnd: result.schedule.quiet_end ?? '',
      languageCode: result.schedule.language_code,
      active: result.schedule.active,
      allowOneRetry: result.schedule.allow_one_retry,
    } : {}),
    ...(result.notificationPreference ? {
      sameDayEnabled: result.notificationPreference.same_day_enabled,
      routineEnabled: result.notificationPreference.routine_enabled,
      caregiverPhoneE164: result.notificationPreference.caregiver_phone_e164 ?? '',
      remindersPaused: result.notificationPreference.reminders_paused,
    } : {}),
  };
}

function asApiError(error: unknown): ApiError | null {
  return error instanceof ApiError ? error : null;
}
