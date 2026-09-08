import type { CaregiverClient } from '../../api/caregiverClient';
import type { FamilyDto, PatientDto } from '../../api/contracts/caregiver';
import { attachCurrentCaregiverClient, caregiverContextKey } from './useCaregiverContext';

const family: FamilyDto = { id: 'family-1', name: 'Test family', mode: 'SOLO', created_at: '2026-09-06T00:00:00Z' };
const patient: PatientDto = {
  id: 'patient-1', family_id: 'family-1', preferred_name: 'Rosa', legal_name: null, phone_e164: null,
  timezone: 'Asia/Kolkata', preferred_language: 'en-IN', high_energy_local_time: null, active: true,
  created_at: '2026-09-06T00:00:00Z', updated_at: '2026-09-06T00:00:00Z',
};

describe('caregiver context cache boundary', () => {
  it('keeps the query key identity-scoped and attaches the current client at read time', () => {
    const oldClient = {} as CaregiverClient;
    const currentClient = {} as CaregiverClient;
    const cachedDomain = { family, patient };

    expect(caregiverContextKey('caregiver-1')).toEqual(['caregiver', 'caregiver-1', 'context']);
    expect(attachCurrentCaregiverClient(cachedDomain, oldClient).client).toBe(oldClient);
    expect(attachCurrentCaregiverClient(cachedDomain, currentClient).client).toBe(currentClient);
    expect(cachedDomain).not.toHaveProperty('client');
  });
});
