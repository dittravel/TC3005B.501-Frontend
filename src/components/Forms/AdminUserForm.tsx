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
  user_name: string;
  password: string;
  workstation: string;
  email: string;
  phone_number: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CreateUserFormProps {
  mode: 'create' | 'edit';
  user_data?: any; 
  redirectTo?: string;
  token: string; 
}

const roles = [
  { id: 1, name: 'Solicitante' },
  { id: 2, name: 'Agencia de viajes' },
  { id: 3, name: 'Cuentas por pagar' },
  { id: 4, name: 'N1' },
  { id: 5, name: 'N2' },
  { id: 6, name: 'Administrador' }
];

const departments = [
  { id: 1, name: 'Finanzas' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'IT' },
  { id: 4, name: 'Marketing' },
  { id: 5, name: 'Operaciones' },
  { id: 6, name: 'Administración' }
];

const initialFormData: FormData = {
  role_id: '',
  department_id: '',
  user_name: '',
  password: '',
  workstation: '',
  email: '',
  phone_number: ''
};

/**
 * CreateUserForm component allows administrators to create or edit users in the system.
 * @param {'create' | 'edit'} props.mode - Determines if the form is in create or edit mode.
 * @param {object} props.user_data - User data to pre-fill the form when in 'edit' mode.
 * @param {string} props.redirectTo - URL to redirect after successful form submission.
 * @param {string} props.token - Authorization token for API requests.
 */
export default function CreateUserForm({ mode, user_data, redirectTo, token }: CreateUserFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize form data based on mode and user data
  const [formData, setFormData] = useState<FormData>(() => {
    if (mode === 'edit' && user_data) {
      return {
        role_id: roles.find(r => r.name === user_data.role_name)?.id ?? '',
        department_id: departments.find(d => d.name === user_data.department_name)?.id ?? '',
        user_name: user_data.user_name,
        password: '',
        workstation: user_data.workstation,
        email: user_data.email,
        phone_number: user_data.phone_number || ''
      };
    }
    return initialFormData;
  });

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

    if (!formData.workstation.trim()) {
      newErrors.workstation = 'La estación de trabajo es requerida';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'El departamento es requerido';
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
      [name]: name === 'role_id' || name === 'department_id' ?
        (value === '' ? '' : parseInt(value)) : value
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
    <div className="card">
      <Reminder text="Los campos obligatorios están marcados con un asterisco." />
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Workstation */}
        <Input
          type="text"
          name="workstation"
          label="Estación de Trabajo"
          value={formData.workstation}
          onChange={handleInputChange}
          error={errors.workstation}
          placeholder="Ej: WS-001"
          required
        />

        {/* Role and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>

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
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            onClick={handleReset}
            variant="border"
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
      </form>

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.type === 'success' ? 4000 : 6000}
          />
        </div>
      )}
    </div>
  );
}