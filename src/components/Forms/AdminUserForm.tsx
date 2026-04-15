/**
 * React component for creating new users in the admin panel
 */

import React, { useState, useEffect } from 'react';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Utils/Input';
import Select from '@/components/Utils/Select';
import Reminder from '@components/Utils/Reminder';
import { apiRequest } from '@utils/apiClient';
import Toast from '@/components/Utils/Toast';

// Internal form data structure (not exported)
interface FormData {
  role_id: number | '';
  department_id: number | '';
  society_id: number | '';
  user_name: string;
  password: string;
  workstation: string;
  email: string;
  phone_number: string;
  boss_id?: number | '';
}

interface FormErrors {
  [key: string]: string;
}

interface CreateUserFormProps {
  mode: 'create' | 'edit';
  user_data?: any;
  redirectTo?: string;
  departments?: any[];
  roles?: any[];
  societies?: any[];
  token: string; 
}

const initialFormData: FormData = {
  role_id: '',
  department_id: '',
  society_id: '',
  user_name: '',
  password: '',
  workstation: '',
  email: '',
  phone_number: '',
  boss_id: ''
};

/**
 * CreateUserForm component allows administrators to create or edit users in the system.
 * @param {'create' | 'edit'} props.mode - Determines if the form is in create or edit mode.
 * @param {object} props.user_data - User data to pre-fill the form when in 'edit' mode.
 * @param {string} props.redirectTo - URL to redirect after successful form submission.
 * @param {string} props.token - Authorization token for API requests.
 */
export default function CreateUserForm({ mode, user_data, redirectTo, token, departments = [], roles = [], societies = [] }: CreateUserFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State for boss list based on selected department
  const [bossData, setBossData] = useState<any[]>([]);

  const fetchBosses = async (departmentId: number) => {
    try {
      const bosses = await apiRequest(`/admin/get-boss-list/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filer out the current user
      if (mode === 'edit' && user_data) {
        const filteredBosses = bosses.filter((boss: any) => boss.user_id !== user_data.user_id);
        setBossData(filteredBosses);
      } else {
        setBossData(bosses);
      }
    } catch (error) {
      console.error("Error fetching boss list:", error);
      setBossData([]);
    }
  };

  // Initialize form data based on mode and user data
  const [formData, setFormData] = useState<FormData>(() => {
    if (mode === 'edit' && user_data) {
      return {
        role_id: roles.find(r => r.role_name === user_data.role_name)?.role_id ?? '',
        department_id: departments.find(d => d.department_name === user_data.department_name)?.department_id ?? '',
        society_id: user_data.society_id ?? '',
        user_name: user_data.user_name,
        password: '',
        workstation: user_data.workstation,
        email: user_data.email,
        phone_number: user_data.phone_number || '',
        boss_id: user_data.boss_id ?? ''
      };
    }
    return initialFormData;
  });
  
  // Fetch boss list when department changes
  useEffect(() => {
    if (formData.department_id) {
      fetchBosses(formData.department_id);
    } else {
      setBossData([]);
    }
  }, [formData.department_id, token]);

  /**
   * Validates the form fields and sets error messages.
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'El nombre de usuario es requerido';
    } else if (formData.user_name.includes(' ')) {
      newErrors.user_name = 'El nombre de usuario no puede contener espacios';
    }

    if (mode === 'create') {
      if (!formData.password.trim()) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.includes(' ')) {
        newErrors.password = 'La contraseña no puede contener espacios';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email debe tener un formato válido';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'El departamento es requerido';
    }

    if (!formData.society_id) {
      newErrors.society_id = 'La sociedad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input changes and updates form state.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['role_id', 'department_id', 'society_id', 'boss_id'].includes(name)
        ? (value === '' ? '' : parseInt(value))
        : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handles form submission, sends API request, and manages response/errors.
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: 'Por favor corrige los errores en el formulario', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      // Prepare payload for API
      const payload = mode === 'edit'
        ? { ...formData, ...(formData.password ? {} : { password: undefined }) }
        : formData;

      const endpoint = mode === 'edit'
        ? `/admin/update-user/${user_data.user_id}`
        : '/admin/create-user';

      // API request
      const response = await apiRequest(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setToast({ message: `Usuario ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente`, type: 'success' });
      if (mode === 'create') {
        setFormData(initialFormData);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (redirectTo) {
        window.location.href = redirectTo;
      }

    } catch (error: any) {
      // Handle backend validation errors
      if (error.message.includes('errors')) {
        try {
          const errorData = JSON.parse(error.message.split(': ')[1]);
          if (errorData.errors) {
            const backendErrors: FormErrors = {};
            errorData.errors.forEach((err: any) => {
              backendErrors[err.param] = err.msg;
            });
            setErrors(backendErrors);
            setToast({ message: 'Por favor corrige los errores marcados', type: 'error' });
          }
        } catch {
          setToast({ message: 'Error al procesar la respuesta del servidor', type: 'error' });
        }
      } else {
        setToast({ message: 'Error al procesar la solicitud', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles form reset or cancel action.
   */
  const handleReset = () => {
    if (mode === 'edit') {
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } else {
      setFormData(initialFormData);
      setErrors({});
      setToast(null);
    }
  };

  /**
   * Returns input class string based on error state.
   * @param {string} fieldName - Field name
   * @returns {string} CSS class string
   */

  return (
    <div>
      <Reminder text="Los campos obligatorios están marcados con un asterisco." />
      <form onSubmit={handleSubmit}>
        <div className="card space-y-6">
          {/* Form Header */}
          <div className="card-header">
            <h2 className="card-title font-semibold text-text-primary">Datos del usuario</h2>
          </div>
          {/* Username and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              name="user_name"
              label="Nombre de Usuario"
              value={formData.user_name}
              onChange={handleInputChange}
              error={errors.user_name}
              placeholder="Ej: juan.perez"
              required
            />
            {mode === 'create' && (
              <Input
                type="password"
                name="password"
                label="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Contraseña segura"
                required
              />
            )}
          </div>

          {/* Email and Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="usuario@empresa.com"
              required
            />

            <Input
              type="tel"
              name="phone_number"
              label="Número de Teléfono"
              value={formData.phone_number}
              onChange={handleInputChange}
              error={errors.phone_number}
              placeholder="555-1234"
            />
          </div>

          {/* Workstation and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              name="workstation"
              label="Estación de Trabajo"
              value={formData.workstation}
              onChange={handleInputChange}
              error={errors.workstation}
              placeholder="Ej: WS-001"
            />
            <Select
              label="Rol"
              name="role_id"
              value={formData.role_id}
              onChange={handleInputChange}
              error={errors.role_id}
              required
            >
              <option value="">Seleccionar rol</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Department and Boss */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Departamento"
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              error={errors.department_id}
              required
            >
              <option value="">Seleccionar departamento</option>
              {departments.map(dep => (
                <option key={dep.department_id} value={dep.department_id}>
                  {dep.department_name}
                </option>
              ))}
            </Select>
            <Select
              label="Jefe"
              name="boss_id"
              value={formData.boss_id || ''}
              onChange={handleInputChange}
              error={errors.boss_id}
            >
              <option value="">Sin jefe</option>
              {bossData && bossData.map((boss: any) => (
                <option key={boss.user_id} value={boss.user_id}>
                  {boss.user_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Society */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Sociedad"
              name="society_id"
              value={String(formData.society_id)}
              onChange={handleInputChange}
              error={errors.society_id}
              required
            >
              <option value="">Seleccionar sociedad</option>
              {societies && societies.map((society: any) => (
                <option key={society.id} value={String(society.id)}>
                  {society.description}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            onClick={handleReset}
            variant="filled"
            color="primary"
            disabled={isSubmitting}
          >
            {mode === 'edit' ? 'Cancelar' : 'Limpiar Formulario'}
          </Button>

          <Button
            type="submit"
            variant="filled"
            color="secondary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (mode === 'edit' ? 'Actualizando...' : 'Creando Usuario...')
              : (mode === 'edit' ? 'Actualizar Usuario' : 'Crear Usuario')}
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
    </div>
  );
}