import { ApiError, createApiError } from './errors';

export type HttpHeaders = Readonly<Record<string, string>>;

export interface HttpClientOptions {
  baseUrl: string;
  getHeaders?: (accessTokenOverride?: string) => HttpHeaders | Promise<HttpHeaders>;
  refreshAccessToken?: () => Promise<string | null>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface HttpRequestOptions {
  body?: unknown;
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T>(path: string, options?: Pick<HttpRequestOptions, 'signal'>): Promise<T>;
  post<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  put<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  patch<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  delete<T>(path: string, options?: Pick<HttpRequestOptions, 'signal'>): Promise<T>;
}

export function createHttpClient({ baseUrl, getHeaders = () => ({}), refreshAccessToken, timeoutMs = 15_000, fetchImpl = fetch }: HttpClientOptions): HttpClient {
  const request = async <T>(method: string, path: string, options: HttpRequestOptions = {}): Promise<T> => {
    let accessTokenOverride: string | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const headers: Record<string, string> = { Accept: 'application/json', ...(await getHeaders(accessTokenOverride)) };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';
      const response = await fetchWithTimeout(fetchImpl, `${baseUrl}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      }, timeoutMs);
      const data = await readJson(response);
      if (response.ok) return data as T;
      if (response.status !== 401 || attempt > 0 || !refreshAccessToken) throw createApiError(response.status, data);
      accessTokenOverride = (await refreshAccessToken()) ?? undefined;
      if (!accessTokenOverride) throw createApiError(response.status, data);
    }
    throw new ApiError({ kind: 'unauthorized', status: 401, message: 'Your session has ended. Please sign in again.' });
  };

  return {
    get: (path, options) => request('GET', path, options),
    post: (path, options) => request('POST', path, options),
    put: (path, options) => request('PUT', path, options),
    patch: (path, options) => request('PATCH', path, options),
    delete: (path, options) => request('DELETE', path, options),
  };
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  init.signal?.addEventListener('abort', abortFromCaller, { once: true });
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (timedOut) throw new ApiError({ kind: 'aborted', message: 'The request timed out. Please try again.' });
      throw new ApiError({ kind: 'aborted', message: 'The request was cancelled.' });
    }
    throw new ApiError({ kind: 'offline', message: 'Mente could not reach the service. Check your connection and try again.' });
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', abortFromCaller);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
