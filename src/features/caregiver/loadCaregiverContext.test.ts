import type { CaregiverClient } from '../../api/caregiverClient';
import { loadCaregiverContext } from './loadCaregiverContext';

describe('saved family and patient selection', () => {
  const oldFamily = { id: 'old-family', created_at: '2026-09-01T00:00:00Z' };
  const newFamily = { id: 'new-family', created_at: '2026-09-13T00:00:00Z' };
  const oldPatient = { id: 'old-patient', active: true, created_at: '2026-09-01T00:00:00Z' };
  const newPatient = { id: 'new-patient', active: true, created_at: '2026-09-13T00:00:00Z' };

  it('selects the newest saved family and patient without mutating API arrays', async () => {
    const families = [oldFamily, newFamily];
    const patients = [newPatient, oldPatient];
    const client = { listFamilies: jest.fn().mockResolvedValue(families), listFamilyPatients: jest.fn().mockResolvedValue(patients) } as unknown as CaregiverClient;
    const signal = new AbortController().signal;
    expect(await loadCaregiverContext(client, signal)).toEqual({ family: newFamily, patient: newPatient });
    expect(client.listFamilyPatients).toHaveBeenCalledWith('new-family', signal);
    expect(families).toEqual([oldFamily, newFamily]);
    expect(patients).toEqual([newPatient, oldPatient]);
  });

  it('does not let a partially saved new family hide a complete profile', async () => {
    const client = { listFamilies: jest.fn().mockResolvedValue([oldFamily, newFamily]), listFamilyPatients: jest.fn().mockImplementation(async (id) => id === 'new-family' ? [] : [oldPatient]) } as unknown as CaregiverClient;
    expect(await loadCaregiverContext(client)).toEqual({ family: oldFamily, patient: oldPatient });
  });

  it('skips inactive patients', async () => {
    const client = { listFamilies: jest.fn().mockResolvedValue([newFamily]), listFamilyPatients: jest.fn().mockResolvedValue([{ ...newPatient, active: false }, oldPatient]) } as unknown as CaregiverClient;
    expect((await loadCaregiverContext(client))?.patient.id).toBe('old-patient');
  });

  it('returns empty only when no complete active profile exists', async () => {
    const client = { listFamilies: jest.fn().mockResolvedValue([newFamily]), listFamilyPatients: jest.fn().mockResolvedValue([]) } as unknown as CaregiverClient;
    expect(await loadCaregiverContext(client)).toBeNull();
  });

  it('propagates API failures rather than claiming the profile is empty', async () => {
    const failure = new Error('offline');
    const client = { listFamilies: jest.fn().mockRejectedValue(failure) } as unknown as CaregiverClient;
    await expect(loadCaregiverContext(client)).rejects.toBe(failure);
  });
});
