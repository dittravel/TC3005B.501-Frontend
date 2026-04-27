/**
 * Middleware for route access control based on
 * user roles and authentication status.
 */

import type { MiddlewareHandler } from 'astro';
import { roleRoutes, allWhitelistedRoutes, hasRoutePermission } from '@config/routeAccess';
import { unauthorizedPage } from '@utils/unauthorizedPage';

/**
 * Helper function to check if a path matches any of the given patterns.
 * Supports exact matches and wildcard patterns (e.g., '/admin/*').
 * @param path The URL path to check
 * @param patterns An array of route patterns to match against
 * @returns True if the path matches any pattern, false otherwise
 */
function matchPath(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.endsWith('/*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  });
}

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Public routes that do NOT require authentication
export const publicRoutes = [
  // Default public routes
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/404',
  // Routes acceded by email links
  // NOTE: Only authenticated users can access these,
  // but we allow them to be accessed without a role
  // for email links to work
  '/detalles-solicitud/*',
  '/comprobar-solicitud/*',
  '/atender-solicitud/*',
  '/cotizar-solicitud/*',
  '/presupuesto-viaje/*',
  '/resultado-accion-email',
];

/**
 * Middleware handler to enforce route access control based on user roles.
 * It checks the requested path against public routes, extracts the user's role from cookies,
 * and determines if the user is authorized to access the route.
 * 
 * @param context The middleware context containing the request and other information
 * @param next The next middleware function to call if access is granted
 * @returns A Response object if access is denied, or calls next() if access is granted
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 1. Allow public routes without authentication
  if (matchPath(pathname, publicRoutes)) {
    return next();
  }

  // 2. Get role and tokenes from cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const roleMatch = /(?:^|;\s*)role=([^;]+)/.exec(cookieHeader);
  const role = roleMatch ? decodeURIComponent(roleMatch[1]) : '';
  const tokenMatch = /(?:^|;\s*)token=([^;]+)/.exec(cookieHeader);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
  const isAuthenticated = !!tokenMatch || !!role;
  const html = unauthorizedPage(pathname, isAuthenticated);

  // If token is missing, force re-authentication instead of rendering protected pages.
  if (!tokenMatch) {
    return Response.redirect(new URL('/login', request.url), 302);
  }

  // 2.1 If no role is found, redirect to login page
  if (!role) {
    return Response.redirect(new URL('/login', request.url), 302);
  }

  // 2.2 Basic token payload validation to prevent SSR pages from crashing with 401 API calls.
  const tokenPayload = parseJwtPayload(token);
  if (!tokenPayload) {
    return Response.redirect(new URL('/login', request.url), 302);
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof tokenPayload.exp === 'number' && tokenPayload.exp <= now) {
    return Response.redirect(new URL('/login', request.url), 302);
  }
  
  const hasSocietyContext = tokenPayload.society_id != null || tokenPayload.society_group_id != null;
  if (!hasSocietyContext) {
    return Response.redirect(new URL('/login', request.url), 302);
  }

  const permissionKeys = Array.isArray(tokenPayload.permissions)
    ? tokenPayload.permissions.map((permission) => String(permission).trim()).filter(Boolean)
    : [];
  // 3. Check if the route is registered in the system
  const isKnownRoute = matchPath(pathname, allWhitelistedRoutes);
  if (!isKnownRoute) {
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  // 4. Check if the role and/or permission keys have access to the route
  const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] ?? [];
  const authorizedByRole = matchPath(pathname, allowedRoutes);
  const authorizedByPermission = hasRoutePermission(pathname, permissionKeys);
  const isAuthorized = authorizedByRole || authorizedByPermission;

  if (!isAuthorized) {
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  return next();
};