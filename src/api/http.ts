import { ApiError, createApiError } from './errors';

export type HttpHeaders = Readonly<Record<string, string>>;

export interface HttpClientOptions {
  baseUrl: string;
  getHeaders?: () => HttpHeaders;
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

export function createHttpClient({ baseUrl, getHeaders = () => ({}), fetchImpl = fetch }: HttpClientOptions): HttpClient {
  const request = async <T>(method: string, path: string, options: HttpRequestOptions = {}): Promise<T> => {
    const headers: Record<string, string> = { Accept: 'application/json', ...getHeaders() };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError({ kind: 'aborted', message: 'The request was cancelled.' });
      }
      throw new ApiError({ kind: 'offline', message: 'Mente could not reach the service. Check your connection and try again.' });
    }

    const data = await readJson(response);
    if (!response.ok) {
      throw createApiError(response.status, data);
    }
    return data as T;
  };

  return {
    get: (path, options) => request('GET', path, options),
    post: (path, options) => request('POST', path, options),
    put: (path, options) => request('PUT', path, options),
    patch: (path, options) => request('PATCH', path, options),
    delete: (path, options) => request('DELETE', path, options),
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
