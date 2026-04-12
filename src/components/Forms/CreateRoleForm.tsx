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

interface Props {
  token: string;
  mode: 'create' | 'edit';
  data?: any;
}

const permissionsByCategory = [
  {
    category: "Usuarios",
    permissions: ["Ver usuarios", "Crear usuarios", "Editar usuarios", "Eliminar usuarios"],
  },
  {
    category: "Solicitudes de viaje",
    permissions: [
      "Ver solicitudes", "Crear solicitudes", "Editar solicitudes", "Eliminar solicitudes",
      "Aprobar/Rechazar solicitudes", "Definir monto a autorizar",
      "Ver opciones de vuelos", "Ver opciones de hoteles",
      "Finalizar viaje", "Cancelar viaje", "Rechazar viaje",
    ],
  },
  {
    category: "Comprobantes",
    permissions: [
      "Ver comprobantes", "Crear comprobantes", "Editar comprobantes",
      "Eliminar comprobantes", "Aprobar/Rechazar comprobantes",
    ],
  },
  {
    category: "Reembolsos",
    permissions: [
      "Solicitar reembolsos", "Asignar presupuesto impuesto", "Aprobar/Rechazar reembolso",
    ],
  },
];

export default function CreateRoleForm({ token, mode, data }: Props) {
  const [nombre, setNombre] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  function togglePermission(permission: string) {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      next.has(permission) ? next.delete(permission) : next.add(permission);
      return next;
    });
  }

  useEffect(() => {
    if (mode === "edit" && data) {
      setNombre(data.name || "");
      setSelectedPermissions(new Set(data.permissions || []));
    }
  }, [mode, data]);

  async function handleSubmit() {
    const payload = {
      name: nombre,
      permissions: Array.from(selectedPermissions),
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
        alert(`Rol ${mode === "create" ? "creado" : "actualizado"} exitosamente`);
        window.location.href = "/roles";
      } else {
        alert(`Error al ${mode === "create" ? "crear" : "actualizar"} el rol`);
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} role:`, error);
      alert(`Error al ${mode === "create" ? "crear" : "actualizar"} el rol`);
    }
    console.log("Crear rol:", payload);
  }

  return (
    <div className="space-y-6 mt-6">
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
          {permissionsByCategory.map(({ category, permissions }) => (
            <div key={category} className="card-secondary p-4 rounded-lg">
              <p className="text-sm font-semibold text-accent-primary mb-3">{category}</p>
              <div className="flex flex-col gap-1">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission}
                    label={permission}
                    name={permission}
                    value={permission}
                    checked={selectedPermissions.has(permission)}
                    onChange={() => togglePermission(permission)}
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
        <Button variant="filled" color="secondary" onClick={handleSubmit}>
          {mode === "create" ? "Guardar rol" : "Actualizar rol"}
        </Button>
      </div>
    </div>
  );
}