export type ApiErrorKind =
  | 'aborted'
  | 'configuration'
  | 'conflict'
  | 'forbidden'
  | 'not-found'
  | 'offline'
  | 'server'
  | 'unauthorized'
  | 'validation'
  | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly fieldErrors: Readonly<Record<string, string>>;
  readonly code?: string;

  constructor({
    message,
    kind,
    status,
    fieldErrors = {},
    code,
  }: {
    message: string;
    kind: ApiErrorKind;
    status?: number;
    fieldErrors?: Readonly<Record<string, string>>;
    code?: string;
  }) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

export function getApiErrorKind(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function createApiError(status: number, data: unknown): ApiError {
  const fieldErrors = getSafeFieldErrors(data);
  return new ApiError({
    kind: getApiErrorKind(status),
    status,
    message: getSafeMessage(status, fieldErrors),
    fieldErrors,
    code: getKnownCode(data),
  });
}

function getSafeMessage(status: number, fieldErrors: Readonly<Record<string, string>>): string {
  if (status === 400 || status === 422) return Object.keys(fieldErrors).length ? 'Please review the highlighted details.' : 'Please review your details and try again.';
  if (status === 401) return 'Your session has ended. Please sign in again.';
  if (status === 403) return 'You do not have permission to view these settings.';
  if (status === 404) return 'This patient is no longer available.';
  if (status === 409) return 'These settings changed elsewhere. Refresh and review them before saving.';
  if (status >= 500) return 'Mente could not complete that request. Please try again shortly.';
  return 'Mente could not complete that request. Please try again.';
}

function getKnownCode(data: unknown): string | undefined {
  const detail = getDetail(data);
  return detail === 'CAREGIVER_PROFILE_NOT_PROVISIONED' ? detail : undefined;
}

function getSafeFieldErrors(data: unknown): Readonly<Record<string, string>> {
  const detail = getDetail(data);
  if (detail === 'A patient phone number is required before activating the call schedule') {
    return { active: 'Add a patient phone number before turning on the daily companion call.' };
  }
  if (!Array.isArray(detail)) return {};
  return Object.fromEntries(detail.flatMap((issue) => {
    if (!issue || typeof issue !== 'object' || !Array.isArray(issue.loc)) return [];
    const field = issue.loc.at(-1);
    if (typeof field !== 'string') return [];
    const safeField = field.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    return [[safeField, safeMessageForField(field)]];
  }));
}

function getDetail(data: unknown): unknown {
  return data && typeof data === 'object' && 'detail' in data ? data.detail : undefined;
}

function safeMessageForField(field: string): string {
  const messages: Record<string, string> = {
    local_time: 'Enter a time in HH:MM format.',
    timezone: 'Enter a valid IANA time zone, such as Asia/Kolkata.',
    days_of_week: 'Choose at least one day.',
    quiet_start: 'Enter a time in HH:MM format.',
    quiet_end: 'Enter a time in HH:MM format.',
    language_code: 'Enter a supported language code.',
    caregiver_phone_e164: 'Enter a phone number with country code, such as +919999999999.',
  };
  return messages[field] ?? 'Please review this field.';
}
