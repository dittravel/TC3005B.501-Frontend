/**
 * CreateRoleForm Component
 *
 * Form for creating a new system role and assigning permissions.
 */

import { useState, useEffect } from "react";
import Input from "@/components/Utils/Input";
import Checkbox from "@/components/Utils/Checkbox";
import Button from "@/components/Buttons/Button";
import { apiRequest } from "@/utils/apiClient";
import Toast from "@/components/Utils/Toast";
import { permissionLabelToKey, permissionsByCategory } from "@/config/permissionCatalog";

interface Props {
  token: string;
  mode: 'create' | 'edit';
  data?: any;
}

export default function CreateRoleForm({ token, mode, data }: Readonly<Props>) {
  const [nombre, setNombre] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const visiblePermissionsByCategory = permissionsByCategory.map(({ category, permissions }) => ({
    category,
    permissions: permissions.filter((permission) => !permission.key.startsWith('superadmin:') && !permission.key.startsWith('society_groups:')),
  })).filter(({ permissions }) => permissions.length > 0);

  function togglePermission(permissionKey: string) {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      next.has(permissionKey) ? next.delete(permissionKey) : next.add(permissionKey);
      return next;
    });
  }

  useEffect(() => {
    if (mode === "edit" && data) {
      setNombre(data.name || "");
      if (Array.isArray(data.permission_keys) && data.permission_keys.length > 0) {
        setSelectedPermissions(new Set(data.permission_keys));
      } else if (Array.isArray(data.permissions)) {
        const mappedPermissions = data.permissions
          .map((permissionLabel: string) => permissionLabelToKey[permissionLabel] || permissionLabel)
          .filter(Boolean);
        setSelectedPermissions(new Set(mappedPermissions));
      }
    }
  }, [mode, data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nombre.trim()) {
      setToast({ message: 'El nombre del rol es obligatorio', type: 'error' });
      return;
    }

    if (selectedPermissions.size === 0) {
      setToast({ message: 'Selecciona al menos un permiso para el rol', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    const payload = {
      name: nombre,
      permissions: Array.from(selectedPermissions).filter((permission) => !String(permission).startsWith('superadmin:') && !String(permission).startsWith('society_groups:')),
    };

    try {
      const response = await apiRequest(
        mode === "create" ? "/admin/create-role" : `/admin/update-role/${data.role_id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          data: payload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.success) {
        setToast({ message: `Rol ${mode === "create" ? "creado" : "actualizado"} exitosamente`, type: 'success' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        globalThis.location.href = "/roles";
      } else {
        setToast({ message: `Error al ${mode === "create" ? "crear" : "actualizar"} el rol`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} role:`, error);
      setToast({ message: `Error al ${mode === "create" ? "crear" : "actualizar"} el rol`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  let submitLabel = "Actualizar rol";
  if (isSubmitting) {
    submitLabel = mode === "create" ? "Guardando..." : "Actualizando...";
  } else if (mode === "create") {
    submitLabel = "Guardar rol";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Role name */}
      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">Nombre del rol</h2>
        </div>
        <div className="md:w-1/2">
          <Input
            label="Nombre"
            name="nombre"
            type="text"
            placeholder="Solicitante"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">
            Selecciona los permisos a los que tendrá acceso este rol
          </h2>
        </div>
        <div className="space-y-6 mt-4">
          {visiblePermissionsByCategory.map(({ category, permissions }) => (
            <div key={category} className="card-secondary p-4 rounded-lg">
              <p className="text-sm font-semibold text-accent-primary mb-3">{category}</p>
              <div className="flex flex-col gap-1">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission.key}
                    label={permission.label}
                    name={permission.key}
                    value={permission.key}
                    checked={selectedPermissions.has(permission.key)}
                    onChange={() => togglePermission(permission.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="filled" color="primary" href="/roles">
          Cancelar
        </Button>
        <Button type="submit" variant="filled" color="secondary" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}