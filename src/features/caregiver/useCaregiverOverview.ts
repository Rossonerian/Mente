import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { adaptCaregiverOverview, type CaregiverOverviewViewModel } from '../../api/adapters/caregiverOverview';
import { createCaregiverClient } from '../../api/caregiverClient';
import { isDevelopmentMockMode } from '../../api/config';
import { ApiError } from '../../api/errors';
import { menteMockData } from '../../data/mockData';

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
  const families = useQuery({
    queryKey: ['caregiver', caregiverId ?? 'anonymous', 'families'],
    queryFn: ({ signal }) => client!.listFamilies(signal),
    enabled: Boolean(client),
    staleTime: 60_000,
  });
  const familyId = families.data?.[0]?.id;
  const patients = useQuery({
    queryKey: ['caregiver', caregiverId ?? 'anonymous', 'family', familyId, 'patients'],
    queryFn: ({ signal }) => client!.listFamilyPatients(familyId!, signal),
    enabled: Boolean(client && familyId),
    staleTime: 60_000,
  });
  const patientId = patients.data?.[0]?.id;
  const overview = useQuery({
    queryKey: ['caregiver', caregiverId ?? 'anonymous', 'patient', patientId, 'overview'],
    queryFn: ({ signal }) => client!.getOverview(patientId!, signal),
    enabled: Boolean(client && patientId),
    staleTime: 60_000,
  });

  if (isDevelopmentMockMode) return { kind: 'mock', data: menteMockData };
  if (!accessToken) return { kind: 'loading' };
  const error = getApiError(families.error) ?? getApiError(patients.error) ?? getApiError(overview.error);
  if (error?.kind === 'forbidden' && error.code === 'CAREGIVER_PROFILE_NOT_PROVISIONED') {
    return { kind: 'profile-required', retry: () => void families.refetch() };
  }
  if (error) {
    const staleData = overview.data ? adaptCaregiverOverview(overview.data, new Date(overview.dataUpdatedAt)) : undefined;
    return { kind: 'error', error, retry: () => void families.refetch(), staleData };
  }
  if (families.isPending || patients.isPending || overview.isPending) return { kind: 'loading' };
  if (!familyId || !patientId || !overview.data) return { kind: 'empty' };
  return {
    kind: 'ready',
    data: adaptCaregiverOverview(overview.data, new Date(overview.dataUpdatedAt)),
    isRefreshing: overview.isFetching,
    refresh: () => void overview.refetch(),
  };
}

function getApiError(error: unknown): ApiError | null {
  return error instanceof ApiError ? error : null;
}
