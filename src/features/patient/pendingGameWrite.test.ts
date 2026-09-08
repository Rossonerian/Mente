import { parsePendingGameWrite, serializePendingGameWrite } from './pendingGameWrite';

describe('pending patient game writes', () => {
  it('round-trips metric writes without exposing credentials', () => {
    const write = {
      kind: 'metric' as const,
      sessionId: 'session-1',
      promptIndex: 2,
      payload: { client_metric_id: 'session-1:memory-1', item_type: 'FAMILIAR_MEMORY', metadata_json: { interaction: 'skip' } },
    };
    expect(parsePendingGameWrite(serializePendingGameWrite(write))).toEqual(write);
  });

  it('accepts legacy finalize payloads and rejects malformed writes', () => {
    expect(parsePendingGameWrite(JSON.stringify({ sessionId: 'session-1', payload: { status: 'COMPLETED' } }))).toEqual({
      kind: 'finalize',
      sessionId: 'session-1',
      payload: { status: 'COMPLETED' },
    });
    expect(parsePendingGameWrite(JSON.stringify({ sessionId: 'session-1', payload: { status: 'NOT_A_STATUS' } }))).toBeNull();
    expect(parsePendingGameWrite('{bad-json')).toBeNull();
  });
});
