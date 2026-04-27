/**
* User Profile Component
* 
* This component displays the user's profile information
*/

import Input from '@/components/Utils/Input';
import Select from '@/components/Utils/Select';
import Button from '@/components/Buttons/Button';
import Toast from '@/components/Utils/Toast';
import { useState, useEffect, useMemo, type BaseSyntheticEvent } from 'react';
import { apiRequest } from '@/utils/apiClient';
import type { UserRole } from '@type/roles';
import { getAccessibleDashboardActions, MAX_DASHBOARD_QUICK_ACTIONS } from '@config/dashboardActions';
import { readDashboardPreferences, writeDashboardPreferences } from '@/utils/dashboardPreferences';

interface Props {
  userData: any;
  departmentUsers?: any[];
  token: string;
  canManageAbsence?: boolean;
  role: UserRole;
  permissionKeys?: string[];
}

export default function UserProfile({
  userData,
  departmentUsers = [],
  token,
  canManageAbsence = false,
  role,
  permissionKeys = [],
}: Readonly<Props>) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [substituteId, setSubstituteId] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuickActionRoutes, setSelectedQuickActionRoutes] = useState<string[]>([]);

  const availableQuickActions = useMemo(
    () => getAccessibleDashboardActions(role, permissionKeys),
    [role, permissionKeys]
  );

  // Get today's date in local timezone format (YYYY-MM-DD)
  const getLocalDateString = () => {
    const date = new Date();
    // Adjust for local timezone offset
    // getMonth + 1 because getMonth() returns 0-11
    // Pad month and day with leading zeros if needed
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Autocomplete absence preferences when user data changes
  useEffect(() => {
    if (canManageAbsence) {
      setStartDate(userData.out_of_office_start_date?.split('T')[0] || '');
      setEndDate(userData.out_of_office_end_date?.split('T')[0] || '');
      setSubstituteId(userData.substitute_id || '');
    }
  }, [canManageAbsence, userData.user_id, userData.out_of_office_start_date, userData.out_of_office_end_date, userData.substitute_id]);

  useEffect(() => {
    const allowedRoutes = new Set(availableQuickActions.map((action) => action.route));
    readDashboardPreferences(userData.user_id, token).then((saved) => {
      setSelectedQuickActionRoutes(saved.filter((route) => allowedRoutes.has(route)));
    });
  }, [availableQuickActions, token, userData.user_id]);

  const handleQuickActionToggle = (route: string) => {
    setSelectedQuickActionRoutes((previous) => {
      const current = new Set(previous);
      if (current.has(route)) {
        current.delete(route);
      } else {
        if (current.size >= MAX_DASHBOARD_QUICK_ACTIONS) {
          setToast({ message: `Puedes seleccionar hasta ${MAX_DASHBOARD_QUICK_ACTIONS} acciones rápidas`, type: 'error' });
          return previous;
        }
        current.add(route);
      }

      const next = Array.from(current);
      writeDashboardPreferences(userData.user_id, next, token);
      return next;
    });
  };

  // Handler for submitting user configuration
  const handleUserConfigSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    try {
      await apiRequest(`/user/update-out-of-office/${userData.user_id}`, {
        method: 'PUT',
        data: {
          out_of_office_start_date: startDate || null,
          out_of_office_end_date: endDate || null,
          substitute_id: substituteId || null,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setToast({ message: 'Configuración de usuario guardada correctamente', type: 'success' });
    } catch (error) {
      console.error('Error saving user configuration:', error);
      setToast({ message: 'Error al guardar configuración de usuario', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="card">
        <div className="card-title">
          <h2>Información Personal</h2>
        </div>

        {/* Personal information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-text-secondary text-xs">Nombre de Usuario</h3>
            <p>{userData.user_name}</p>
          </div>

          <div>
            <h3 className="text-text-secondary text-xs">Correo Electrónico</h3>
            <p>{userData.email}</p>
          </div>

          <div>
            <h3 className="text-text-secondary text-xs">Número Telefónico</h3>
            <p>{userData.phone_number}</p>
          </div>

          <div>
            <h3 className="text-text-secondary text-xs">Creación de Cuenta</h3>
            <p>{new Date(userData.creation_date).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h2>Acciones rápidas del dashboard</h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Selecciona las tarjetas que quieres ver en el dashboard (máximo {MAX_DASHBOARD_QUICK_ACTIONS}).
        </p>

        {availableQuickActions.length === 0 ? (
          <p className="text-sm text-text-secondary">No hay acciones disponibles para tu perfil actual.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableQuickActions.map((action) => {
              const checked = selectedQuickActionRoutes.includes(action.route);
              const atLimit = !checked && selectedQuickActionRoutes.length >= MAX_DASHBOARD_QUICK_ACTIONS;
              const checkboxId = `quick-action-${action.route.replaceAll('/', '-').replaceAll('*', 'wildcard')}`;

              return (
                <div
                  key={action.route}
                  className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${checked ? 'border-secondary bg-secondary/5' : 'border-border'} ${atLimit ? 'opacity-60' : ''}`}
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={checked}
                    disabled={atLimit}
                    onChange={() => handleQuickActionToggle(action.route)}
                    className="mt-1 h-4 w-4"
                  />
                  <label htmlFor={checkboxId} className="cursor-pointer">
                    <span className="block text-sm font-semibold text-text-primary">{action.label}</span>
                    <span className="block text-xs text-text-secondary">{action.description}</span>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Employee information */}
      <div className="card">
        <div className="card-title">
          <h2>Información de Empleado</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-text-secondary text-xs">Departamento</h3>
            <p>{userData.department_name}</p>
          </div>

          <div>
            <h3 className="text-text-secondary text-xs">Rol</h3>
            <p>{userData.role_name}</p>
          </div>

          <div>
            <h3 className="text-text-secondary text-xs">Estación de Trabajo</h3>
            <p>{userData.workstation}</p>
          </div>

          <div>
            <h3 className="text-text-secondary text-xs">Jefe Directo</h3>
            <p>{userData.boss_name}</p>
          </div>
        </div>
      </div>

      {/* Out of office preferences */}
      {canManageAbsence && (
        <form onSubmit={handleUserConfigSubmit}>
          <div className="card">
            <div className="card-title">
              <h2>Preferencias de Ausencia</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="out_of_office_start_date"
                label="Fecha de inicio de ausencia"
                type="date"
                min={getLocalDateString()}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <Input
                name="out_of_office_end_date"
                label="Fecha de fin de ausencia"
                type="date"
                min={startDate || getLocalDateString()}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
              <Select
                name="substitute_id"
                label="Usuario sustituto"
                value={substituteId}
                onChange={e => setSubstituteId(e.target.value)}
              >
                <option value="">Sin sustituto</option>
                {departmentUsers?.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" color="secondary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
          {toast && (
            <div className="fixed top-4 right-4 z-50">
              <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.type === 'success' ? 4000 : 6000}
              />
            </div>
          )}
        </form>
      )}
    </div>
  );
}