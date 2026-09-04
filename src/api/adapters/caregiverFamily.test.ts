import { adaptMemoryToFamilyMember, adaptPatientMemoryToPrompt } from './caregiverFamily';

const memory = {
  id: 'memory-1',
  patient_id: 'patient-1',
  memory_type: 'VOICE' as const,
  subject_name: 'Ana Delgado',
  relationship_label: 'Daughter',
  prompt_text: 'Sunday lunches and lemon cake.',
  accepted_answers: ['Ana'],
  asset_ref: null,
  active: true,
  consent_recorded_at: '2026-09-05T09:00:00Z',
  created_at: '2026-09-05T09:00:00Z',
  updated_at: '2026-09-05T09:00:00Z',
};

describe('caregiver family adapters', () => {
  it('turns a consented family memory into a readable caregiver member', () => {
    expect(adaptMemoryToFamilyMember(memory)).toEqual({
      id: 'memory-1',
      name: 'Ana Delgado',
      relationship: 'Daughter',
      initials: 'AD',
      memory: 'Sunday lunches and lemon cake.',
      voiceAvailable: true,
    });
  });

  it('keeps patient prompts warm and free of scoring language', () => {
    expect(adaptPatientMemoryToPrompt(memory)).toMatchObject({
      id: 'memory-1',
      personName: 'Ana Delgado',
      relationship: 'Daughter',
      title: 'A familiar voice',
      memoryHint: 'Sunday lunches and lemon cake.',
    });
  });
});
