/**
 * Import Preview
 * 
 * This component displays a preview of the employee data to be imported, 
 * allowing administrators to review the organizational structure before confirming the import. 
 * It also allows assigning roles to employees before importing.
 */

import { useState, useEffect } from "react";
import Button from "@/components/Buttons/Button";
import Reminder from "@/components/Utils/Reminder";
import DataTable from "@/components/Table/DataTable";
import Tag from "@/components/Utils/Tag";
import Select from "@/components/Utils/Select";
import { apiRequest } from "@/utils/apiClient";

// Interfaces for the component props and data structures used in the import process

interface EmpleadoRaw {
  NoEmpleado: string;
  Nombre: string;
  Usuario: string;
  Email: string;
  JefeInmediato: string | null;
  Proveedor: number;
  CeCo: number;
  Departamento: number;
  Status: string;
  Rol?: string;
}

interface DepartamentoRaw {
  Clave: number;
  Descripcion: string;
  CeCo: number;
}

interface CeCoRaw {
  Clave: number;
  Descripcion: string;
}

interface ParsedImportData {
  Empleados: EmpleadoRaw[];
  Departamentos: DepartamentoRaw[];
  CeCo: CeCoRaw[];
}

interface ImportResponse {
  success: boolean;
  message: string;
  summary?: {
    users: {
      created: string[];
      updated: string[];
      deactivated: string[];
      skipped: string[];
    };
    departments: {
      created: string[];
      updated: string[];
      skipped: string[];
    };
    costCenters: {
      created: string[];
      updated: string[];
      skipped: string[];
    };
  };
  error?: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface Props {
  data: ParsedImportData;
  endpoint: string;
  token: string;
  onClose: () => void;
  onImportSuccess: (result: ImportResponse) => void;
}

/**
 * Import Preview Component
 * Displays a preview of the data to employee data to be imported, 
 * allowing the admin to review and assign roles before confirming the import.
 * @param data - The parsed data containing employees, departments, and cost centers to be imported.
 * @param {string} endpoint - The API endpoint to which the import request will be sent.
 * @param {string} token - The authentication token for API requests.
 * @param {function} onClose - Callback function to close the preview modal.
 * @param {function} onImportSuccess - Callback function to handle successful import and display results.
 */
export default function ImportPreviewModal({
  data,
  endpoint,
  token,
  onClose,
  onImportSuccess,
}: Props) {
  // States for managing active tab, role assignments, loading state, and errors
  const [activeTab, setActiveTab] = useState<"empleados" | "departamentos" | "cecos">("empleados");
  const [roleAssignments, setRoleAssignments] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Fetch available roles from the API
  useEffect(() => {
    apiRequest("/admin/get-roles", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((rolesData) => {
        setRoles(rolesData);
        setRolesLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando roles:", error);
        setError("No se pudieron cargar los roles.");
        setRolesLoading(false);
      });
  }, [token]);

  // Initialize role assignments based on the imported 
  // data and available roles
  useEffect(() => {
    if (roles.length > 0) {
      const initial: Record<string, string> = {};
      data.Empleados.forEach((emp) => {
        if (emp.Rol) {
          // Find the role ID based on the role name in the imported data
          const roleId = roles.find((r) => r.role_name === emp.Rol)?.role_id;
          if (roleId) {
            initial[emp.NoEmpleado] = String(roleId);
          }
        }
      });
      setRoleAssignments(initial);
    }
  }, [roles, data.Empleados]);

  // Handler for confirming the import, which sends the 
  // modified data with role assignments to the API
  const handleImport = async () => {
    setLoading(true);
    setError(null);

    const modifiedData = {
      Empleados: data.Empleados.map((emp) => {
        // Get the current role value from the preview (either changed or original)
        const currentRoleId = roleAssignments[emp.NoEmpleado] ?? (emp.Rol ? String(roles.find((r) => r.role_name === emp.Rol)?.role_id ?? "") : "");
        return {
          NoEmpleado: emp.NoEmpleado,
          Nombre: emp.Nombre,
          Usuario: emp.Usuario,
          Email: emp.Email,
          JefeInmediato: emp.JefeInmediato,
          Proveedor: emp.Proveedor,
          CeCo: emp.CeCo,
          Departamento: emp.Departamento,
          Status: emp.Status,
          Rol: currentRoleId || undefined,
        };
      }),
      Departamentos: data.Departamentos.map(({ Clave, Descripcion, CeCo }) => ({
        Clave,
        Descripcion,
        CeCo,
      })),
      CeCo: data.CeCo.map(({ Clave, Descripcion }) => ({
        Clave,
        Descripcion,
      })),
    };

    // Create a blob from the modified data and send it as a file in a FormData object to the API
    const blob = new Blob([JSON.stringify(modifiedData)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "organigrama.json");

    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result: ImportResponse = await res.json();
      if (!result.success) throw new Error(result.error ?? result.message);
      onImportSuccess(result);
    } catch (err: any) {
      setError(err.message ?? "Error al importar");
    } finally {
      setLoading(false);
    }
  };

  // Handler for role changes in the select dropdown
  const handleRoleChange = (noEmpleado: string, roleId: string) => {
    setRoleAssignments((prev) => ({
      ...prev,
      [noEmpleado]: roleId,
    }));
  };

  // Filter out the superadmin role
  const selectableRoles = roles.filter((r) => r.role_name !== "Superadministrador");

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <h2 className="text-lg font-semibold">Vista previa de importación</h2>

      {/* Error Message */}
      {error && <Reminder type="warning" text={error} />}

      {/* Tabs for switching between employees, departments, and cost centers */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "empleados", label: `Empleados (${data.Empleados.length})` },
          { id: "departamentos", label: `Departamentos (${data.Departamentos.length})` },
          { id: "cecos", label: `Centros de Costo (${data.CeCo.length})` },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "filled" : "border"}
            color="secondary"
            size="small"
            onClick={() => setActiveTab(tab.id as any)}
            disabled={loading}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      
      {/* Data Table for the active tab */}
      <div className="flex-1 overflow-y-auto">
        {/* Employee table */}
        {activeTab === "empleados" && (
          <DataTable
            columns={[
              { key: "Usuario", label: "Usuario" },
              { key: "Correo", label: "Correo" },
              { key: "JefeInmediato", label: "Jefe Inmediato" },
              { key: "Departamento", label: "Departamento" },
              { key: "CentroCosto", label: "Centro de Costos" },
              { key: "Status", label: "Status" },
              { key: "rol", label: "Rol" },
            ]}
            rows={data.Empleados.map((emp: any) => ({
              Usuario: emp.Usuario,
              Correo: emp.Email,
              JefeInmediato: emp.JefeInmediato || "N/A",
              Departamento: emp.Departamento,
              CentroCosto: emp.CeCo,
              Status: (
                <Tag
                  text={emp.Status === 'A' ? "Activo" : "Inactivo"}
                  type={emp.Status === 'A' ? "success" : "warning"}
                  size="small"
                />
              ),
              rol: (
                <Select
                  label=""
                  value={roleAssignments[emp.NoEmpleado] ?? (emp.Rol ? String(roles.find((r) => r.role_name === emp.Rol)?.role_id ?? "") : "")}
                  name={`rol-${emp.NoEmpleado}`}
                  onChange={(e) => handleRoleChange(emp.NoEmpleado, e.target.value)}
                  disabled={rolesLoading || loading}
                >
                  <option value="">--- Asignar rol ---</option>
                  {selectableRoles.map((role) => (
                    <option key={role.role_id} value={String(role.role_id)}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              ),
            }))}
          />
        )}

        {/* Department table */}
        {activeTab === "departamentos" && (
          <DataTable
            columns={[
              { key: "Clave", label: "Clave" },
              { key: "Descripcion", label: "Descripción" },
              { key: "CeCo", label: "Centro de Costo" },
            ]}
            rows={data.Departamentos.map((dept) => ({
              Clave: dept.Clave,
              Descripcion: dept.Descripcion,
              CeCo: dept.CeCo,
            }))}
          />
        )}

        {/* Cost Center table */}
        {activeTab === "cecos" && (
          <DataTable
            columns={[
              { key: "Clave", label: "Clave" },
              { key: "Descripcion", label: "Descripción" },
            ]}
            rows={data.CeCo.map((ceco) => ({
              Clave: ceco.Clave,
              Descripcion: ceco.Descripcion,
            }))}
          />
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="filled"
          color="primary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="filled"
          color="secondary"
          onClick={handleImport}
          disabled={loading || rolesLoading}
        >
          {loading ? "Importando..." : "Importar Datos"}
        </Button>
      </div>
    </div>
  );
}
