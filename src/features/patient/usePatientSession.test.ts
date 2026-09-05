import { createGameRoundId, createSkippedGameMetric, patientKeys } from './usePatientSession';

describe('patient session cache and idempotency boundaries', () => {
  it('never places the patient device token in a React Query key', () => {
    expect(patientKeys().memories).toEqual(['patient', 'device', 'memories']);
    expect(patientKeys().profile).toEqual(['patient', 'device', 'profile']);
  });

  it('uses the same round identifier when a skipped prompt is retried', () => {
    expect(createGameRoundId('session-1', 'memory-1')).toBe('session-1:memory-1');
    expect(createGameRoundId('session-1', 'memory-1')).toBe(createGameRoundId('session-1', 'memory-1'));
    expect(createSkippedGameMetric('session-1', 'memory-1')).toEqual(
      createSkippedGameMetric('session-1', 'memory-1'),
    );
  });
});
