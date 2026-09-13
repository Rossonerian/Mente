import { ReactNode } from "react";

export type AppRole = 'caregiver' | 'patient';

export type CaregiverTabRoute = 'home' | 'history' | 'family' | 'settings';
export type CaregiverRoute = CaregiverTabRoute | 'setup';

export type PatientTabRoute = 'play' | 'family' | 'help';
export type PatientRoute = PatientTabRoute | 'in-game' | 'complete';

export type AppRoute = CaregiverRoute | PatientRoute;
export type SessionSource = 'CALL' | 'GAME';
export type SessionReview = 'routine' | 'same-day';
export type TrendStatus = 'stable' | 'watch' | 'declining';

export interface TabItem<Route extends string = string> {
  route: Route;
  label: string;
  icon: string;
}

export interface FamilyMember {
  messagesCount?: number;
  sessionsCount?: number;
  memoriesCount?: number;
  bio?: string;
  relation?: ReactNode;
  id: string;
  name: string;
  relationship: string;
  initials: string;
  memory: string;
  voiceAvailable: boolean;
}

export interface PatientProfile {
  name: string;
  preferredName: string;
  initials: string;
  timezone: string;
  callTime: string;
  quietHours: string;
}

export interface CognitiveSession {
  id: string;
  source: SessionSource;
  activityLabel: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  review: SessionReview;
  statusLabel: string;
  summary: string;
  detail: string;
  metricLabel: string;
}

export interface AlertEvent {
  id: string;
  title: string;
  body: string;
  createdLabel: string;
  actionLabel: string;
}

export interface TrendAssessment {
  status: TrendStatus;
  label: string;
  reason: string;
  sufficiency: string;
  windowLabel: string;
}

export interface MemoryPrompt {
  id: string;
  personId: string;
  personName: string;
  relationship: string;
  title: string;
  prompt: string;
  memoryHint: string;
}

export interface MenteMockData {
  patient: PatientProfile;
  family: FamilyMember[];
  sessions: CognitiveSession[];
  alert: AlertEvent;
  trend: TrendAssessment;
  prompts: MemoryPrompt[];
}
