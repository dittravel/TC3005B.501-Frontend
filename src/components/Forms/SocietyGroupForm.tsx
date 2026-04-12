/**
 * Society Group Form Component
 * Handles both create and edit modes for society groups
 */

import { useState } from 'react';
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Buttons/Button";
import Input from "@components/Utils/Input";
import Toast from "@components/Utils/Toast";

interface SocietyGroupFormProps {
  mode: "create" | "edit";
  data?: any;
  token: string;
  redirectTo: string;
}

export default function SocietyGroupForm({
  mode,
  data,
  token,
  redirectTo,
}: SocietyGroupFormProps) {
  const [formData, setFormData] = useState({
    description: data?.description || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "create"
        ? "/society-groups"
        : `/society-groups/${data.id}`;

      await apiRequest(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: `Grupo de sociedad ${mode === "create" ? "creado" : "actualizado"} exitosamente.`, type: 'success' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
