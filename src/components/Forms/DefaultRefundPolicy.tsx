/**
 * Default Refund Policy Component
 * Displays and allows editing of the default refund policy
 */

import { useState, useEffect } from 'react';
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Buttons/Button";
import Input from "@components/Utils/Input";
import Toast from "@components/Utils/Toast";
import Card from "@components/Utils/Card";

interface Props {
  defaultPolicy?: any;
  token: string;
  currency?: string;
}

/**
 * Default Refund Policy Component
 * Displays the default refund policy and allows editing.
 * @param {object} defaultPolicy - The current default refund policy data
 * @param {string} token - Authentication token for API requests
 * @param {string} currency - Currency code for displaying amounts (default: "MXN")
 * @returns {JSX.Element} The default refund policy component
 */
export default function DefaultRefundPolicy({
  defaultPolicy,
  token,
  currency = "MXN",
}: Props) {
  // Data to send to backend
  const [formData, setFormData] = useState({
    policy_name: defaultPolicy?.policy_name || "Política por Defecto",
    min_amount: defaultPolicy?.min_amount || "",
    max_amount: defaultPolicy?.max_amount || "",
    submission_deadline_days: defaultPolicy?.submission_deadline_days || "",
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

    // Validate amount fields exist
    if (!formData.min_amount || !formData.max_amount) {
      setError("Por favor completa los montos");
      setToast({ message: "Campos requeridos faltantes", type: 'error' });
      setLoading(false);
      return;
    }
    
    // Validate min amount is less than max amount
    if (formData.min_amount >= formData.max_amount) {
      setError("El monto mínimo debe ser menor al máximo");
      setToast({ message: "El monto mínimo debe ser menor al máximo", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Update policy
      await apiRequest(`/refund-policy/${defaultPolicy?.policy_id}`, {
        method: "PUT",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: "Política por defecto actualizada.", type: 'success' });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setToast({ message: "Error al guardar la política", type: 'error' });
      setLoading(false);
    }
  };

  if (!defaultPolicy) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card className="space-y-4 border-l-4 border-l-primary">
        {/* Title */}
        <div className="card-title">
          <h3 className="text-lg font-semibold text-text-primary">Política por Defecto</h3>
          <p className="text-sm text-text-secondary">Se aplica a todos los comprobantes si no hay otra política</p>
        </div>

        { /* Main Form */ }
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label={`Monto Mínimo (${currency})`}
                name="min_amount"
                type="number"
                placeholder="0"
                min="0"
                value={formData.min_amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                label={`Monto Máximo (${currency})`}
                name="max_amount"
                type="number"
                placeholder="10000"
                min={formData.min_amount || "0"}
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

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="border"
              color="primary"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Recargar
            </Button>
            <Button
              variant="filled"
              color="secondary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Card>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
