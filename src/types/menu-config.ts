/**
 * Menu configuration for the sidebar navigation.
 * This file defines the structure of the menu items
 * for different user roles in the application.
 */

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

export const SIDEBAR_CONFIG: Record<string, MenuItem[]> = {
  'Solicitante': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'flight' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'draft' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'payments' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'paid' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'inventory' }
  ],
  'N1': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box' },
    { label: 'Solicitudes', route: '/solicitudes-autorizador', icon: 'check_box' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'flight' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'draft' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'payments' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'paid' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'inventory' }
  ],
  'N2': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box' },
    { label: 'Solicitudes', route: '/solicitudes-autorizador', icon: 'check_box' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'flight' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'draft' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'payments' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'paid' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'inventory' }
  ],
  'Cuentas por pagar': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Cotizaciones', route: '/cotizaciones', icon: 'paid' },
    { label: 'Comprobaciones', route: '/comprobaciones', icon: 'receipt' }
  ],
  'Agencia de viajes': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Atenciones', route: '/atenciones', icon: 'breaking_news_alt_1' }
  ],
  'Administrador': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Crear Usuario', route: '/crear-usuario', icon: 'manage_accounts' }
  ]
};
