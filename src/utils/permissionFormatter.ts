/**
 * Permission Formatter Utility
 *
 * Converts a list of permission names or keys into human-friendly module labels.
 * Examples:
 * - ["Ver usuario", "Editar usuario"] -> "Usuario"
 * - ["Ver usuario", "Ver comprobantes"] -> "Usuario, Recibos"
 * - ["users:view", "receipts:edit"] -> "Usuario, Recibos"
 */

type ModuleDefinition = {
  label: string;
  aliases: string[];
};

const PERMISSIONS_PREFIX = 'Permisos: ';

const moduleDefinitions: ModuleDefinition[] = [
  { label: 'Usuario', aliases: ['users', 'usuario', 'usuarios'] },
  { label: 'Grupos de sociedades', aliases: ['society_group', 'society_groups', 'grupo de sociedad', 'grupos de sociedad'] },
  { label: 'Viajes', aliases: ['travel', 'travel_requests', 'solicitud', 'solicitudes', 'viaje', 'viajes', 'vuelo', 'vuelos', 'hotel', 'hoteles'] },
  { label: 'Recibos', aliases: ['receipts', 'receipt', 'comprobante', 'comprobantes', 'recibo', 'recibos'] },
  { label: 'Reembolsos', aliases: ['refunds', 'refund', 'reembolso', 'reembolsos'] },
  { label: 'Roles', aliases: ['role', 'roles', 'rol'] },
  { label: 'Reglas', aliases: ['rule', 'rules', 'regla', 'reglas', 'authorizationrule', 'authorizationrules'] },
  { label: 'Departamentos', aliases: ['department', 'departments', 'departamento', 'departamentos', 'costcenter', 'cost centers', 'centro de costo'] },
  { label: 'Sociedades', aliases: ['society', 'societies', 'sociedad', 'sociedades'] },
];

function normalize(input: string): string {
  return Array.from(input.toLowerCase().normalize('NFD'))
    .filter((character) => !/[\u0300-\u036f]/.test(character))
    .join('')
    .trim();
}

function tokenize(permission: string): string[] {
  return normalize(permission).split(/[^a-z0-9]+/).filter(Boolean);
}

function detectModuleLabel(permission: string): string | null {
  const normalized = normalize(permission);
  const tokens = tokenize(permission);

  for (const definition of moduleDefinitions) {
    if (definition.aliases.some((alias) => normalized.includes(alias) || tokens.includes(alias))) {
      return definition.label;
    }
  }

  return null;
}

export function abbreviatePermissions(permissions: string[], separator: string = ', '): string {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return `${PERMISSIONS_PREFIX}Sin permisos`;
  }

  const modules = getPermissionModules(permissions);
  return modules.length > 0
    ? `${PERMISSIONS_PREFIX}${modules.join(separator)}`
    : `${PERMISSIONS_PREFIX}Sin permisos`;
}

export function getPermissionsPreview(permissions: string[], limit: number = 3): string {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return `${PERMISSIONS_PREFIX}Sin permisos`;
  }

  const compact = getPermissionModules(permissions);
  if (compact.length === 0) {
    return `${PERMISSIONS_PREFIX}Sin permisos`;
  }

  const shown = compact.slice(0, limit).join(', ');
  const more = compact.length > limit ? ` +${compact.length - limit}` : '';
  return `${PERMISSIONS_PREFIX}${shown}${more}`;
}

export function getPermissionModules(permissions: string[]): string[] {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return [];
  }

  const detected = new Set<string>();

  permissions.forEach((permission) => {
    const moduleLabel = detectModuleLabel(permission);
    if (moduleLabel) {
      detected.add(moduleLabel);
    }
  });

  return moduleDefinitions
    .map((definition) => definition.label)
    .filter((label) => detected.has(label));
}

export function abbreviatePermission(permission: string): string {
  if (!permission || typeof permission !== 'string') {
    return `${PERMISSIONS_PREFIX}Sin permisos`;
  }

  const moduleLabel = detectModuleLabel(permission);
  return moduleLabel
    ? `${PERMISSIONS_PREFIX}${moduleLabel}`
    : `${PERMISSIONS_PREFIX}Sin permisos`;
}
