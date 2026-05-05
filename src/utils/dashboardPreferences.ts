import { getCookie } from '@/data/cookies';

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL || 'https://localhost:3000/api';

function buildAuthHeaders(explicitToken?: string): Record<string, string> {
  const tokenFromCookie = getCookie('token');
  const token = explicitToken || (typeof tokenFromCookie === 'string' ? tokenFromCookie : '');

  if (token.length > 0) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Fetch dashboard quick-action preferences for a user from the server.
 * Returns an empty array if the request fails or the user has no preferences yet.
 */
export async function readDashboardPreferences(userId: number | string, token?: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const response = await fetch(`${API_BASE}/user/dashboard-preferences/${String(userId)}`, {
      credentials: 'include',
      headers: {
        ...buildAuthHeaders(token),
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.routes) ? data.routes : [];
  } catch {
    return [];
  }
}

/**
 * Persist dashboard quick-action preferences for a user to the server.
 * Resolves with the saved routes array, or the original input on failure.
 */
export async function writeDashboardPreferences(
  userId: number | string,
  routes: string[],
  token?: string
): Promise<string[]> {
  if (!userId) return routes;
  const deduped = Array.from(new Set(routes.filter((r) => typeof r === 'string' && r.length > 0)));
  try {
    const response = await fetch(`${API_BASE}/user/dashboard-preferences/${String(userId)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify({ routes: deduped }),
    });
    if (!response.ok) return deduped;
    const data = await response.json();
    return Array.isArray(data?.routes) ? data.routes : deduped;
  } catch {
    return deduped;
  }
}
