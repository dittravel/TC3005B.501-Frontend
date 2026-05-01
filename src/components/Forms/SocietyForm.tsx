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
    admin: {
      user_name: "",
      password: "",
      email: "",
      workstation: "",
      phone_number: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const isCreateMode = mode === 'create';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev as any)[section],
          [field]: value,
        },
      }));
      return;
    }

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
      if (isCreateMode) {
        if (!formData.description.trim() || !formData.local_currency.trim() || !formData.society_group_id) {
          setToast({ message: 'Descripción, moneda y grupo son requeridos', type: 'error' });
          setLoading(false);
          return;
        }

        if (!formData.admin.user_name.trim() || !formData.admin.password.trim() || !formData.admin.email.trim()) {
          setToast({ message: 'El administrador es requerido (usuario, contraseña y correo)', type: 'error' });
          setLoading(false);
          return;
        }
      }

      const endpoint = mode === "create"
        ? "/societies"
        : `/societies/${data.id}`;

      const payload = isCreateMode
        ? {
            description: formData.description,
            local_currency: formData.local_currency,
            society_group_id: formData.society_group_id,
            admin: formData.admin.user_name.trim() ? {
              user_name: formData.admin.user_name,
              password: formData.admin.password,
              email: formData.admin.email,
              workstation: formData.admin.workstation || null,
              phone_number: formData.admin.phone_number || null,
            } : null,
          }
        : {
            description: formData.description,
            local_currency: formData.local_currency,
            society_group_id: formData.society_group_id,
          };

      await apiRequest(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        data: payload,
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

        {isCreateMode ? (
          <>
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text-primary">Administrador</h2>
              <p className="mb-4 text-sm text-text-secondary">Crea un administrador de la sociedad en el mismo flujo.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Usuario"
                  name="admin.user_name"
                  value={formData.admin.user_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Contraseña"
                  name="admin.password"
                  type="password"
                  value={formData.admin.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Correo"
                  name="admin.email"
                  type="email"
                  value={formData.admin.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Estación"
                  name="admin.workstation"
                  value={formData.admin.workstation}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono"
                  name="admin.phone_number"
                  value={formData.admin.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        ) : null}
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
