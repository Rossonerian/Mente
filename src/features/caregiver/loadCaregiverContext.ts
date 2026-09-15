import type { CaregiverClient } from '../../api/caregiverClient';
import type { FamilyDto, PatientDto } from '../../api/contracts/caregiver';

export interface CaregiverContextData {
  family: FamilyDto;
  patient: PatientDto;
}

// The app currently shows one profile. Prefer the newest complete setup after
// saving or reloading. A partially saved family must not hide another patient.
export async function loadCaregiverContext(client: CaregiverClient, signal?: AbortSignal): Promise<CaregiverContextData | null> {
  const families = await client.listFamilies(signal);
  const newestFamilies = [...families].sort((a, b) => b.created_at.localeCompare(a.created_at));
  for (const family of newestFamilies) {
    const patients = await client.listFamilyPatients(family.id, signal);
    const patient = [...patients].filter((item) => item.active).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (patient) return { family, patient };
  }
  return null;
}
