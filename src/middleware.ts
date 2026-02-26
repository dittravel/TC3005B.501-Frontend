import type { MiddlewareHandler } from 'astro';
import { roleRoutes, allWhitelistedRoutes } from '@config/routeAccess';
import { unauthorizedPage } from '@utils/unauthorizedPage';

function matchPath(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.endsWith('/*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  });
}
export const publicRoutes = [ '/login', '/404' ];

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 1. Allow public routes without authentication
  if (matchPath(pathname, publicRoutes)) {
    return next();
  }
  
  // 2. Get role from cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const roleMatch = cookieHeader.match(/(?:^|;\s*)role=([^;]+)/);
  const role = roleMatch ? decodeURIComponent(roleMatch[1]) : '';
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  const isAuthenticated = !!tokenMatch || !!role;
  const html = unauthorizedPage(pathname, isAuthenticated);

  // 2.1 If no role is found, redirect to login page
  if (!role) {
    return Response.redirect(new URL('/login', request.url), 302);
  }

  // 3. Check if the route is registered in the system
  const isKnownRoute = matchPath(pathname, allWhitelistedRoutes);
  if (!isKnownRoute) {
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  // 4. Check if the role has access to the route
  const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] ?? [];
  const isAuthorized = matchPath(pathname, allowedRoutes);

  if (!isAuthorized) {
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  return next();
};