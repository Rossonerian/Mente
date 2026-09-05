import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createCaregiverClient, type CaregiverClient } from '../../api/caregiverClient';
import { isDevelopmentMockMode } from '../../api/config';
import { ApiError } from '../../api/errors';
import type { FamilyDto, PatientDto } from '../../api/contracts/caregiver';

export interface CaregiverPatientContext {
  client: CaregiverClient;
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
    queryFn: async ({ signal }): Promise<CaregiverPatientContext | null> => {
      const families = await clientResult.client!.listFamilies(signal);
      const family = families[0];
      if (!family) return null;
      const patients = await clientResult.client!.listFamilyPatients(family.id, signal);
      const patient = patients[0];
      return patient ? { client: clientResult.client!, family, patient } : null;
    },
    staleTime: 60_000,
  });
  const retry = () => void query.refetch();
  if (clientResult.error) return { kind: 'error', error: clientResult.error, retry };
  if (!accessToken || query.isPending) return { kind: 'loading' };
  if (query.error instanceof ApiError) return { kind: 'error', error: query.error, retry };
  if (!query.data) return { kind: 'empty', retry };
  return { kind: 'ready', data: query.data, isRefreshing: query.isFetching, refresh: retry };
}
