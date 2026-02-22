/**
 * Cookies
 * 
 * Utilities for managing user session cookies in an Astro application.
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
    return mockSession;
  }

  const username = realCookies.get("username")?.value || "";
  const id = realCookies.get("user_id")?.value || "";
  const department_id = realCookies.get("department_id")?.value || "";
  const role = realCookies.get("role")?.value || "";
  const token = realCookies.get("token")?.value || ""; 
  
  const session: Session = { username, id, department_id, role: role as UserRole, token };
  return session;
}

type CookieKey = keyof Session;

/**
 * Retrieves a specific value from the user session cookies based on the provided key.
 */
export function getCookie(key: CookieKey, cookies?: APIContext["cookies"]): string | UserRole | undefined {
  return getSession(cookies)[key];
}