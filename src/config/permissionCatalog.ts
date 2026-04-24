export type PermissionOption = {
  key: string;
  label: string;
};

export type PermissionCategory = {
  category: string;
  permissions: PermissionOption[];
};

export const permissionsByCategory: PermissionCategory[] = [
  {
    category: 'Usuarios',
    permissions: [
      { key: 'users:view', label: 'Ver usuarios' },
      { key: 'users:create', label: 'Crear usuarios' },
      { key: 'users:edit', label: 'Editar usuarios' },
      { key: 'users:delete', label: 'Eliminar usuarios' },
    ],
  },
  {
    category: 'Sociedades',
    permissions: [
      { key: 'societies:view', label: 'Ver sociedades' },
      { key: 'societies:create', label: 'Crear sociedades' },
      { key: 'societies:edit', label: 'Editar sociedades' },
      { key: 'societies:delete', label: 'Eliminar sociedades' },
    ],
  },
  {
    category: 'Grupos de sociedades',
    permissions: [
      { key: 'society_groups:view', label: 'Ver grupos de sociedades' },
      { key: 'society_groups:create', label: 'Crear grupos de sociedades' },
      { key: 'society_groups:edit', label: 'Editar grupos de sociedades' },
      { key: 'society_groups:delete', label: 'Eliminar grupos de sociedades' },
    ],
  },
  {
    category: 'Solicitudes de viaje',
    permissions: [
      { key: 'travel:view', label: 'Ver solicitudes' },
      { key: 'travel:create', label: 'Crear solicitudes' },
      { key: 'travel:edit', label: 'Editar solicitudes' },
      { key: 'travel:delete', label: 'Eliminar solicitudes' },
      { key: 'travel:approve', label: 'Aprobar/Rechazar solicitudes' },
      { key: 'travel:def_amount', label: 'Definir monto a autorizar' },
      { key: 'travel:view_flights', label: 'Ver opciones de vuelos' },
      { key: 'travel:view_hotels', label: 'Ver opciones de hoteles' },
      { key: 'travel:finalize', label: 'Finalizar viaje' },
      { key: 'travel:cancel', label: 'Cancelar viaje' },
      { key: 'travel:reject', label: 'Rechazar viaje' },
    ],
  },
  {
    category: 'Comprobantes',
    permissions: [
      { key: 'receipts:view', label: 'Ver comprobantes' },
      { key: 'receipts:create', label: 'Crear comprobantes' },
      { key: 'receipts:edit', label: 'Editar comprobantes' },
      { key: 'receipts:delete', label: 'Eliminar comprobantes' },
      { key: 'receipts:approve', label: 'Aprobar/Rechazar comprobantes' },
    ],
  },
  {
    category: 'Reembolsos',
    permissions: [
      { key: 'refunds:request', label: 'Solicitar reembolsos' },
      { key: 'refunds:budget', label: 'Asignar presupuesto impuesto' },
      { key: 'refunds:approve', label: 'Aprobar/Rechazar reembolso' },
    ],
  },
  {
    category: 'Sistema',
    permissions: [
      { key: 'system:audit_log', label: 'Ver bitácora de acciones' },
      { key: 'system:import_data', label: 'Importar datos' },
      { key: 'system:export_accounting', label: 'Exportar datos contables' },
    ],
  },
];

export const permissionLabelToKey: Record<string, string> = {
  'Ver usuarios': 'users:view',
  'Crear usuarios': 'users:create',
  'Editar usuarios': 'users:edit',
  'Eliminar usuarios': 'users:delete',
  'Ver usuario': 'users:view',
  'Crear usuario': 'users:create',
  'Editar usuario': 'users:edit',
  'Eliminar usuario': 'users:delete',
  'Ver sociedades': 'societies:view',
  'Crear sociedades': 'societies:create',
  'Editar sociedades': 'societies:edit',
  'Eliminar sociedades': 'societies:delete',
  'Ver sociedad': 'societies:view',
  'Crear sociedad': 'societies:create',
  'Editar sociedad': 'societies:edit',
  'Eliminar sociedad': 'societies:delete',
  'Ver grupos de sociedades': 'society_groups:view',
  'Crear grupos de sociedades': 'society_groups:create',
  'Editar grupos de sociedades': 'society_groups:edit',
  'Eliminar grupos de sociedades': 'society_groups:delete',
  'Ver grupo de sociedad': 'society_groups:view',
  'Crear grupo de sociedad': 'society_groups:create',
  'Editar grupo de sociedad': 'society_groups:edit',
  'Eliminar grupo de sociedad': 'society_groups:delete',
  'Ver solicitudes': 'travel:view',
  'Crear solicitudes': 'travel:create',
  'Editar solicitudes': 'travel:edit',
  'Eliminar solicitudes': 'travel:delete',
  'Aprobar/Rechazar solicitudes': 'travel:approve',
  'Definir monto a autorizar': 'travel:def_amount',
  'Ver opciones de vuelos': 'travel:view_flights',
  'Ver opciones de hoteles': 'travel:view_hotels',
  'Finalizar viaje': 'travel:finalize',
  'Cancelar viaje': 'travel:cancel',
  'Rechazar viaje': 'travel:reject',
  'Ver solicitud': 'travel:view',
  'Crear solicitud': 'travel:create',
  'Editar solicitud': 'travel:edit',
  'Eliminar solicitud': 'travel:delete',
  'Aprobar/Rechazar solicitud': 'travel:approve',
  'Ver comprobantes': 'receipts:view',
  'Crear comprobantes': 'receipts:create',
  'Editar comprobantes': 'receipts:edit',
  'Eliminar comprobantes': 'receipts:delete',
  'Aprobar/Rechazar comprobantes': 'receipts:approve',
  'Solicitar reembolsos': 'refunds:request',
  'Asignar presupuesto impuesto': 'refunds:budget',
  'Aprobar/Rechazar reembolso': 'refunds:approve',
  'Ver bitácora de acciones': 'system:audit_log',
  'Importar datos': 'system:import_data',
  'Exportar datos contables': 'system:export_accounting',
};
