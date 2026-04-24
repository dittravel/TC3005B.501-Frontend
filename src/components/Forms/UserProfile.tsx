/**
* User Profile Component
* 
* This component displays the user's profile information
*/

import Input from '@/components/Utils/Input';
import Select from '@/components/Utils/Select';
import Button from '@/components/Buttons/Button';
import Toast from '@/components/Utils/Toast';
import { useState, useEffect, type FormEvent } from 'react';
import { apiRequest } from '@/utils/apiClient';

interface Props {
  userData: any;
  departmentUsers?: any[];
  token: string;
  canManageAbsence?: boolean;
}

export default function UserProfile({ userData, departmentUsers = [], token, canManageAbsence = false }: Readonly<Props>) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [substituteId, setSubstituteId] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handler for submitting absence preferences
  const handleAbsenceSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      setToast({ message: 'Preferencias de ausencia guardadas correctamente', type: 'success' });
    } catch (error) {
      console.error('Error saving absence preferences:', error);
      setToast({ message: 'Error al guardar preferencias de ausencia', type: 'error' });
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
        <form onSubmit={handleAbsenceSubmit}>
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