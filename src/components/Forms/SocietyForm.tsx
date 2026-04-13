/**
 * Society Form Component
 * Handles both create and edit modes for societies
 */

import { useState } from 'react';
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Buttons/Button";
import Input from "@components/Utils/Input";
import Select from "@components/Utils/Select";
import Toast from "@components/Utils/Toast";

interface SocietyGroup {
  id: number;
  description: string;
}

interface Currency {
  currency: string;
  name: string;
  country?: string;
  banxico_series_id?: string;
  frequency?: string;
}

interface SocietyFormProps {
  mode: "create" | "edit";
  data?: any;
  societyGroups: SocietyGroup[];
  currencies: Currency[];
  token: string;
  redirectTo: string;
}

export default function SocietyForm({
  mode,
  data,
  societyGroups,
  currencies,
  token,
  redirectTo,
}: SocietyFormProps) {
  const [formData, setFormData] = useState({
    description: data?.description || "",
    local_currency: data?.local_currency || "",
    society_group_id: data?.society_group_id ? parseInt(data.society_group_id) : "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "society_group_id" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "create"
        ? "/societies"
        : `/societies/${data.id}`;

      await apiRequest(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: `Sociedad ${mode === "create" ? "creada" : "actualizada"} exitosamente.`, type: 'success' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setToast({ message: "Ocurrió un error al guardar la sociedad.", type: 'error' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <Input
          label="Descripción"
          name="description"
          placeholder="Descripción de la sociedad"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <Select
          label="Moneda Local"
          name="local_currency"
          value={formData.local_currency}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una moneda</option>
          {currencies && currencies.length > 0 ? (
            currencies.map(currency => (
              <option key={currency.currency} value={currency.currency}>
                {currency.currency} - {currency.name}
              </option>
            ))
          ) : (
            <option disabled>No hay monedas disponibles</option>
          )}
        </Select>
        <Select
          label="Grupo de Sociedad"
          name="society_group_id"
          value={formData.society_group_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un grupo</option>
          {societyGroups.map(group => (
            <option key={group.id} value={group.id}>
              {group.description}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          name="Cancelar"
          color="secondary"
          href="/sociedades"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          name={mode === "create" ? "Crear Sociedad" : "Guardar Cambios"}
          color="primary"
          type="submit"
          disabled={loading}
        >
          {mode === "create" ? "Crear Sociedad" : "Guardar Cambios"}
        </Button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </form>
  );
}
