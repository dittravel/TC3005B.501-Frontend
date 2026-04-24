import { getSession } from "@data/cookies";

const isServer = typeof window === 'undefined';
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

if (isServer && isDevelopment && typeof process !== 'undefined') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

type HTTP = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: HTTP;
  data?: any;
  headers?: Record<string, string>;
  cookies?: import("astro").APIContext["cookies"];
}

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://localhost:3000/api';

let _csrfToken: string | null = null;

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;
  const fromCookie = readCsrfCookie();
  if (fromCookie) {
    _csrfToken = fromCookie;
    return _csrfToken;
  }
  const res = await fetch(`${BASE_URL.replace('/api', '')}/api/csrf-token`, {
    credentials: 'include',
  });
  const data = await res.json();
  _csrfToken = data.csrfToken;
  return _csrfToken as string;
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', data, headers, cookies } = options;

  const url = `${BASE_URL}${path}`;

  let token = "";
  try {
    const session = getSession(cookies);
    token = session.token;
  } catch (e) {
    console.warn("[WARN] No se pudo obtener sesión en apiRequest", e);
  }

  const isMutation = method !== 'GET';
  let csrfHeader: Record<string, string> = {};
  if (isMutation && !isServer) {
    try {
      const csrf = await getCsrfToken();
      csrfHeader = { 'x-csrf-token': csrf };
    } catch {
      // Continue without CSRF token — server will reject if required
    }
  }

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...csrfHeader,
      ...headers,
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.warn("Unauthorized request - token may be invalid or expired");
        if (typeof window !== 'undefined') {
          // Mark that session expired for displaying message on login page
          if (res.status === 401) {
            localStorage.setItem('sessionExpired', 'true');
          }
          window.location.href = '/login';
        }
        throw {
          status: res.status,
          message: res.status === 401 ? 'Session expired - redirecting to login' : 'Unauthorized - redirecting to login'
        };
      }

      let errorData: any;
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: res.statusText };
        }
      } else {
        errorData = { message: await res.text() };
      }

      throw {
        status: res.status,
        response: errorData
      };
    }

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text as any;
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw {
      message: 'Network or fetch error',
      detail: error
    };
  }
}
