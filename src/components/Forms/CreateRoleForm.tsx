/**
 * CreateRoleForm Component
 *
 * Form for creating a new system role and assigning permissions.
 */

import { useState, useEffect } from "react";
import Input from "@/components/Utils/Input";
import Checkbox from "@/components/Utils/Checkbox";
import Button from "@/components/Buttons/Button";
import Select from "@/components/Utils/Select";
import { apiRequest } from "@/utils/apiClient";
import Toast from "@/components/Utils/Toast";
import Accordion from "@/components/Utils/Accordion";
import { permissionLabelToKey, permissionsByCategory } from "@/config/permissionCatalog";

const roleTemplates = [
  {
    label: "Superadministrador",
    permissions: [
      "superadmin:manage_groups",
      "superadmin:manage_master_admins",
      "superadmin:view_group_audit_log",
    ],
  },
  {
    label: "Administrador",
    permissions: [
      "users:view",
      "users:create",
      "users:edit",
      "users:delete",
      "roles:manage",
      "system:import_data",
      "system:export_accounting",
      "system:audit_log",
      "auth_rules:manage",
      "refund_policies:manage",
      "accounts:view",
      "accounts:create",
      "accounts:edit",
      "accounts:delete",
    ],
  },
  {
    label: "Solicitante",
    permissions: [
      "travel:view",
      "travel:create",
      "travel:edit",
      "travel:delete",
      "receipts:view",
      "receipts:create",
      "receipts:edit",
    ],
  },
  {
    label: "Autorizador",
    permissions: [
      "travel:view",
      "travel:create",
      "travel:edit",
      "travel:delete",
      "travel:approve",
      "travel:reject",
      "receipts:view",
      "receipts:create",
      "receipts:edit",
    ],
  },
  {
    label: "Agencia de viajes",
    permissions: [
      "travel:view",
      "travel:edit",
      "travel:view_flights",
      "travel:view_hotels",
    ],
  },
  {
    label: "Cuentas por pagar",
    permissions: [
      "travel:view",
      "receipts:edit",
      "receipts:def_amount",
      "receipts:view",
      "receipts:edit",
      "receipts:approve",
      "refunds:create",
    ],
  },
];

// Icons for each permissions category (matching sidebar icons)
const categoryIcons: Record<string, string> = {
  "Usuarios": "person",
  "Sociedades": "domain",
  "Solicitudes de viaje": "airplane_ticket",
  "Autorizaciones": "check_box",
  "Cotizaciones": "price_change",
  "Agencia de viajes": "luggage",
  "Comprobantes": "receipt",
  "Roles": "admin_panel_settings",
  "Configuración": "gavel",
  "Reembolsos": "currency_exchange",
  "Sistema": "history",
  "Superadmin": "hub",
  "Cuentas Contables": "account_balance",
};

// Group categories into broader sections
const categoryGrouping: Record<string, string> = {
  "Usuarios": "Gestión",
  "Sociedades": "Gestión",
  "Roles": "Gestión",
  "Configuración": "Gestión",
  "Sistema": "Gestión",
  "Superadmin": "Gestión",
  "Cuentas Contables": "Gestión",
  "Solicitudes de viaje": "Viajes y Gastos",
  "Autorizaciones": "Viajes y Gastos",
  "Cotizaciones": "Viajes y Gastos",
  "Agencia de viajes": "Viajes y Gastos",
  "Comprobantes": "Viajes y Gastos",
  "Reembolsos": "Viajes y Gastos",
};

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
  const [template, setTemplate] = useState<string>("");

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

  // Handle template selection and update permissions accordingly
  async function handleTemplate(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedTemplate = roleTemplates.find(t => t.label === e.target.value);
    
    if (selectedTemplate) {
      // If a template is selected, update permissions to match the template
      setSelectedPermissions(new Set(selectedTemplate.permissions));
      setTemplate(e.target.value);
    } else {
      // If no template is selected, clear permissions
      setSelectedPermissions(new Set());
      setTemplate("");
    }
  }

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
        {/* Template selector */}
        <Select
          label="Plantilla"
          name="template"
          value={template}
          onChange={handleTemplate}
        >
          <option value="">Selecciona una plantilla</option>
          {roleTemplates.map((t) => (
            <option key={t.label} value={t.label}>{t.label}</option>
          ))}
        </Select>
        {/* Permissions accordions */}
        <div className="space-y-6 mt-4">
          {/* From the visible permissions, group them by category */}
          {Array.from(
            new Map(
              visiblePermissionsByCategory.map(item => [
                categoryGrouping[item.category],
                { category: categoryGrouping[item.category], items: visiblePermissionsByCategory.filter(p => categoryGrouping[p.category] === categoryGrouping[item.category]) }
              ])
            ).values()
          ).map(({ category, items }) => (
            <div key={category}>
              <h3 className="text-base font-semibold text-text-primary mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map(({ category: subCategory, permissions }) => (
                  <Accordion
                    key={subCategory}
                    title={subCategory}
                    icon={categoryIcons[subCategory]}
                    tag={`${permissions.length} ${permissions.length > 1 ? 'permisos' : 'permiso'}`}
                  >
                    <div className="border border-border rounded-md p-4 bg-card">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                  </Accordion>
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