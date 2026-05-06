/**
 * Dashboard
 * 
 * This component is the main landing page for users after they log in.
 * It provides a personalized welcome message and quick access to key actions based on permissions
 */

import React, { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Utils/Icon';
import type { UserRole } from '@type/roles';
import {
  getAccessibleDashboardActions,
  MAX_DASHBOARD_QUICK_ACTIONS,
  type DashboardActionDefinition,
} from '@config/dashboardActions';
import Button from '@components/Buttons/Button';
import { readDashboardPreferences } from '@/utils/dashboardPreferences';

const ICON_SIZE = { fontSize: '2rem' };

// Icons match SIDEBAR_CONFIG for consistency
const ICON_BY_KEY: Record<DashboardActionDefinition['iconKey'], React.ReactNode> = {
  autorizaciones: <Icon name="check_box" style={ICON_SIZE} />,
  usuarios: <Icon name="person" style={ICON_SIZE} />,
  roles: <Icon name="admin_panel_settings" style={ICON_SIZE} />,
  reglas: <Icon name="gavel" style={ICON_SIZE} />,
  politicas: <Icon name="receipt_long" style={ICON_SIZE} />,
  importar: <Icon name="file_upload" style={ICON_SIZE} />,
  exportar: <Icon name="draft" style={ICON_SIZE} />,
  crear: <Icon name="note_add" style={ICON_SIZE} />,
  comprobar: <Icon name="receipt" style={ICON_SIZE} />,
  reembolsos: <Icon name="currency_exchange" style={ICON_SIZE} />,
  cotizaciones: <Icon name="price_change" style={ICON_SIZE} />,
  comprobantes: <Icon name="receipt" style={ICON_SIZE} />,
  atenciones: <Icon name="luggage" style={ICON_SIZE} />,
  sociedades: <Icon name="domain" style={ICON_SIZE} />,
  grupos: <Icon name="hub" style={ICON_SIZE} />,
  maestros: <Icon name="admin_panel_settings" style={ICON_SIZE} />,
  bitacora: <Icon name="history" style={ICON_SIZE} />,
};

interface DashboardProps {
  userId: string;
  role: UserRole;
  userName: string;
  token?: string;
  permissionKeys?: string[];
}

/**
 * Dashboard Component
 * Displays a personalized welcome message and quick action buttons based on user role.
 * @param {UserRole} role - The role of the user to determine which actions to show
 * @param {string} userName - The name of the user for the welcome message
 * @returns {JSX.Element} A dashboard component with role-based actions
 */
export default function Dashboard({ userId, role, userName, token = '', permissionKeys = [] }: Readonly<DashboardProps>) {
  const [preferredRoutes, setPreferredRoutes] = useState<string[]>([]);

  const accessibleActions = useMemo(
    () => getAccessibleDashboardActions(role, permissionKeys),
    [role, permissionKeys]
  );

  useEffect(() => {
    readDashboardPreferences(userId, token).then(setPreferredRoutes);
  }, [token, userId]);

  const actions = useMemo(() => {
    if (!preferredRoutes.length) return [];

    const visibleByRoute = new Map(accessibleActions.map((action) => [action.route, action]));
    const selected = preferredRoutes
      .map((route) => visibleByRoute.get(route))
      .filter((action): action is DashboardActionDefinition => Boolean(action));

    return selected.slice(0, MAX_DASHBOARD_QUICK_ACTIONS);
  }, [accessibleActions, preferredRoutes]);

  const handleNavigate = (route: string) => {
    globalThis.location.href = route;
  };

  return (
    <div className="space-y-12">

      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Bienvenido(a), {userName}
        </h1>

        <p className="text-lg text-text-secondary">
          ¿Qué deseas hacer hoy?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Acciones rápidas
        </h2>
        <Button
          variant="link"
          color="secondary"
          onClick={() => handleNavigate('/perfil-usuario')}
        >
          Personalizar
        </Button>
      </div>
      {actions.length === 0 ? (
        <p className="text-text-secondary">Agrega acciones preferidas en tu perfil de usuario</p>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <button
            key={action.route}
            onClick={() => handleNavigate(action.route)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigate(action.route);
              }
            }}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all duration-300 hover:border-secondary hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <div className="flex h-full flex-col justify-between">

              {/* Icon + arrow */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-secondary">
                  {ICON_BY_KEY[action.iconKey]}
                </div>

                <div className="text-text-secondary transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">
                  <Icon name="arrow_forward_ios" className="text-2xl" />
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {action.label}
                </h3>
                <p className="text-sm text-text-secondary">
                  {action.description}
                </p>
              </div>

            </div>
          </button>
        ))}
      </div>
    </div>
  );
}