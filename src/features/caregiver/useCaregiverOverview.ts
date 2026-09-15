import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { adaptCaregiverOverview, type CaregiverOverviewViewModel } from '../../api/adapters/caregiverOverview';
import { createCaregiverClient } from '../../api/caregiverClient';
import { isDevelopmentMockMode } from '../../api/config';
import { ApiError } from '../../api/errors';
import { menteMockData } from '../../data/mockData';
import { caregiverContextKey } from './useCaregiverContext';
import { loadCaregiverContext } from './loadCaregiverContext';

export type CaregiverOverviewState =
  | { kind: 'mock'; data: typeof menteMockData }
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'profile-required'; retry: () => void }
  | { kind: 'error'; error: ApiError; retry: () => void; staleData?: CaregiverOverviewViewModel }
  | { kind: 'ready'; data: CaregiverOverviewViewModel; isRefreshing: boolean; refresh: () => void };

export function useCaregiverOverview(accessToken: string | null, caregiverId: string | null): CaregiverOverviewState {
  const client = useMemo(() => {
    if (!accessToken || isDevelopmentMockMode) return null;
    try {
      return createCaregiverClient(accessToken);
    } catch {
      return null;
    }
  }, [accessToken]);
  const context = useQuery({
    queryKey: caregiverContextKey(caregiverId ?? 'anonymous'),
    queryFn: ({ signal }) => loadCaregiverContext(client!, signal),
    enabled: Boolean(client),
    staleTime: 60_000,
  });
  const patientId = context.data?.patient.id;
  const overview = useQuery({
    queryKey: ['caregiver', caregiverId ?? 'anonymous', 'patient', patientId, 'overview'],
    queryFn: ({ signal }) => client!.getOverview(patientId!, signal),
    enabled: Boolean(client && patientId),
    staleTime: 60_000,
  });

  if (isDevelopmentMockMode) return { kind: 'mock', data: menteMockData };
  if (!accessToken) return { kind: 'loading' };
  const retry = () => { void context.refetch(); if (patientId) void overview.refetch(); };
  const error = getApiError(context.error) ?? getApiError(overview.error);
  if (error?.kind === 'forbidden' && error.code === 'CAREGIVER_PROFILE_NOT_PROVISIONED') {
    return { kind: 'profile-required', retry };
  }
  if (error) {
    const staleData = overview.data ? adaptCaregiverOverview(overview.data, new Date(overview.dataUpdatedAt)) : undefined;
    return { kind: 'error', error, retry, staleData };
  }
  if (context.isPending) return { kind: 'loading' };
  if (!context.data) return { kind: 'empty' };
  if (overview.isPending) return { kind: 'loading' };
  if (!patientId || !overview.data) return { kind: 'empty' };
  return {
    kind: 'ready',
    data: adaptCaregiverOverview(overview.data, new Date(overview.dataUpdatedAt)),
    isRefreshing: overview.isFetching || context.isFetching,
    refresh: retry,
  };
}

function getApiError(error: unknown): ApiError | null {
  return error instanceof ApiError ? error : null;
}
