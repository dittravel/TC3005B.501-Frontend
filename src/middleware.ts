/**
 * Middleware for route access control based on
 * user roles and authentication status.
 */

import type { MiddlewareHandler } from 'astro';
import { roleRoutes, allWhitelistedRoutes } from '@config/routeAccess';
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

// Public routes that do NOT require authentication
export const publicRoutes = [ '/login', '/404' ];

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
  
  // 1. Allow access to public routes without authentication
  if (matchPath(pathname, publicRoutes)) {
    return next();
  }
  
  // 2. Get role from cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const roleMatch = cookieHeader.match(/(?:^|;\s*)role=([^;]+)/);
  const role = roleMatch ? decodeURIComponent(roleMatch[1]) : '';
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  const isAuthenticated = !!tokenMatch || !!role; // Consider authenticated if role exists
  const html = unauthorizedPage(pathname, isAuthenticated);

  // 2.1 If no role is found, redirect to login page
  if (!role) {
    return Response.redirect(new URL('/login', request.url), 302);
  }

  // 3. Validate if the requested route exists
  const isKnownRoute = matchPath(pathname, allWhitelistedRoutes);
  if (!isKnownRoute) {
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  // 4. Validate if the user's role allows access to the requested route
  const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] ?? [];
  const isAuthorized = matchPath(pathname, allowedRoutes);

  if (!isAuthorized) {
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  return next();
};