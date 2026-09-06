import type { GameFinalizeDto, GameMetricDto } from '../../api/contracts/patient';

export type PendingGameWrite =
  | { kind: 'finalize'; sessionId: string; payload: GameFinalizeDto }
  | { kind: 'metric'; sessionId: string; promptIndex: number; payload: GameMetricDto };

export function serializePendingGameWrite(write: PendingGameWrite): string {
  return JSON.stringify(write);
}

export function parsePendingGameWrite(value: string | null): PendingGameWrite | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed) || typeof parsed.sessionId !== 'string' || !parsed.sessionId) return null;

    if (parsed.kind === 'metric' && typeof parsed.promptIndex === 'number' && Number.isInteger(parsed.promptIndex) && isMetricPayload(parsed.payload)) {
      return { kind: 'metric', sessionId: parsed.sessionId, promptIndex: parsed.promptIndex, payload: parsed.payload };
    }
    if (parsed.kind === 'finalize' && isFinalizePayload(parsed.payload)) {
      return { kind: 'finalize', sessionId: parsed.sessionId, payload: parsed.payload };
    }
    // Older builds stored finalize writes without a discriminator.
    if (isFinalizePayload(parsed.payload)) {
      return { kind: 'finalize', sessionId: parsed.sessionId, payload: parsed.payload };
    }
  } catch {
    return null;
  }
  return null;
}

function isMetricPayload(value: unknown): value is GameMetricDto {
  return isRecord(value) && typeof value.client_metric_id === 'string' && value.client_metric_id.length > 0 && typeof value.item_type === 'string' && value.item_type.length > 0;
}

function isFinalizePayload(value: unknown): value is GameFinalizeDto {
  return isRecord(value) && (value.status === 'COMPLETED' || value.status === 'EARLY_TERMINATED' || value.status === 'INTERRUPTED');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
