/**
 * Refund Policy Form Component
 * Handles create and edit modes for refund policies
 */

import { useState, useEffect } from 'react';
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Buttons/Button";
import Input from "@components/Utils/Input";
import Toast from "@components/Utils/Toast";

interface RefundPolicyFormProps {
  mode: "create" | "edit";
  data?: any;
  currency?: string;
  token: string;
  redirectTo?: string;
}

/**
 * Refund Policy Form Component
 * Renders a form for creating or editing refund policies. 
 * @param {string} mode - Determines if the form is in "create" or "edit" mode
 * @param {object} data - Existing policy data for edit mode
 * @param {string} currency - Currency code for displaying amounts (default: "MXN")
 * @param {string} token - Authentication token for API requests
 * @returns {JSX.Element} The refund policy form component
 */
export default function RefundPolicyForm({
  mode,
  data,
  currency = "MXN",
  token,
  redirectTo = "/politicas-reembolso",
}: RefundPolicyFormProps) {
  // Data to send to backend
  const [formData, setFormData] = useState({
    policy_name: data?.policy_name || "",
    min_amount: data?.min_amount || "",
    max_amount: data?.max_amount || "",
    submission_deadline_days: data?.submission_deadline_days || "",
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle input changes and update form data state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "policy_name" ? value : parseFloat(value) || "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.policy_name || !formData.min_amount || !formData.max_amount) {
      setError("Por favor completa todos los campos requeridos");
      setToast({ message: "Campos requeridos faltantes", type: 'error' });
      setLoading(false);
      return;
    }

    // Validate min and max amounts
    if (formData.min_amount >= formData.max_amount) {
      setError("El monto mínimo debe ser menor al máximo");
      setToast({ message: "El monto mínimo debe ser menor al máximo", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Determine API endpoint and method based on mode
      const endpoint = mode === "create"
        ? "/refund-policy"
        : `/refund-policy/${data?.policy_id}`;

      await apiRequest(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({
        message: `Política de reembolso ${mode === "create" ? "creada" : "actualizada"} exitosamente.`,
        type: 'success'
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la política");
      setToast({ message: "Ocurrió un error al guardar la política.", type: 'error' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <Input
          label="Nombre de la Política"
          name="policy_name"
          placeholder="Ej. Política de Viajes 2026"
          value={formData.policy_name}
          onChange={handleChange}
          required
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Monto Mínimo (MXN)"
              name="min_amount"
              type="number"
              placeholder="0"
              value={formData.min_amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Monto Máximo (MXN)"
              name="max_amount"
              type="number"
              placeholder="10000"
              value={formData.max_amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <Input
          label="Días límite para generar reembolso"
          altText="Pasados estos días desde la fecha del comprobante, no se podrán generar reembolsos"
          name="submission_deadline_days"
          type="number"
          placeholder="30"
          value={formData.submission_deadline_days}
          onChange={handleChange}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-2 mt-6">
        <div className="flex gap-2 ml-auto">
          <Button
            name="Cancelar"
            color="primary"
            href={redirectTo}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            name={mode === "create" ? "Crear Política" : "Guardar Cambios"}
            color="secondary"
            type="submit"
            disabled={loading}
          >
            {mode === "create" ? "Crear Política" : "Guardar Cambios"}
          </Button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </form>
  );
}
