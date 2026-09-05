import { ApiError } from './errors';
import { shouldRetryQuery } from '../providers/queryPolicy';

describe('query retry policy', () => {
  it.each([400, 401, 403, 404, 409, 422])('does not retry HTTP %i responses', (status) => {
    expect(shouldRetryQuery(0, new ApiError({ kind: 'validation', message: 'safe', status }))).toBe(false);
  });

  it('retries a transient offline or server failure at most twice', () => {
    expect(shouldRetryQuery(0, new ApiError({ kind: 'offline', message: 'safe' }))).toBe(true);
    expect(shouldRetryQuery(1, new ApiError({ kind: 'server', message: 'safe', status: 503 }))).toBe(true);
    expect(shouldRetryQuery(2, new ApiError({ kind: 'server', message: 'safe', status: 503 }))).toBe(false);
  });
});
