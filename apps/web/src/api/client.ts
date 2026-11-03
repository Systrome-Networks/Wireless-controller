const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('wac_access_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = data?.error || { code: 'UNKNOWN_ERROR', message: response.statusText };
    if (response.status === 401) {
      localStorage.removeItem('wac_access_token');
      localStorage.removeItem('wac_user');
      window.location.href = '/login';
    }
    throw new ApiError(error.code, error.message, response.status);
  }

  return data.data as T;
}
