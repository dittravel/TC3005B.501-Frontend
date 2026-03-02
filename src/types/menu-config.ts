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
}

export const SIDEBAR_CONFIG: Record<string, MenuItem[]> = {
  'Solicitante': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'flight', category: 'Viajes' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'draft', category: 'Viajes' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'inventory', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'payments', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'paid', category: 'Gastos' }
  ],
  'N1': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box', category: 'Autorizaciones' },
    { label: 'Solicitudes', route: '/solicitudes-autorizador', icon: 'check_box', category: 'Autorizaciones' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'flight', category: 'Viajes' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'draft', category: 'Viajes' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'inventory', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'payments', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'paid', category: 'Gastos' }
  ],
  'N2': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box', category: 'Autorizaciones' },
    { label: 'Solicitudes', route: '/solicitudes-autorizador', icon: 'check_box', category: 'Autorizaciones' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'flight', category: 'Viajes' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'draft', category: 'Viajes' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'inventory', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'payments', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'paid', category: 'Gastos' }
  ],
  'Cuentas por pagar': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Cotizaciones', route: '/cotizaciones', icon: 'paid', category: 'Pagos' },
    { label: 'Comprobaciones', route: '/comprobaciones', icon: 'receipt', category: 'Pagos' }
  ],
  'Agencia de viajes': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Atenciones', route: '/atenciones', icon: 'breaking_news_alt_1', category: 'Gestión' }
  ],
  'Administrador': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Crear Usuario', route: '/crear-usuario', icon: 'manage_accounts', category: 'Gestión' }
  ]
};
