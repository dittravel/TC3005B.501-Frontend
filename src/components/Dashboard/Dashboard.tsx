/**
 * Dashboard
 * 
 * This component is the main landing page for users after they log in.
 * It provides a personalized welcome message and quick access to key actions based on permissions
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  NoteAdd,
  Receipt,
  CheckCircle,
  PriceChange,
  Luggage,
  CurrencyExchange,
  ArrowForwardIos,
  InsertDriveFile,
  History,
  Hub,
  ManageAccounts,
  Group,
  AdminPanelSettings,
  Gavel,
  ReceiptLong,
} from '@mui/icons-material';
import type { UserRole } from '@type/roles';
import {
  getAccessibleDashboardActions,
  MAX_DASHBOARD_QUICK_ACTIONS,
  type DashboardActionDefinition,
} from '@config/dashboardActions';
import { readDashboardPreferences } from '@/utils/dashboardPreferences';

const ICON_SIZE = 40;

const ICON_BY_KEY: Record<DashboardActionDefinition['iconKey'], React.ReactNode> = {
  autorizaciones: <CheckCircle sx={{ fontSize: ICON_SIZE }} />,
  usuarios: <Group sx={{ fontSize: ICON_SIZE }} />,
  roles: <AdminPanelSettings sx={{ fontSize: ICON_SIZE }} />,
  reglas: <Gavel sx={{ fontSize: ICON_SIZE }} />,
  politicas: <ReceiptLong sx={{ fontSize: ICON_SIZE }} />,
  exportar: <InsertDriveFile sx={{ fontSize: ICON_SIZE }} />,
  crear: <NoteAdd sx={{ fontSize: ICON_SIZE }} />,
  comprobar: <Receipt sx={{ fontSize: ICON_SIZE }} />,
  reembolsos: <CurrencyExchange sx={{ fontSize: ICON_SIZE }} />,
  cotizaciones: <PriceChange sx={{ fontSize: ICON_SIZE }} />,
  comprobantes: <Receipt sx={{ fontSize: ICON_SIZE }} />,
  atenciones: <Luggage sx={{ fontSize: ICON_SIZE }} />,
  sociedades: <InsertDriveFile sx={{ fontSize: ICON_SIZE }} />,
  grupos: <Hub sx={{ fontSize: ICON_SIZE }} />,
  maestros: <ManageAccounts sx={{ fontSize: ICON_SIZE }} />,
  bitacora: <History sx={{ fontSize: ICON_SIZE }} />,
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
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        Acciones rápidas
      </h2>
      {actions.length === 0 ? (
        <p className="text-text-secondary">agrega acciones preferidas en tu sección de usuario</p>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <button
            key={action.route}
            onClick={() => handleNavigate(action.route)}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all duration-300 hover:border-secondary hover:shadow-lg hover:shadow-secondary/20 cursor-pointer"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="text-secondary">
                  {ICON_BY_KEY[action.iconKey]}
                </div>
                <div className="text-text-secondary text-2xl group-hover:translate-x-1 transition-transform">
                  <ArrowForwardIos />
                </div>
              </div>

              <div className="flex flex-col align-start">
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
