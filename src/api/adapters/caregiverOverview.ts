import type { AlertDto, PatientOverviewDto, SessionDto } from '../contracts/caregiver';
import type { AlertEvent, CognitiveSession, PatientProfile, TrendAssessment } from '../../types';

export interface CaregiverOverviewViewModel {
  patient: PatientProfile & { id: string };
  sessions: CognitiveSession[];
  alerts: AlertEvent[];
  trend: TrendAssessment;
  freshness: {
    transport: { updatedAt: string };
    assessment: { kind: 'unavailable' };
  };
}

export function adaptCaregiverOverview(dto: PatientOverviewDto, updatedAt: Date): CaregiverOverviewViewModel {
  return {
    patient: {
      id: dto.patient.id,
      name: dto.patient.legal_name ?? dto.patient.preferred_name,
      preferredName: dto.patient.preferred_name,
      initials: dto.patient.preferred_name.slice(0, 1).toUpperCase(),
      timezone: dto.patient.timezone,
      callTime: 'Schedule not set',
      quietHours: 'Quiet hours not set',
    },
    sessions: dto.recent_sessions.map(adaptCaregiverSession),
    alerts: dto.active_alerts.map(adaptAlert),
    trend: {
      status: dto.trend.status,
      label: dto.trend.label,
      reason: dto.trend.reason,
      sufficiency: dto.trend.data_sufficiency === 'sufficient' ? 'Based on available recent history' : 'Provisional · more history will make this view clearer',
      windowLabel: `Comparing ${formatDate(dto.trend.recent_start)}–${formatDate(dto.trend.recent_end)} with the preceding period`,
    },
    freshness: {
      transport: { updatedAt: updatedAt.toISOString() },
      assessment: { kind: 'unavailable' },
    },
  };
}

export function adaptCaregiverSession(session: SessionDto): CognitiveSession {
  const date = new Date(session.started_at);
  const isSameDay = session.review_classification === 'SAME_DAY';
  return {
    id: session.id,
    source: session.source,
    activityLabel: session.source === 'CALL' ? 'Daily companion call' : 'Family memory moment',
    dateLabel: formatDate(session.started_at),
    timeLabel: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    durationLabel: session.duration_ms === null ? 'In progress' : `${Math.max(1, Math.round(session.duration_ms / 60_000))} min`,
    review: isSameDay ? 'same-day' : 'routine',
    statusLabel: titleCase(session.status),
    summary: isSameDay ? 'A recent moment may need caregiver attention.' : 'A familiar moment was recorded.',
    detail: isSameDay
      ? 'This is an observed interaction signal for caregiver review, not a diagnosis.'
      : 'This is an observed activity record, not a diagnosis.',
    metricLabel: session.metrics.length ? `${session.metrics.length} observed moment${session.metrics.length === 1 ? '' : 's'}` : 'No round observations recorded',
  };
}

function adaptAlert(alert: AlertDto): AlertEvent {
  return {
    id: alert.id,
    title: 'A caregiver check-in may help',
    body: alert.reason_text,
    createdLabel: formatDateTime(alert.created_at),
    actionLabel: 'Review activity',
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function titleCase(value: string): string {
  return value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
