/**
 * React component for creating new users in the admin panel
 */

import React, { useState, useEffect } from 'react';
import Button from '@components/Button';
import { apiRequest } from '@utils/apiClient';
import Toast from '@components/Toast';

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
  user_data?: any; // User data for editing, if applicable
  redirectTo?: string;
  token: string; // Authorization token for API requests
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

const labelClass = "block text-sm font-medium text-text-secondary mb-1";
const baseInputClass = "w-full border rounded-md px-3 py-2 text-text-primary placeholder:text-text-secondary border-border bg-card hover:bg-card-hover focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";
const selectClass = "w-full border rounded-md px-3 py-2 text-text-primary border-border bg-card hover:bg-card-hover focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer appearance-none";
const errorClass = "text-warning-500 text-sm mt-1";
const formClass = "bg-card rounded-lg shadow-md p-8 border border-border";
const infoClass = "flex items-center bg-secondary/30 border-l-4 border-secondary p-4 mb-8 rounded shadow-sm";
const buttonContainerClass = "flex flex-col sm:flex-row justify-end gap-3 pt-4";
const toastClass = "fixed top-4 right-4 z-50";

/**
 * CreateUserForm component allows administrators to create or edit users in the system.
 * @param {'create' | 'edit'} props.mode - Determines if the form is in create or edit mode.
 * @param {object} props.user_data - User data to pre-fill the form when in 'edit' mode.
 * @param {string} props.redirectTo - URL to redirect after successful form submission.
 * @param {string} props.token - Authorization token for API requests.
 */
export default function CreateUserForm({ mode, user_data, redirectTo, token }: CreateUserFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (mode === 'edit' && user_data) {
      setFormData({
        role_id: roles.find(role => role.name === user_data.role_name)?.id ?? '',
        department_id: departments.find(dep => dep.name === user_data.department_name)?.id ?? '',
        user_name: user_data.user_name,
        password: '', // Password should not be pre-filled
        workstation: user_data.workstation,
        email: user_data.email,
        phone_number: user_data.phone_number || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [mode, user_data]);

  

  /**
   * Validates all form fields and sets error messages if validation fails.
   * @returns {boolean} True if all validations pass, false otherwise
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
   * Handles input field changes and clears associated field errors.
   * @param {React.ChangeEvent} e - The change event from input or select element
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' || name === 'department_id' ? 
        (value === '' ? '' : parseInt(value)) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handles form submission for user creation or update.
   * @param {React.FormEvent} e - The form submission event
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
      const payload = mode === 'edit'
        ? { ...formData, ...(formData.password ? {} : { password: undefined }) }
        : formData;

      const endpoint = mode === 'edit'
        ? `/admin/update-user/${user_data.user_id}`
        : '/admin/create-user';

      console.log('Submitting form data:', payload);
      const response = await apiRequest(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(`${mode === 'edit' ? 'Edit' : 'Create'} response:`, response);
      setToast({ message: `Usuario ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente`, type: 'success' });
      if (mode === 'create') {
        setFormData(initialFormData);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (redirectTo) {
        window.location.href = redirectTo;
      }
      
    } catch (error: any) {
      console.error(`${mode === 'edit' ? 'Update' : 'Create'} error:`, error);
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

  const inputClass = (fieldName: string) =>
    `${baseInputClass} ${errors[fieldName] ? 'border-warning-500' : ''}`;

  return (
    <div className={formClass}>
      <div className={infoClass}>
        <svg className="w-6 h-6 text-secondary mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
        </svg>
        <p className="text-sm text-text-primary font-medium">
          Los campos obligatorios están marcados con un asterisco.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username and Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              Nombre de Usuario <span className="text-warning-500">*</span>
            </label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              className={inputClass('user_name')}
              placeholder="Ej: juan.perez"
            />
            {errors.user_name && (
              <p className={errorClass}>{errors.user_name}</p>
            )}
          </div>
          { mode === 'create' && (
          <div>
            <label className={labelClass}>
              Contraseña <span className="text-warning-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={inputClass('password')}
              placeholder="Contraseña segura"
            />
            {errors.password && (
              <p className={errorClass}>{errors.password}</p>
            )}
          </div>
          )}
        </div>

        {/* Email and Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              Email <span className="text-warning-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass('email')}
              placeholder="usuario@empresa.com"
            />
            {errors.email && (
              <p className={errorClass}>{errors.email}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Número de Teléfono <span className="text-text-secondary">(opcional)</span>
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={inputClass('phone_number')}
              placeholder="555-1234"
            />
            {errors.phone_number && (
              <p className={errorClass}>{errors.phone_number}</p>
            )}
          </div>
        </div>

        {/* Workstation */}
        <div>
          <label className={labelClass}>
            Estación de Trabajo <span className="text-warning-500">*</span>
          </label>
          <input
            type="text"
            name="workstation"
            value={formData.workstation}
            onChange={handleInputChange}
            className={inputClass('workstation')}
            placeholder="Ej: WS-001"
          />
          {errors.workstation && (
            <p className={errorClass}>{errors.workstation}</p>
          )}
        </div>

        {/* Role and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              Rol <span className="text-warning-500">*</span>
            </label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleInputChange}
              className={`${selectClass} ${errors.role_id ? 'border-warning-500' : ''}`}
            >
              <option value="">Seleccionar rol</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className={errorClass}>{errors.role_id}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Departamento <span className="text-warning-500">*</span>
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              className={`${selectClass} ${errors.department_id ? 'border-warning-500' : ''}`}
            >
              <option value="">Seleccionar departamento</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className={errorClass}>{errors.department_id}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className={buttonContainerClass}>
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
        <div className={toastClass}>
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