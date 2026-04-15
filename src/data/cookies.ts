/**
 * Cookies
 * 
 * Utilities for managing user session cookies in an Astro application.
 * 
 * const mockCookies = {
 *  username: "John Doe",
 *  id: "1",
 *  departmentId: "1",
 *  role: "Applicant" as UserRole //'Applicant' | 'Authorizer' | 'Admin' | 'AccountsPayable' | 'TravelAgency';
 * };
 * 
 * import type { UserRole } from "@type/roles";
 * 
 * export const getCookie = (key: keyof typeof mockCookies): string | UserRole => {
 *     return mockCookies[key];
 * };
 */

import type { APIContext } from "astro";
import type { UserRole } from "@type/roles";

// Information stores in cookies
export type Session = {
  username: string;
  id: string;
  role: UserRole;
  department_id?: string;
  token: string;
  society_id?: string;
  society_group_id?: string;
};

// Mock session for development/testing when cookies are not available
const mockSession: Session = {
  username: "John Doe",
  id: "1",
  department_id: "1",
  role: "Solicitante" as UserRole, // Solicitante, Agencia de viajes, Cuentas por pagar, N1, N2, Administrador
  token: "token",
};

/**
 * Resolves the cookies object from the Astro global context.
 * This function checks if the Astro global is available and has a cookies property.
 * If not, it returns null, allowing the calling code to handle the absence of cookies.
 */
function resolveCookies(): APIContext["cookies"] | null {
  const astro = (globalThis as any).Astro;
  if (astro && astro.cookies && typeof astro.cookies.get === "function") {
    return astro.cookies;
  }
  console.warn("[WARN] resolveCookies(): Astro.cookies is not available in this context.");
  return null;
}

/**
 * Retrieves the user session information from cookies.
 * If cookies are not available, it returns a mock session for development/testing purposes.
 * The function accepts an optional cookies parameter, allowing callers to provide a custom 
 * cookies object (e.g., for testing).
 */
export function getSession(cookies?: APIContext["cookies"]): Session {
  const realCookies = cookies || resolveCookies();

  if (!realCookies) {
    console.warn("[WARN] No cookies available, returning mock session");
    // return mockSession;
    return {
      username: "",
      id: "",
      department_id: "",
      role: "" as UserRole,
      token: "",
    }
  }

  const username = realCookies.get("username")?.value || "";
  const id = realCookies.get("id")?.value || "";
  const department_id = realCookies.get("department_id")?.value || "";
  const role = realCookies.get("role")?.value || "";
  const token = realCookies.get("token")?.value || "";
  const society_id = realCookies.get("society_id")?.value || "";
  const society_group_id = realCookies.get("society_group_id")?.value || "";

  const session: Session = { username, id, department_id, role: role as UserRole, token, society_id, society_group_id };
  return session;
}

type CookieKey = keyof Session;

/**
 * Retrieves a specific value from the user session cookies based on the provided key.
 * When called from client-side (React), reads directly from document.cookie
 * When called from server-side (Astro), uses the provided cookies object
 */
export function getCookie(key: CookieKey, cookies?: APIContext["cookies"]): string | UserRole | undefined {
  // If cookies parameter is provided (server-side), use getSession
  if (cookies) {
    return getSession(cookies)[key];
  }
  
  // Map Session keys to actual cookie names
  const cookieNameMap: Record<CookieKey, string> = {
    username: "username",
    id: "id",
    role: "role",
    department_id: "department_id",
    token: "token",
    society_id: "society_id",
    society_group_id: "society_group_id",
  };
  
  const cookieName = cookieNameMap[key];
  
  // Try to get from document.cookie (client-side)
  if (typeof document !== "undefined") {
    const matches = document.cookie.split("; ").find(row => row.startsWith(cookieName + "="));
    if (matches) {
      return matches.split("=")[1];
    }
  }
  
  // Fallback to getSession with null cookies
  return getSession(cookies)[key];
}