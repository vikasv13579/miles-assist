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

const DEFAULT_API_BASE_URL = 'https://miles-assist-backend.vercel.app';

function getApiBaseUrl() {
  const configuredApiBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    env('NEXT_PUBLIC_API_URL')
  )?.trim();
  const apiBaseUrl = (configuredApiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  if (!apiBaseUrl) {
    throw new Error(
      'The API URL is invalid. Set NEXT_PUBLIC_API_URL to a valid backend URL. No API request was sent.',
    );
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

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Could not reach the sign-in service. Check your connection and confirm the backend CORS_ORIGIN includes this frontend's deployed URL.",
      );
    }
    throw error;
  }

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
        ? responseBody.message
        : undefined;
    const message =
      typeof errorMessage === 'string'
        ? errorMessage
        : Array.isArray(errorMessage) && errorMessage.every((item) => typeof item === 'string')
          ? errorMessage.join(' ')
          : undefined;
    throw new Error(message || `API request failed (${response.status}).`);
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
