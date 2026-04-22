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
    '/solicitudes',
    '/crear-solicitud',
    '/reembolsos',
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
    '/solicitudes',
    '/crear-solicitud',
    '/reembolsos',
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
    '/usuarios',
    '/crear-usuario','/editar-usuario/*',
    '/importar-datos',
    '/reglas-autorizacion','/crear-regla','/editar-regla/*',
    '/roles','/crear-rol','/editar-rol/*',
    '/politicas-reembolso', '/editar-politica-reembolso/*', '/crear-politica-reembolso',
    '/exportar-datos-contables',
    '/sociedades', '/sociedades/*',
    '/grupos-sociedades', '/grupos-sociedades/*',
    '/bitacora',
  ],
};

// Public routes not tied to any role — must be reachable without authentication
const publicOnlyRoutes: string[] = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

// Flatten all routes into a single array for easy access control checks
export const allWhitelistedRoutes: string[] = [
  ...Object.values(roleRoutes).flat(),
  ...publicOnlyRoutes,
];