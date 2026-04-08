/**
 * API Client Utility
 * 
 * This module provides a utility function `apiRequest` to make HTTP requests to the backend API.
 * It handles authentication by including a JWT token from cookies, and it also manages SSL certificate
 * validation for development environments with self-signed certificates.
 * 
 * 
 * Usage:
 * 
 * --GET
 *  const requests = await apiRequest('/applicant/get-user-requests/1');
 * 
 * --POST
 *  await apiRequest('/applicant/create-request', {
 *    method: 'POST',
 *    data: { payload }
 *  });
 * 
 * --PUT
 *  await apiRequest('/applicant/update-request/1', {
 *    method: 'PUT',
 *    data: { payload }
 *  });
 */

import { getSession } from "@data/cookies";

// Handle SSL certificate validation for server-side (Node.js) environment
// This is needed for Astro SSR to work with self-signed certificates
const isServer = typeof window === 'undefined';
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// In development server environment, disable certificate validation
if (isServer && isDevelopment && typeof process !== 'undefined') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

type HTTP = 'GET' | 'POST' | 'PUT';

interface ApiOptions {
  method?: HTTP;
  data?: any;
  headers?: Record<string, string>;
  cookies?: import("astro").APIContext["cookies"];
}

class ApiError extends Error {
  status: number;
  response: any;

  constructor(status: number, response: any) {
    super(response?.error || response?.message || `API request failed with status ${status}`);
    this.status = status;
    this.response = response;
  }
}

/**
 * Makes an API request to the backend with the given path and options.
 * It automatically includes the JWT token from cookies for authentication.
 * The function also handles SSL certificate issues in development environments.
 * 
 * @param path - The API endpoint path (e.g., '/applicant/get-user-requests/1')
 * @param options - Optional configuration for the request, including method, data, headers, and cookies
 * @returns A promise that resolves to the response data from the API
 * @throws An error if the request fails or if the response is not ok
 */

export async function apiRequest<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const runtimeServerApiBase =
    isServer && typeof process !== 'undefined' ? process.env.SERVER_API_BASE_URL : undefined;
  const serverBaseUrls = [
    runtimeServerApiBase,
    import.meta.env.SERVER_API_BASE_URL,
    'https://backend:3000/api',
    'https://host.docker.internal:3000/api',
    import.meta.env.PUBLIC_API_BASE_URL,
    'https://localhost:3000/api',
  ].filter(Boolean);
  const baseUrl = isServer ? serverBaseUrls[0] : import.meta.env.PUBLIC_API_BASE_URL;
  const { method = 'GET', data, headers = {}, cookies } = options;

  let token = "";
  try {
    const session = getSession(cookies); 
    token = session.token;
  } catch (e) {
    console.warn("[WARN] No se pudo obtener sesión en apiRequest", e);
  }

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  try {
    // Try alternative server URLs to reduce transient container-network failures.
    const targets = isServer ? serverBaseUrls : [baseUrl];
    let lastError: any;

    for (const targetBase of targets) {
      try {
        const res = await fetch(`${targetBase}${path}`, config);

        if (!res.ok) {
          let errorData: any;
          const contentType = res.headers.get('content-type');

          if (contentType?.includes('application/json')) {
            try {
              errorData = await res.json();
            } catch {
              errorData = { message: res.statusText };
            }
          } else {
            errorData = { message: await res.text() };
          }

          throw new ApiError(res.status, errorData);
        }

        return await res.json();
      } catch (err) {
        if (err instanceof ApiError && err.status < 500) {
          throw err;
        }
        lastError = err;
      }
    }

    throw lastError;
  } catch (error) {
    console.error("API request failed:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network or fetch error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
