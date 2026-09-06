export interface CaregiverUserDto {
  id: string;
  auth_user_id: string | null;
  email: string;
  display_name: string;
  created_at: string;
}

export interface FamilyDto {
  id: string;
  name: string;
  mode: 'SOLO' | 'GROUP';
  created_at: string;
}

export interface PatientDto {
  id: string;
  family_id: string;
  preferred_name: string;
  legal_name: string | null;
  phone_e164: string | null;
  timezone: string;
  preferred_language: string;
  high_energy_local_time: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionMetricDto {
  id: string;
  session_id: string;
  patient_id: string;
  client_metric_id: string | null;
  item_type: string;
  accuracy: number | null;
  average_response_latency_ms: number | null;
  hesitation_count: number;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  recorded_at: string;
  metadata_json: Record<string, unknown>;
}

export interface SessionDto {
  id: string;
  patient_id: string;
  source: 'CALL' | 'GAME';
  activity_type: string;
  external_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EARLY_TERMINATED' | 'INTERRUPTED' | 'FAILED' | 'RESCHEDULED';
  termination_reason: string | null;
  session_score: number | null;
  summary_accuracy: number | null;
  average_response_latency_ms: number | null;
  hesitation_count: number;
  review_classification: 'ROUTINE' | 'SAME_DAY';
  metadata_json: Record<string, unknown>;
  metrics: SessionMetricDto[];
}

export interface AlertDto {
  id: string;
  patient_id: string;
  session_id: string;
  classification: 'ROUTINE' | 'SAME_DAY';
  reason_code: string;
  reason_text: string;
  delivery_status: string;
  acknowledged_at: string | null;
  created_at: string;
}

export interface TrendDto {
  status: 'stable' | 'watch' | 'declining';
  label: string;
  reason: string;
  data_sufficiency: 'insufficient' | 'sufficient';
  baseline_start: string;
  baseline_end: string;
  recent_start: string;
  recent_end: string;
  baseline_session_count: number;
  recent_session_count: number;
  comparable_strata: number;
  accuracy_adverse_z?: number | null;
  latency_adverse_z?: number | null;
  combined_score?: number | null;
  model_version?: string;
}

export interface PatientOverviewDto {
  patient: PatientDto;
  recent_sessions: SessionDto[];
  active_alerts: AlertDto[];
  trend: TrendDto;
}

export interface DevelopmentAccessCodeDto {
  enabled: boolean;
  patient_id: string;
  code: string | null;
}
