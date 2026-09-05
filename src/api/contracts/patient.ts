import type { PatientDto, SessionDto } from './caregiver';

export interface MemoryDto {
  id: string;
  patient_id: string;
  memory_type: 'PERSON' | 'RELATIONSHIP' | 'VOICE' | 'MILESTONE' | 'PHOTO' | 'STORY';
  subject_name: string | null;
  relationship_label: string | null;
  prompt_text: string;
  accepted_answers: string[];
  asset_ref: string | null;
  active: boolean;
  consent_recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface PatientBindingDto {
  patient_token: string;
  expires_at: string;
  patient: PatientDto;
}

export interface GameSessionStartDto {
  activity_type: 'MEMORY_MATCH' | 'FAMILY_TREE' | 'MEMORY_TRAIN' | 'MILESTONE_TIMELINE' | 'FINISH_THE_STORY' | 'CATEGORY_ALPHABET';
  client_session_id: string;
  started_at?: string;
  metadata_json?: Record<string, unknown>;
}

export interface GameMetricDto {
  client_metric_id: string;
  item_type: string;
  accuracy?: number | null;
  average_response_latency_ms?: number | null;
  hesitation_count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  recorded_at?: string;
  metadata_json?: Record<string, unknown>;
}

export interface GameFinalizeDto {
  status: 'COMPLETED' | 'EARLY_TERMINATED' | 'INTERRUPTED';
  ended_at?: string;
  termination_reason?: string;
  metadata_json?: Record<string, unknown>;
}

export type PatientSessionDto = SessionDto;
