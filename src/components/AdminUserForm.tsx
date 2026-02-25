import React, { useState, useEffect } from 'react';
import Button from '@components/Button';
import { apiRequest } from '@utils/apiClient';
import Toast from '@components/Toast';

// Internal form data structure (not exported)
interface FormData {
  roleId: number | '';
  departmentId: number | '';
  userName: string;
  password: string;
  workstation: string;
  email: string;
  phoneNumber: string;
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
  roleId: '',
  departmentId: '',
  userName: '',
  password: '',
  workstation: '',
  email: '',
  phoneNumber: ''
};

export default function CreateUserForm({ mode, user_data, redirectTo,token }: CreateUserFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Pre-fill form for edit mode, otherwise reset
    if (mode === 'edit' && user_data) {
      setFormData({
        roleId: roles.find(role => role.name === user_data.role_name)?.id,
        departmentId: departments.find(dep => dep.name === user_data.department_name)?.id,
        userName: user_data.user_name,
        password: '', // Password should not be pre-filled
        workstation: user_data.workstation,
        email: user_data.email,
        phoneNumber: user_data.phone_number || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [mode, user_data]);

  

  /**
   * Validates the form fields and sets error messages.
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'El nombre de usuario es requerido';
    } else if (formData.userName.includes(' ')) {
      newErrors.userName = 'El nombre de usuario no puede contener espacios';
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

    if (!formData.roleId) {
      newErrors.roleId = 'El rol es requerido';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'El departamento es requerido';
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
      [name]: name === 'roleId' || name === 'departmentId' ?
        (value === '' ? '' : parseInt(value)) : value
    }));

    // Clear error when user starts typing
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
        ? `/admin/update-user/${user_data.userId}`
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
  const inputClass = (fieldName: string) =>
    `w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 mb-8 rounded shadow-sm">
        <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
        </svg>
        <p className="text-sm text-blue-900 font-medium">
          Los campos obligatorios están marcados con un asterisco.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Usuario y Contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Usuario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className={inputClass('userName')}
              placeholder="Ej: juan.perez"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
            )}
          </div>
          { mode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
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
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          )}
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
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
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Teléfono <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={inputClass('phoneNumber')}
              placeholder="555-1234"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Estación de Trabajo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estación de Trabajo <span className="text-red-500">*</span>
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
            <p className="text-red-500 text-sm mt-1">{errors.workstation}</p>
          )}
        </div>

        {/* Rol y Departamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleInputChange}
              className={inputClass('roleId')}
            >
              <option value="">Seleccionar rol</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className={inputClass('departmentId')}
            >
              <option value="">Seleccionar departamento</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            onClick={handleReset}
            variant="border"
            color="secondary"
            disabled={isSubmitting}
          >
            {mode === 'edit' ? 'Cancelar' : 'Limpiar Formulario'}
          </Button>

          <Button
            type="submit"
            variant="filled"
            color="primary"
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