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
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'note_add', category: 'Viajes' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'edit_document', category: 'Viajes' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'history', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'receipt', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'currency_exchange', category: 'Gastos' }
  ],
  'Autorizador': [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Autorizaciones', route: '/autorizaciones', icon: 'check_box', category: 'Autorizaciones' },
    { label: 'Mis Solicitudes', route: '/solicitudes-autorizador', icon: 'airplane_ticket', category: 'Viajes' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: 'note_add', category: 'Viajes' },
    { label: 'Draft Solicitudes', route: '/solicitudes-draft', icon: 'edit_document', category: 'Viajes' },
    { label: 'Historial De Viajes', route: '/historial', icon: 'history', category: 'Viajes' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: 'receipt', category: 'Gastos' },
    { label: 'Reembolsos', route: '/reembolso', icon: 'currency_exchange', category: 'Gastos' }
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
    { label: 'Importar Datos', route: '/importar-datos', icon: 'file_upload', category: 'Gestión' },
    { label: 'Reglas de Autorización', route: '/reglas-autorizacion', icon: 'rule', category: 'Gestión'},
    { label: 'Roles', route: '/roles', icon: 'people', category: 'Gestión' },
    { label: 'Políticas de Reembolsos', route: '/politicas-reembolso', icon: 'policy', category: 'Gestión' },
  ]
};
