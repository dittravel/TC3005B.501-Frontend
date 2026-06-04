/**
 * Account Form Component
 * Handles both create and edit modes for accounting accounts
 */

import { useState } from 'react';
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Buttons/Button";
import Input from "@components/Utils/Input";
import Select from "@components/Utils/Select";
import Toast from "@components/Utils/Toast";

interface CostCenter {
  cost_center_id: number;
  cost_center_name: string;
  cost_center_code?: number;
}

interface AccountFormProps {
  mode: "create" | "edit";
  data?: any;
  costCenters?: CostCenter[];
  token: string;
  redirectTo: string;
}

/**
 * Account Form Component
 * Displays a form for creating or editing an accounting account
 * @param {mode} mode - Determines if the form is in 'create' or 'edit' mode
 * @param {data} data - Existing account data for edit mode
 * @param {costCenters} costCenters - List of cost centers for selection
 * @param {token} token - Authentication token for API requests
 * @param {redirectTo} redirectTo - URL to redirect after successful submission
 * @returns {JSX.Element} The account form component
 */
export default function AccountForm({
  mode,
  data,
  costCenters = [],
  token,
  redirectTo,
}: AccountFormProps) {
  // formData to send to the backend
  const [formData, setFormData] = useState({
    account_code: data?.account_code || "",
    account_name: data?.account_name || "",
    account_type: data?.account_type || "Activo",
    description: data?.description || "",
    cost_center_id: data?.cost_center_id || "",
  });

  // States for loading and toast messages
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const isCreateMode = mode === 'create';

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      // Validations
      if (!formData.account_code?.trim()) {
        setToast({ message: 'El código de cuenta es obligatorio', type: 'error' });
        setLoading(false);
        return;
      }

      if (!formData.account_name?.trim()) {
        setToast({ message: 'El nombre de la cuenta es obligatorio', type: 'error' });
        setLoading(false);
        return;
      }

      if (!formData.cost_center_id) {
        setToast({ message: 'Debes seleccionar un centro de costos', type: 'error' });
        setLoading(false);
        return;
      }

      const endpoint = isCreateMode ? '/accounts' : `/accounts/${data?.account_id}`;
      const method = isCreateMode ? 'POST' : 'PUT';

      const response = await apiRequest(endpoint, {
        method,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success || response.account_id) {
        setToast({
          message: `Cuenta contable ${isCreateMode ? 'creada' : 'actualizada'} exitosamente`,
          type: 'success'
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
        globalThis.location.href = redirectTo;
      } else {
        setToast({
          message: `Error al ${isCreateMode ? 'crear' : 'actualizar'} la cuenta contable`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} account:`, error);
      setToast({
        message: `Error al ${isCreateMode ? 'crear' : 'actualizar'} la cuenta contable`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  let submitLabel = "Actualizar Cuenta";
  if (loading) {
    submitLabel = isCreateMode ? "Guardando..." : "Actualizando...";
  } else if (isCreateMode) {
    submitLabel = "Guardar Cuenta";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">Información Básica</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código de Cuenta"
            name="account_code"
            type="text"
            placeholder="1000"
            required
            value={formData.account_code}
            onChange={handleChange}
            disabled={!isCreateMode}
          />

          <Input
            label="Nombre de Cuenta"
            name="account_name"
            type="text"
            placeholder="Anticipo"
            required
            value={formData.account_name}
            onChange={handleChange}
          />

          <Select
            label="Tipo de Cuenta"
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
          >
            <option value="Activo">Activo</option>
            <option value="Pasivo">Pasivo</option>
            <option value="Capital">Capital</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </Select>

          <Select
            label="Centro de Costos"
            name="cost_center_id"
            value={formData.cost_center_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un centro de costos</option>
            {costCenters.map((cc) => (
              <option key={cc.cost_center_id} value={cc.cost_center_id}>
                {cc.cost_center_name}
              </option>
            ))}
          </Select>

          <Input
            label="Descripción (Opcional)"
            name="description"
            type="text"
            placeholder="Descripción de la cuenta"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="filled" color="primary" href={redirectTo}>
          Cancelar
        </Button>
        <Button type="submit" variant="filled" color="secondary" disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
