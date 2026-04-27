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

export const SIDEBAR_CONFIG: Record<string, MenuItem[]> = {
  'Solicitante': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Mis Solicitudes', route: '/solicitudes', icon: 'airplane_ticket', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'receipt', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolsos', icon: 'currency_exchange', category: 'Gastos' }
  ],
  'Autorizador': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box', category: 'Autorizaciones' },
    { label: 'Mis Solicitudes', route: '/solicitudes', icon: 'airplane_ticket', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'receipt', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolsos', icon: 'currency_exchange', category: 'Gastos' }
  ],
  'Cuentas por pagar': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Cotizaciones', route: '/cotizaciones', icon: 'price_change', category: 'Pagos' },
    { label: 'Comprobantes', route: '/comprobaciones', icon: 'receipt', category: 'Pagos' }
  ],
  'Agencia de viajes': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Atenciones', route: '/atenciones', icon: 'luggage', category: 'Gestión' }
  ],
  'Administrador': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Usuarios', route: '/usuarios', icon: 'person', category: 'Gestión' },
    { label: 'Roles', route: '/roles', icon: 'admin_panel_settings', category: 'Gestión' },
    { label: 'Reglas de Autorización', route: '/reglas-autorizacion', icon: 'gavel', category: 'Gestión'},
    { label: 'Políticas de Reembolsos', route: '/politicas-reembolso', icon: 'receipt_long', category: 'Gestión' },
    { label: 'Importar Datos', route: '/importar-datos', icon: 'file_upload', category: 'Sistema' },
    { label: 'Exportar datos contables', route: '/exportar-datos-contables', icon: 'draft', category: 'Sistema'},
    { label: 'Bitácora', route: '/bitacora', icon: 'history', category: 'Sistema' },
  ],
  'Superadministrador': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Sociedades', route: '/sociedades', icon: 'domain', category: 'Control Global' },
    { label: 'Grupos de sociedades', route: '/grupos-sociedades', icon: 'hub', category: 'Control Global' },
    { label: 'Administradores maestros', route: '/administradores-maestros', icon: 'admin_panel_settings', category: 'Control Global' },
    { label: 'Bitácora por grupo', route: '/bitacora-grupo', icon: 'history_edu', category: 'Control Global' },
  ]
};
