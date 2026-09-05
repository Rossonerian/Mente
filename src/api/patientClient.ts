import { getApiBaseUrl } from './config';
import type { MemoryDto, GameFinalizeDto, GameMetricDto, GameSessionStartDto, PatientBindingDto, PatientSessionDto } from './contracts/patient';
import type { PatientDto } from './contracts/caregiver';
import { createHttpClient } from './http';

export interface PatientClient {
  finalizeGame(sessionId: string, payload: GameFinalizeDto): Promise<PatientSessionDto>;
  getMemories(signal?: AbortSignal): Promise<MemoryDto[]>;
  getMe(signal?: AbortSignal): Promise<PatientDto>;
  recordMetric(sessionId: string, payload: GameMetricDto): Promise<void>;
  startGame(payload: GameSessionStartDto): Promise<PatientSessionDto>;
}

export function createPatientBindingClient() {
  const http = createHttpClient({ baseUrl: getApiBaseUrl() });
  return {
    bind: (code: string) => http.post<PatientBindingDto>('/patient/bind', { body: { code } }),
  };
}

export function createPatientClient(patientToken: string): PatientClient {
  const http = createHttpClient({
    baseUrl: getApiBaseUrl(),
    getHeaders: () => ({ 'X-Patient-Token': patientToken }),
  });
  return {
    finalizeGame: (sessionId, payload) => http.post(`/patient/game-sessions/${encodeURIComponent(sessionId)}/finalize`, { body: payload }),
    getMemories: (signal) => http.get('/patient/memories', { signal }),
    getMe: (signal) => http.get('/patient/me', { signal }),
    recordMetric: async (sessionId, payload) => {
      await http.post(`/patient/game-sessions/${encodeURIComponent(sessionId)}/metrics`, { body: payload });
    },
    startGame: (payload) => http.post('/patient/game-sessions', { body: payload }),
  };
}
