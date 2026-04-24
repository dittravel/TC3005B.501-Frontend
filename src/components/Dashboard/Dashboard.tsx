/**
 * Dashboard
 * 
 * This component is the main landing page for users after they log in.
 * It provides a personalized welcome message and quick access to key actions based on permissions
 */

import React from 'react';
import {
  NoteAdd,
  Receipt,
  CheckCircle,
  PriceChange,
  Luggage,
  FileUpload,
  CurrencyExchange,
  ArrowForwardIos,
  InsertDriveFile,
  History,
} from '@mui/icons-material';
import type { UserRole } from '@type/roles';

interface DashboardAction {
  label: string;
  route: string;
  icon: React.ReactNode;
  description: string;
}

const ICON_SIZE = 40;

// Define the available actions for each role
const DASHBOARD_ACTIONS: Record<UserRole, DashboardAction[]> = {
  'Solicitante': [
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: <NoteAdd sx={{ fontSize: ICON_SIZE }} />, description: 'Inicia una nueva solicitud de viaje' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: <Receipt sx={{ fontSize: ICON_SIZE }} />, description: 'Adjunta comprobantes de gastos' },
    { label: 'Reembolsos', route: '/reembolsos', icon: <CurrencyExchange sx={{ fontSize: ICON_SIZE }} />, description: 'Consulta el estado de tus reembolsos' },
  ],
  'Autorizador': [
    { label: 'Autorizaciones', route: '/autorizaciones', icon: <CheckCircle sx={{ fontSize: ICON_SIZE }} />, description: 'Revisa y autoriza solicitudes pendientes' },
    { label: 'Crear Solicitud', route: '/crear-solicitud', icon: <NoteAdd sx={{ fontSize: ICON_SIZE }} />, description: 'Inicia una nueva solicitud de viaje' },
    { label: 'Comprobar Gastos', route: '/comprobar-gastos', icon: <Receipt sx={{ fontSize: ICON_SIZE }} />, description: 'Adjunta comprobantes de gastos' },
    { label: 'Reembolsos', route: '/reembolsos', icon: <CurrencyExchange sx={{ fontSize: ICON_SIZE }} />, description: 'Consulta el estado de tus reembolsos' },
  ],
  'Administrador': [
    { label: 'Importar Datos', route: '/importar-datos', icon: <FileUpload sx={{ fontSize: ICON_SIZE }} />, description: 'Importa el organigrama desde un archivo' },
    { label: 'Exportar datos contables', route: '/exportar-datos-contables', icon: <InsertDriveFile sx={{ fontSize: ICON_SIZE }} />, description: 'Exporta datos contables para auditoría' },
    { label: 'Bitácora', route: '/bitacora', icon: <History sx={{ fontSize: ICON_SIZE }} />, description: 'Revisa la bitácora de actividades del sistema' },
  ],
  'Cuentas por pagar': [
    { label: 'Cotizaciones', route: '/cotizaciones', icon: <PriceChange sx={{ fontSize: ICON_SIZE }} />, description: 'Gestiona solicitudes por cotizar' },
    { label: 'Comprobantes', route: '/comprobaciones', icon: <Receipt sx={{ fontSize: ICON_SIZE }} />, description: 'Revisa comprobantes de gastos' },
  ],
  'Agencia de viajes': [
    { label: 'Atenciones', route: '/atenciones', icon: <Luggage sx={{ fontSize: ICON_SIZE }} />, description: 'Atiende solicitudes de viaje asignadas' },
  ],
};

interface DashboardProps {
  role: UserRole;
  userName: string;
}

/**
 * Dashboard Component
 * Displays a personalized welcome message and quick action buttons based on user role.
 * @param {UserRole} role - The role of the user to determine which actions to show
 * @param {string} userName - The name of the user for the welcome message
 * @returns {JSX.Element} A dashboard component with role-based actions
 */
export default function Dashboard({ role, userName }: DashboardProps) {
  const actions = DASHBOARD_ACTIONS[role] || [];

  const handleNavigate = (route: string) => {
    window.location.href = route;
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
                  {action.icon}
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
