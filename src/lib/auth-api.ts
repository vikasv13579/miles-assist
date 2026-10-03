import { env } from 'next-runtime-env';

interface LoginResponse {
  access_token: string;
  admin: {
    id: string;
    email: string;
    createdAt: string;
  };
}

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function getApiBaseUrl() {
  const apiBaseUrl = env('NEXT_PUBLIC_API_URL')?.trim().replace(/\/+$/, '');
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }
  return apiBaseUrl;
}

async function request<T>(
  url: string,
  method: ApiMethod,
  body?: unknown,
): Promise<T> {
  const headers = new Headers();
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'message' in responseBody &&
      typeof responseBody.message === 'string'
        ? responseBody.message
        : `API request failed (${response.status}).`;
    throw new Error(message);
  }

  if (responseBody === null) {
    throw new Error('API returned an invalid JSON response.');
  }

  return responseBody as T;
}

export function apiRequest<T>(
  path: string,
  method: ApiMethod,
  body?: unknown,
): Promise<T> {
  return request<T>(`${getApiBaseUrl()}${path}`, method, body);
}

export function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>(
    `${getApiBaseUrl()}/auth/login`,
    'POST',
    { email, password },
  );
}
