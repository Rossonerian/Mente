import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createCaregiverClient, type CaregiverClient } from '../../api/caregiverClient';
import { isDevelopmentMockMode } from '../../api/config';
import { ApiError } from '../../api/errors';
import type { FamilyDto, PatientDto } from '../../api/contracts/caregiver';
import { loadCaregiverContext } from './loadCaregiverContext';

export interface CaregiverPatientContext {
  client: CaregiverClient;
  family: FamilyDto;
  patient: PatientDto;
}

interface CaregiverPatientContextData {
  family: FamilyDto;
  patient: PatientDto;
}

export type CaregiverContextState =
  | { kind: 'loading' }
  | { kind: 'empty'; retry: () => void }
  | { kind: 'error'; error: ApiError; retry: () => void }
  | { kind: 'ready'; data: CaregiverPatientContext; isRefreshing: boolean; refresh: () => void };

export function caregiverContextKey(caregiverId: string) {
  return ['caregiver', caregiverId, 'context'] as const;
}

export function useCaregiverPatientContext(accessToken: string | null, caregiverId: string | null): CaregiverContextState {
  const clientResult = useMemo(() => {
    if (!accessToken || isDevelopmentMockMode) return { client: null, error: null as ApiError | null };
    try { return { client: createCaregiverClient(accessToken), error: null as ApiError | null }; }
    catch (error) { return { client: null, error: error instanceof ApiError ? error : new ApiError({ kind: 'configuration', message: 'Mente is not configured for live data.' }) }; }
  }, [accessToken]);
  const query = useQuery({
    queryKey: caregiverContextKey(caregiverId ?? 'anonymous'),
    enabled: Boolean(clientResult.client && caregiverId),
    queryFn: ({ signal }) => loadCaregiverContext(clientResult.client!, signal),
    staleTime: 60_000,
  });
  const retry = () => void query.refetch();
  if (clientResult.error) return { kind: 'error', error: clientResult.error, retry };
  if (!accessToken || query.isPending) return { kind: 'loading' };
  if (query.error instanceof ApiError) return { kind: 'error', error: query.error, retry };
  if (!query.data) return { kind: 'empty', retry };
  return { kind: 'ready', data: attachCurrentCaregiverClient(query.data, clientResult.client!), isRefreshing: query.isFetching, refresh: retry };
}

export function attachCurrentCaregiverClient(data: CaregiverPatientContextData, client: CaregiverClient): CaregiverPatientContext {
  return { ...data, client };
}
