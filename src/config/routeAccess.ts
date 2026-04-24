/**
 * Route Access
 * 
 * Mapping of user roles to their accessible routes in the application
 */

import type { UserRole } from '@type/roles';

export const roleRoutes: Record<UserRole, string[]> = {
  'Solicitante': [
    '/dashboard',
    '/perfil-usuario',
    '/crear-solicitud',
    '/historial',
    '/reembolso',
    '/solicitudes-draft',
    '/comprobar-gastos',
    '/completar-draft/*',
    '/editar-solicitud/*',
    '/comprobar-solicitud/*',
    '/detalles-solicitud/*',
    '/subir-comprobante/*',
    '/resubir-comprobante/*',
    '/editar-comprobante/*'
  ],
  'Agencia de viajes': [
    '/dashboard',
    '/perfil-usuario',
    '/atenciones',
    '/atender-solicitud/*'
  ],
  'Cuentas por pagar': [
    '/dashboard',
    '/perfil-usuario',
    '/cotizaciones',
    '/comprobaciones',
    '/cotizar-solicitud/*',
    '/comprobar-gastos/*'
  ],
  'Autorizador': [
    '/dashboard',
    '/perfil-usuario',
    '/solicitudes-autorizador',
    '/crear-solicitud',
    '/historial',
    '/reembolso',
    '/solicitudes-draft',
    '/comprobar-gastos',
    '/completar-draft/*',
    '/editar-solicitud/*',
    '/comprobar-solicitud/*',
    '/autorizaciones',
    '/detalles-solicitud/*',
    '/autorizar-solicitud/*',
    '/subir-comprobante/*',
    '/editar-comprobante/*'
  ],
  'Administrador': [
    '/dashboard',
    '/perfil-usuario',
    '/crear-usuario','/editar-usuario/*',
    '/importar-datos',
    '/reglas-autorizacion','/crear-regla','/editar-regla/*',
    '/roles','/crear-rol','/editar-rol/*',
    '/politicas-reembolso', '/edit-politica-rembolso',
    '/exportar-datos-contables',
    '/sociedades', '/sociedades/*',
    '/grupos-sociedades', '/grupos-sociedades/*',
    '/bitacora',
  ],
};

type PermissionRouteRule = {
  pattern: string;
  permissions: string[];
  mode?: 'all' | 'any';
};

export const permissionRouteRules: PermissionRouteRule[] = [
  { pattern: '/crear-usuario', permissions: ['users:create'] },
  { pattern: '/editar-usuario/*', permissions: ['users:edit'] },
  { pattern: '/importar-datos', permissions: ['system:import_data'] },
  { pattern: '/roles', permissions: ['users:view'] },
  { pattern: '/crear-rol', permissions: ['users:create'] },
  { pattern: '/editar-rol/*', permissions: ['users:edit'] },
  { pattern: '/reglas-autorizacion', permissions: ['travel:def_amount'] },
  { pattern: '/crear-regla', permissions: ['travel:def_amount'] },
  { pattern: '/editar-regla/*', permissions: ['travel:def_amount'] },
  { pattern: '/politicas-reembolso', permissions: ['travel:def_amount'] },
  { pattern: '/edit-politica-rembolso', permissions: ['travel:def_amount'] },
  { pattern: '/bitacora', permissions: ['system:audit_log'] },
  { pattern: '/sociedades', permissions: ['societies:view', 'society_groups:view'], mode: 'any' },
  { pattern: '/sociedades/nueva', permissions: ['societies:create'] },
  { pattern: '/sociedades/*', permissions: ['societies:edit'] },
  { pattern: '/grupos-sociedades', permissions: ['society_groups:view'] },
  { pattern: '/grupos-sociedades/nuevo', permissions: ['society_groups:create'] },
  { pattern: '/grupos-sociedades/*', permissions: ['society_groups:edit'] },
  { pattern: '/exportar-datos-contables', permissions: ['system:export_accounting'] },
  { pattern: '/cotizaciones', permissions: ['travel:view_flights', 'travel:view_hotels', 'receipts:view'], mode: 'any' },
  { pattern: '/cotizar-solicitud/*', permissions: ['travel:view_flights', 'travel:view_hotels', 'receipts:view'], mode: 'any' },
  { pattern: '/comprobaciones', permissions: ['receipts:view'] },
  { pattern: '/comprobar-gastos/*', permissions: ['receipts:view'] },
  { pattern: '/autorizaciones', permissions: ['travel:approve', 'travel:reject'], mode: 'any' },
  { pattern: '/autorizar-solicitud/*', permissions: ['travel:approve', 'travel:reject'], mode: 'any' },
  { pattern: '/atenciones', permissions: ['travel:approve'] },
  { pattern: '/atender-solicitud/*', permissions: ['travel:approve'] },
  { pattern: '/crear-solicitud', permissions: ['travel:create'] },
  { pattern: '/solicitudes-draft', permissions: ['travel:edit'] },
  { pattern: '/completar-draft/*', permissions: ['travel:edit'] },
  { pattern: '/editar-solicitud/*', permissions: ['travel:edit'] },
  { pattern: '/historial', permissions: ['travel:view'] },
  { pattern: '/solicitudes-autorizador', permissions: ['travel:approve', 'travel:reject'], mode: 'any' },
  { pattern: '/detalles-solicitud/*', permissions: ['travel:view'] },
  { pattern: '/comprobar-solicitud/*', permissions: ['travel:view'] },
  { pattern: '/comprobar-gastos', permissions: ['receipts:create', 'receipts:edit', 'receipts:view'], mode: 'any' },
  { pattern: '/subir-comprobante/*', permissions: ['receipts:create'] },
  { pattern: '/resubir-comprobante/*', permissions: ['receipts:edit'] },
  { pattern: '/editar-comprobante/*', permissions: ['receipts:edit'] },
  { pattern: '/reembolso', permissions: ['receipts:create', 'receipts:edit'], mode: 'any' },
];

export function hasRoutePermission(pathname: string, permissionKeys: string[] = []): boolean {
  const permissionsSet = new Set((permissionKeys || []).map((permission) => String(permission).trim()).filter(Boolean));

  const matchingRules = permissionRouteRules.filter(({ pattern }) => {
    if (pattern.endsWith('/*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern;
  });

  if (matchingRules.length === 0) {
    return true;
  }

  return matchingRules.some(({ permissions, mode = 'all' }) => {
    if (!permissions.length) return true;
    if (mode === 'any') {
      return permissions.some((permission) => permissionsSet.has(permission));
    }
    return permissions.every((permission) => permissionsSet.has(permission));
  });
}

// Public routes not tied to any role — must be reachable without authentication
const publicOnlyRoutes: string[] = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

// Flatten all routes into a single array for easy access control checks
export const allWhitelistedRoutes: string[] = [
  ...Object.values(roleRoutes).flat(),
  ...permissionRouteRules.map((rule) => rule.pattern),
  ...publicOnlyRoutes,
];