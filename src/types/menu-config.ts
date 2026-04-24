/**
 * Menu configuration for the sidebar navigation.
 * This file defines the structure of the menu items
 * for different user roles in the application.
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
  { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'note_add', category: 'Viajes', requiredAnyPermissions: ['travel:create'] },
  { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'edit_document', category: 'Viajes', requiredAnyPermissions: ['travel:edit'] },
  { label: 'Historial De Viajes', route: '/historial', icon: 'history', category: 'Viajes', requiredAnyPermissions: ['travel:view'] },
  { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box', category: 'Autorizaciones', requiredAnyPermissions: ['travel:approve', 'travel:reject'] },
  { label: 'Mis Solicitudes', route: '/solicitudes-autorizador', icon: 'airplane_ticket', category: 'Viajes', requiredAnyPermissions: ['travel:approve', 'travel:reject'] },
  { label: 'Atenciones', route: '/atenciones', icon: 'luggage', category: 'Gestión', requiredAnyPermissions: ['travel:view_flights', 'travel:view_hotels'] },
  { label: 'Cotizaciones', route: '/cotizaciones', icon: 'price_change', category: 'Pagos', requiredAnyPermissions: ['receipts:view'] },
  { label: 'Comprobantes', route: '/comprobaciones', icon: 'receipt', category: 'Pagos', requiredAnyPermissions: ['receipts:approve'] },
  { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'receipt', category: 'Gastos', requiredAnyPermissions: ['receipts:create', 'receipts:edit'] },
  { label: 'Reembolsos', route: '/reembolso', icon: 'currency_exchange', category: 'Gastos', requiredAnyPermissions: ['receipts:create', 'receipts:edit'] },
  { label: 'Importar Datos', route: '/importar-datos', icon: 'file_upload', category: 'Sistema', requiredAnyPermissions: ['system:import_data'] },
  { label: 'Exportar datos contables', route: '/exportar-datos-contables', icon: 'draft', category: 'Sistema', requiredAnyPermissions: ['system:export_accounting'] },
  { label: 'Bitácora', route: '/bitacora', icon: 'history', category: 'Sistema', requiredAnyPermissions: ['system:audit_log'] },
  { label: 'Usuarios', route: '/crear-usuario', icon: 'person_add', category: 'Gestión', requiredAnyPermissions: ['users:create', 'users:edit', 'users:view'] },
  { label: 'Roles', route: '/roles', icon: 'people', category: 'Gestión', requiredAnyPermissions: ['users:view'] },
  { label: 'Sociedades', route: '/sociedades', icon: 'workspaces', category: 'Gestión', requiredAnyPermissions: ['societies:view', 'society_groups:view'] },
  { label: 'Reglas de Autorización', route: '/reglas-autorizacion', icon: 'rule', category: 'Gestión', requiredAnyPermissions: ['travel:def_amount'] },
  { label: 'Políticas de Reembolsos', route: '/politicas-reembolso', icon: 'policy', category: 'Gestión', requiredAnyPermissions: ['travel:def_amount'] },
];
