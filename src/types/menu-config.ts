/**
 * Menu configuration for the sidebar navigation.
 * Menu items are shown dynamically based on user permissions,
 * regardless of role. Any user with the required permissions
 * will see the corresponding menu item.
 */

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  category?: string;
  requiredAnyPermissions?: string[];
  requiredAllPermissions?: string[];
}

export const SIDEBAR_CONFIG: MenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'home' },
  { label: 'Mis Solicitudes', route: '/solicitudes', icon: 'airplane_ticket', category: 'Viajes', requiredAnyPermissions: ['travel:create'] },
  { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box', category: 'Autorizaciones', requiredAnyPermissions: ['travel:approve'] },
  { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'receipt', category: 'Gastos', requiredAnyPermissions: ['receipts:create'] },
  { label: 'Reembolsos', route: '/reembolsos', icon: 'currency_exchange', category: 'Gastos', requiredAnyPermissions: ['travel:create'] },
  { label: 'Cotizaciones', route: '/cotizaciones', icon: 'price_change', category: 'Pagos', requiredAnyPermissions: ['travel:def_amount', 'receipts:approve'] },
  { label: 'Comprobantes', route: '/comprobaciones', icon: 'receipt', category: 'Pagos', requiredAnyPermissions: ['receipts:approve'] },
  { label: 'Atenciones', route: '/atenciones', icon: 'luggage', category: 'Gestión', requiredAnyPermissions: ['travel:approve', 'travel:view_flights', 'travel:view_hotels'] },
  { label: 'Usuarios', route: '/usuarios', icon: 'person', category: 'Gestión', requiredAnyPermissions: ['users:view', 'users:create'] },
  { label: 'Roles', route: '/roles', icon: 'admin_panel_settings', category: 'Gestión', requiredAnyPermissions: ['roles:manage'] },
  { label: 'Reglas de Autorización', route: '/reglas-autorizacion', icon: 'gavel', category: 'Gestión', requiredAnyPermissions: ['auth_rules:manage'] },
  { label: 'Políticas de Reembolsos', route: '/politicas-reembolso', icon: 'receipt_long', category: 'Gestión', requiredAnyPermissions: ['refund_policies:manage'] },
  { label: 'Cuentas Contables', route: '/cuentas-contables', icon: 'account_balance', category: 'Gestión', requiredAnyPermissions: ['accounts:view'] },
  { label: 'Importar Datos', route: '/importar-datos', icon: 'file_upload', category: 'Sistema', requiredAnyPermissions: ['system:import_data'] },
  { label: 'Exportar datos contables', route: '/exportar-datos-contables', icon: 'draft', category: 'Sistema', requiredAnyPermissions: ['system:export_accounting'] },
  { label: 'Bitácora', route: '/bitacora', icon: 'history', category: 'Sistema', requiredAnyPermissions: ['system:audit_log'] },
  { label: 'Sociedades', route: '/sociedades', icon: 'domain', category: 'Control Global', requiredAnyPermissions: ['superadmin:manage_groups', 'societies:view'] },
  { label: 'Grupos de sociedades', route: '/grupos-sociedades', icon: 'hub', category: 'Control Global', requiredAnyPermissions: ['superadmin:manage_groups'] },
  { label: 'Administradores maestros', route: '/administradores-maestros', icon: 'admin_panel_settings', category: 'Control Global', requiredAnyPermissions: ['superadmin:manage_master_admins'] },
  { label: 'Bitácora por grupo', route: '/bitacora-grupo', icon: 'history_edu', category: 'Control Global', requiredAnyPermissions: ['superadmin:view_group_audit_log'] },
];
