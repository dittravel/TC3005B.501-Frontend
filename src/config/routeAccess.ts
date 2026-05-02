/**
 * Route Access
 * 
 * Mapping of user roles to their accessible routes in the application
 * Este file es importante revisarlo particularmente por lo de los roles custom -_-
 */

import type { UserRole } from '@type/roles';

export const roleRoutes: Record<UserRole, string[]> = {
  'Solicitante': [
    '/dashboard',
    '/perfil-usuario',
    '/solicitudes',
    '/crear-solicitud',
    '/reembolsos',
    '/comprobar-gastos',
    '/editar-borrador/*',
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
    '/reembolsos',
    '/cotizaciones',
    '/comprobaciones',
    '/cotizar-solicitud/*',
    '/comprobar-gastos/*'
  ],
  'Autorizador': [
    '/dashboard',
    '/perfil-usuario',
    '/solicitudes',
    '/crear-solicitud',
    '/reembolsos',
    '/comprobar-gastos',
    '/editar-borrador/*',
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
    '/usuarios',
    '/crear-usuario','/editar-usuario/*',
    '/importar-datos',
    '/reglas-autorizacion','/crear-regla','/editar-regla/*',
    '/roles','/crear-rol','/editar-rol/*',
    '/politicas-reembolso', '/editar-politica-reembolso/*', '/crear-politica-reembolso',
    '/exportar-datos-contables',
    '/bitacora',
  ],
  'Superadministrador': [
    '/dashboard',
    '/perfil-usuario',
    '/sociedades',
    '/sociedades/*',
    '/grupos-sociedades',
    '/grupos-sociedades/*',
    '/administradores-maestros',
    '/bitacora-grupo',
  ],
};

type PermissionRouteRule = {
  pattern: string;
  permissions: string[];
  mode?: 'all' | 'any';
};

export const permissionRouteRules: PermissionRouteRule[] = [
  { pattern: '/usuarios', permissions: ['users:view'] },
  { pattern: '/crear-usuario', permissions: ['users:create'] },
  { pattern: '/editar-usuario/*', permissions: ['users:edit'] },
  { pattern: '/importar-datos', permissions: ['system:import_data'] },
  { pattern: '/roles', permissions: ['roles:manage'] },
  { pattern: '/crear-rol', permissions: ['roles:manage'] },
  { pattern: '/editar-rol/*', permissions: ['roles:manage'] },
  { pattern: '/reglas-autorizacion', permissions: ['auth_rules:manage'] },
  { pattern: '/crear-regla', permissions: ['auth_rules:manage'] },
  { pattern: '/editar-regla/*', permissions: ['auth_rules:manage'] },
  { pattern: '/politicas-reembolso', permissions: ['refund_policies:manage'] },
  { pattern: '/editar-politica-reembolso/*', permissions: ['refund_policies:manage'] },
  { pattern: '/crear-politica-reembolso', permissions: ['refund_policies:manage'] },
  { pattern: '/bitacora', permissions: ['system:audit_log'] },
  { pattern: '/sociedades', permissions: ['superadmin:manage_groups', 'societies:view'], mode: 'any' },
  { pattern: '/sociedades/nueva', permissions: ['superadmin:manage_groups'] },
  { pattern: '/sociedades/*', permissions: ['superadmin:manage_groups', 'societies:view'], mode: 'any' },
  { pattern: '/grupos-sociedades', permissions: ['superadmin:manage_groups'] },
  { pattern: '/grupos-sociedades/nuevo', permissions: ['superadmin:manage_groups'] },
  { pattern: '/grupos-sociedades/*', permissions: ['superadmin:manage_groups'] },
  { pattern: '/administradores-maestros', permissions: ['superadmin:manage_master_admins'] },
  { pattern: '/bitacora-grupo', permissions: ['superadmin:view_group_audit_log'] },
  { pattern: '/exportar-datos-contables', permissions: ['system:export_accounting'] },
  { pattern: '/cotizaciones', permissions: ['receipts:approve'], mode: 'any' },
  { pattern: '/cotizar-solicitud/*', permissions: ['receipts:approve'], mode: 'any' },
  { pattern: '/comprobaciones', permissions: ['receipts:approve'] },
  { pattern: '/comprobar-gastos/*', permissions: ['receipts:create'] },
  { pattern: '/autorizaciones', permissions: ['travel:approve', 'travel:reject'], mode: 'any' },
  { pattern: '/autorizar-solicitud/*', permissions: ['travel:approve', 'travel:reject'], mode: 'any' },
  { pattern: '/atenciones', permissions: ['travel:view_flights', 'travel:view_hotels'], mode: 'any' },
  { pattern: '/atender-solicitud/*', permissions: ['travel:approve'] },
  { pattern: '/crear-solicitud', permissions: ['travel:create'] },
  { pattern: '/solicitudes-draft', permissions: ['travel:edit'] },
  { pattern: '/editar-borrador/*', permissions: ['travel:edit'] },
  { pattern: '/solicitudes', permissions: ['travel:view', 'travel:approve', 'travel:reject'], mode: 'any' },
  { pattern: '/editar-solicitud/*', permissions: ['travel:edit'] },
  { pattern: '/detalles-solicitud/*', permissions: ['travel:view'] },
  { pattern: '/comprobar-solicitud/*', permissions: ['travel:view'] },
  { pattern: '/comprobar-gastos', permissions: ['receipts:create', 'receipts:edit', 'receipts:view'], mode: 'any' },
  { pattern: '/subir-comprobante/*', permissions: ['receipts:create'] },
  { pattern: '/resubir-comprobante/*', permissions: ['receipts:edit'] },
  { pattern: '/editar-comprobante/*', permissions: ['receipts:edit'] },
  { pattern: '/reembolsos', permissions: ['travel:create'] },
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