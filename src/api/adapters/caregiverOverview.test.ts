import { adaptCaregiverOverview } from './caregiverOverview';

describe('adaptCaregiverOverview', () => {
  it('keeps transport freshness distinct from unavailable assessment freshness', () => {
    const viewModel = adaptCaregiverOverview({
      patient: {
        id: 'patient-1', family_id: 'family-1', preferred_name: 'Rosa', legal_name: 'Rosa Delgado', phone_e164: null,
        timezone: 'Asia/Kolkata', preferred_language: 'en-IN', high_energy_local_time: null, active: true,
        created_at: '2026-09-04T08:00:00Z', updated_at: '2026-09-04T08:00:00Z',
      },
      recent_sessions: [],
      active_alerts: [],
      trend: {
        status: 'stable', label: 'Steady', reason: 'More history will make this view clearer.', data_sufficiency: 'insufficient',
        baseline_start: '2026-08-01T00:00:00Z', baseline_end: '2026-08-15T00:00:00Z', recent_start: '2026-08-16T00:00:00Z',
        recent_end: '2026-08-23T00:00:00Z', baseline_session_count: 0, recent_session_count: 0, comparable_strata: 0,
      },
    }, new Date('2026-09-04T09:00:00Z'));

    expect(viewModel.patient.preferredName).toBe('Rosa');
    expect(viewModel.freshness.assessment).toEqual({ kind: 'unavailable' });
    expect(viewModel.freshness.transport.updatedAt).toBe('2026-09-04T09:00:00.000Z');
  });
});
