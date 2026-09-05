import type { QueryClientConfig } from '@tanstack/react-query';
import { ApiError } from '../api/errors';

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 422]);

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.status && nonRetryableStatuses.has(error.status)) return false;
    return (error.kind === 'offline' || error.kind === 'server') && failureCount < 2;
  }
  return failureCount < 1;
}

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetryQuery,
      retryDelay: (attempt) => Math.min(750 * 2 ** attempt, 3_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: false },
  },
};
