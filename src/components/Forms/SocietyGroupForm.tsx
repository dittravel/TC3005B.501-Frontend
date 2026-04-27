/**
 * Society Group Form Component
 * Handles both create and edit modes for society groups
 */

import { useMemo, useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Buttons/Button";
import Input from "@components/Utils/Input";
import Select from "@components/Utils/Select";
import Toast from "@components/Utils/Toast";

interface SocietyGroupFormProps {
  mode: "create" | "edit";
  data?: any;
  token: string;
  redirectTo: string;
  currencies?: Array<{ currency: string; name: string }>;
}

export default function SocietyGroupForm({
  mode,
  data,
  token,
  redirectTo,
  currencies = [],
}: SocietyGroupFormProps) {
  const [formData, setFormData] = useState({
    description: data?.description || "",
    society: {
      description: "",
      local_currency: "",
    },
    regular_admin: {
      user_name: "",
      password: "",
      email: "",
      workstation: "",
      phone_number: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isCreateMode = mode === 'create';
  const availableCurrencies = useMemo(() => Array.isArray(currencies) ? currencies : [], [currencies]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      [name]: value,
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCreateMode) {
        if (!formData.society.description.trim() || !formData.society.local_currency.trim()) {
          setToast({ message: 'La sociedad inicial requiere descripción y moneda local', type: 'error' });
          setLoading(false);
          return;
        }

        if (!formData.regular_admin.user_name.trim() || !formData.regular_admin.password.trim() || !formData.regular_admin.email.trim()) {
          setToast({ message: 'El administrador inicial requiere usuario, contraseña y correo', type: 'error' });
          setLoading(false);
          return;
        }
      }

      const endpoint = mode === "create"
        ? "/society-groups"
        : `/society-groups/${data.id}`;

      const payload = mode === 'create'
        ? {
            description: formData.description,
            society: {
              description: formData.society.description,
              local_currency: formData.society.local_currency,
            },
            regular_admin: {
              user_name: formData.regular_admin.user_name,
              password: formData.regular_admin.password,
              email: formData.regular_admin.email,
              workstation: formData.regular_admin.workstation || null,
              phone_number: formData.regular_admin.phone_number || null,
            },
          }
        : { description: formData.description };

      await apiRequest(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: `Grupo de sociedad ${mode === "create" ? "creado" : "actualizado"} exitosamente.`, type: 'success' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      globalThis.location.href = redirectTo;
    } catch (err) {
      setToast({ message: "Ocurrió un error al guardar el grupo de sociedad.", type: 'error' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <Input
          label="Descripción"
          name="description"
          placeholder="Descripción del grupo de sociedad"
          value={formData.description}
          onChange={handleChange}
          required
        />

        {isCreateMode ? (
          <>
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text-primary">Sociedad inicial</h2>
              <p className="mb-4 text-sm text-text-secondary">Crea la primera sociedad del grupo para evitar que el grupo quede vacío.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Descripción de la sociedad"
                  name="society.description"
                  placeholder="Nombre de la sociedad"
                  value={formData.society.description}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Moneda local"
                  name="society.local_currency"
                  value={formData.society.local_currency}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una moneda</option>
                  {availableCurrencies.map((currency) => (
                    <option key={currency.currency} value={currency.currency}>
                      {currency.currency} - {currency.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text-primary">Administrador inicial</h2>
              <p className="mb-4 text-sm text-text-secondary">Este usuario se creará como administrador de la sociedad nueva dentro del mismo flujo.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Usuario"
                  name="regular_admin.user_name"
                  value={formData.regular_admin.user_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Contraseña"
                  name="regular_admin.password"
                  type="password"
                  value={formData.regular_admin.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Correo"
                  name="regular_admin.email"
                  type="email"
                  value={formData.regular_admin.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Estación"
                  name="regular_admin.workstation"
                  value={formData.regular_admin.workstation}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono"
                  name="regular_admin.phone_number"
                  value={formData.regular_admin.phone_number}
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
          href={redirectTo}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          name={mode === "create" ? "Crear Grupo" : "Guardar Cambios"}
          color="primary"
          type="submit"
          disabled={loading}
        >
          {mode === "create" ? "Crear Grupo" : "Guardar Cambios"}
        </Button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </form>
  );
}
