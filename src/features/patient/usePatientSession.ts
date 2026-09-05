import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createPatientClient } from '../../api/patientClient';
import type { GameFinalizeDto, GameMetricDto, GameSessionStartDto, PatientSessionDto } from '../../api/contracts/patient';

export function patientKeys() {
  return {
    all: ['patient', 'device'] as const,
    memories: ['patient', 'device', 'memories'] as const,
    profile: ['patient', 'device', 'profile'] as const,
  };
}

export function usePatientMemoryQuery(patientToken: string | null) {
  const client = useMemo(() => patientToken ? createPatientClient(patientToken) : null, [patientToken]);
  return useQuery({ queryKey: patientKeys().memories, enabled: Boolean(client), queryFn: ({ signal }) => client!.getMemories(signal), staleTime: 60_000 });
}

export function usePatientProfileQuery(patientToken: string | null) {
  const client = useMemo(() => patientToken ? createPatientClient(patientToken) : null, [patientToken]);
  return useQuery({ queryKey: patientKeys().profile, enabled: Boolean(client), queryFn: ({ signal }) => client!.getMe(signal), staleTime: 60_000 });
}

export function useStartPatientGame(patientToken: string | null) {
  const client = useMemo(() => patientToken ? createPatientClient(patientToken) : null, [patientToken]);
  return useMutation({ mutationFn: (input: GameSessionStartDto) => client!.startGame(input) });
}

export function usePatientGameWrite(patientToken: string | null) {
  const client = useMemo(() => patientToken ? createPatientClient(patientToken) : null, [patientToken]);
  const queryClient = useQueryClient();
  const metric = useMutation({ mutationFn: ({ sessionId, payload }: { sessionId: string; payload: GameMetricDto }) => client!.recordMetric(sessionId, payload) });
  const finalize = useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: GameFinalizeDto }) => client!.finalizeGame(sessionId, payload),
    onSuccess: () => queryClient.removeQueries({ queryKey: patientKeys().all }),
  });
  return { metric, finalize };
}

export function createPatientClientId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createGameRoundId(sessionId: string, promptId: string): string {
  return `${sessionId}:${promptId}`;
}

export function createSkippedGameMetric(sessionId: string, promptId: string): GameMetricDto {
  const clientRoundId = createGameRoundId(sessionId, promptId);
  return {
    client_metric_id: clientRoundId,
    item_type: 'FAMILIAR_MEMORY',
    hesitation_count: 0,
    metadata_json: { client_round_id: clientRoundId, interaction: 'skip' },
  };
}

export type ActivePatientGame = Pick<PatientSessionDto, 'id' | 'activity_type'>;
