import type { UserRole } from '@type/roles';
import { hasRoutePermission } from '@config/routeAccess';

export type DashboardActionDefinition = {
  label: string;
  route: string;
  description: string;
  iconKey:
    | 'autorizaciones'
    | 'usuarios'
    | 'roles'
    | 'reglas'
    | 'politicas'
    | 'exportar'
    | 'crear'
    | 'comprobar'
    | 'reembolsos'
    | 'cotizaciones'
    | 'comprobantes'
    | 'atenciones'
    | 'sociedades'
    | 'grupos'
    | 'maestros'
    | 'bitacora';
  requiredRoles?: UserRole[];
  requiredAnyPermissions?: string[];
  requiredAllPermissions?: string[];
  defaultPriority?: number;
};

export const MAX_DASHBOARD_QUICK_ACTIONS = 6;

export const DASHBOARD_ACTION_CATALOG: DashboardActionDefinition[] = [
  { label: 'Autorizaciones', route: '/autorizaciones', iconKey: 'autorizaciones', description: 'Revisa y autoriza solicitudes pendientes', requiredAnyPermissions: ['travel:approve', 'travel:reject'], defaultPriority: 10 },
  { label: 'Usuarios', route: '/usuarios', iconKey: 'usuarios', description: 'Consulta y gestiona usuarios', requiredAllPermissions: ['users:view'], defaultPriority: 15 },
  { label: 'Roles', route: '/roles', iconKey: 'roles', description: 'Administra roles y permisos', requiredAllPermissions: ['users:view'], defaultPriority: 20 },
  { label: 'Reglas de autorización', route: '/reglas-autorizacion', iconKey: 'reglas', description: 'Configura reglas y montos de autorización', requiredAllPermissions: ['travel:def_amount'], defaultPriority: 25 },
  { label: 'Políticas de reembolso', route: '/politicas-reembolso', iconKey: 'politicas', description: 'Administra políticas de reembolso', requiredAllPermissions: ['travel:def_amount'], defaultPriority: 30 },
  { label: 'Exportar datos contables', route: '/exportar-datos-contables', iconKey: 'exportar', description: 'Exporta datos contables para auditoría', requiredAllPermissions: ['system:export_accounting'], defaultPriority: 35 },
  { label: 'Crear Solicitud', route: '/crear-solicitud', iconKey: 'crear', description: 'Inicia una nueva solicitud de viaje', requiredAllPermissions: ['travel:create'], defaultPriority: 40 },
  { label: 'Comprobar Gastos', route: '/comprobar-gastos', iconKey: 'comprobar', description: 'Adjunta comprobantes de gastos', requiredAnyPermissions: ['receipts:create', 'receipts:edit', 'receipts:view'], defaultPriority: 45 },
  { label: 'Reembolsos', route: '/reembolsos', iconKey: 'reembolsos', description: 'Consulta el estado de tus reembolsos', requiredAnyPermissions: ['refunds:request', 'refunds:budget', 'refunds:approve'], defaultPriority: 50 },
  { label: 'Cotizaciones', route: '/cotizaciones', iconKey: 'cotizaciones', description: 'Gestiona solicitudes por cotizar', requiredAnyPermissions: ['travel:view_flights', 'travel:view_hotels', 'receipts:view'], defaultPriority: 55 },
  { label: 'Comprobantes', route: '/comprobaciones', iconKey: 'comprobantes', description: 'Revisa comprobantes de gastos', requiredAllPermissions: ['receipts:view'], defaultPriority: 60 },
  { label: 'Atenciones', route: '/atenciones', iconKey: 'atenciones', description: 'Atiende solicitudes de viaje asignadas', requiredAllPermissions: ['travel:approve'], defaultPriority: 65 },
  { label: 'Sociedades', route: '/sociedades', iconKey: 'sociedades', description: 'Consulta sociedades y su configuración', requiredRoles: ['Superadministrador'], requiredAllPermissions: ['superadmin:manage_groups'], defaultPriority: 70 },
  { label: 'Grupos de sociedades', route: '/grupos-sociedades', iconKey: 'grupos', description: 'Gestiona grupos de sociedades y alta inicial por grupo', requiredRoles: ['Superadministrador'], requiredAllPermissions: ['superadmin:manage_groups'], defaultPriority: 5 },
  { label: 'Administradores maestros', route: '/administradores-maestros', iconKey: 'maestros', description: 'Crea y gestiona superadministradores del sistema', requiredRoles: ['Superadministrador'], requiredAllPermissions: ['superadmin:manage_master_admins'], defaultPriority: 12 },
  { label: 'Bitácora por grupo', route: '/bitacora-grupo', iconKey: 'bitacora', description: 'Consulta bitácoras filtradas por grupo de sociedades', requiredRoles: ['Superadministrador'], requiredAllPermissions: ['superadmin:view_group_audit_log'], defaultPriority: 18 },
];

export function getAccessibleDashboardActions(role: UserRole, permissionKeys: string[] = []): DashboardActionDefinition[] {
  const permissionSet = new Set((permissionKeys || []).map((permission) => String(permission).trim()).filter(Boolean));

  return DASHBOARD_ACTION_CATALOG
    .filter((action) => {
      const requiredRoles = action.requiredRoles || [];
      const matchesRole = requiredRoles.length === 0 ? true : requiredRoles.includes(role);
      const requiredAnyPermissions = action.requiredAnyPermissions || [];
      const requiredAllPermissions = action.requiredAllPermissions || [];

      const matchesAny = requiredAnyPermissions.length === 0
        ? true
        : requiredAnyPermissions.some((permission) => permissionSet.has(permission));

      const matchesAll = requiredAllPermissions.length === 0
        ? true
        : requiredAllPermissions.every((permission) => permissionSet.has(permission));

      return matchesRole && matchesAny && matchesAll && hasRoutePermission(action.route, permissionKeys);
    })
    .sort((left, right) => (left.defaultPriority || 999) - (right.defaultPriority || 999));
}
