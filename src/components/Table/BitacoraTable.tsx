/**
 * Audit Log Table Component
 *
 * Displays the audit log table with client-side filters by action type
 * and actor name, plus pagination.
 */

import { useState, useMemo, useEffect } from "react";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import Select from "@/components/Utils/Select";
import Input from "@/components/Utils/Input";
import { apiRequest } from "@/utils/apiClient";
import Button from "../Buttons/Button";

interface AuditEntry {
  audit_log_id: number;
  actor_user_id: number;
  actor_user_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  source_ip: string;
  metadata: Record<string, any> | null;
  event_timestamp: string;
}

interface Meta {
  count: number;
  total_count: number;
  has_more: boolean;
  filters: Record<string, any>;
}

interface Props {
  initialData: AuditEntry[];
  initialMeta: Meta;
  role: string;
  initialSocietyGroupId?: string;
  societyGroups?: Array<{ id: number; description: string }>;
  token: string;
}

// Constants

// Mapping of action types to user-friendly labels
const ACTION_TYPE_LABELS: Record<string, string> = {
  USER_CREATED: "Usuario creado",
  USER_UPDATED: "Usuario editado",
  USER_DEACTIVATED: "Usuario desactivado",
  REQUEST_AUTHORIZED: "Solicitud autorizada",
  REQUEST_DECLINED: "Solicitud rechazada",
  REQUEST_QUOTED: "Solicitud cotizada",
  REQUEST_RECEIPTS_VALIDATED: "Comprobantes validados",
  RECEIPT_APPROVED: "Comprobante aprobado",
  RECEIPT_REJECTED: "Comprobante rechazado",
  POLICY_CREATED: "Política creada",
  POLICY_UPDATED: "Política editada",
  POLICY_DEACTIVATED: "Política desactivada",
  RECEIPTS_RETURNED: "Comprobantes devueltos",
  RECEIPT_AMOUNT_EDITED: "Monto del comprobante editado",
  RECEIPT_NOTES_EDITED: "Notas del comprobante editadas",
  ROLE_CREATED: "Rol creado",
  ROLE_UPDATED: "Rol editado",
  ROLE_DELETED: "Rol eliminado",
  ROLE_DEFAULT_UPDATED: "Rol por defecto actualizado",
  MASTER_ADMIN_CREATED: "Superadministrador creado",
  SOCIETY_CREATED: "Sociedad creada",
  SOCIETY_UPDATED: "Sociedad editada",
  SOCIETY_DELETED: "Sociedad eliminada",
  SOCIETY_GROUP_CREATED: "Grupo de sociedad creado",
  SOCIETY_GROUP_UPDATED: "Grupo de sociedad editado",
  SOCIETY_GROUP_DELETED: "Grupo de sociedad eliminado",
  SOCIETY_TRANSFERRED_TO_GROUP: "Sociedad transferida a grupo",
  ACCOUNT_CREATED: "Cuenta creada",
  ACCOUNT_UPDATED: "Cuenta editada",
  ACCOUNT_DELETED: "Cuenta eliminada",
};

// Mapping of entities
const ENTITY_TYPES: Record<string, string> = {
  User: "Usuarios",
  Request: "Solicitudes",
  Receipt: "Comprobantes",
  Role: "Roles",
  Policy: "Políticas",
  Society: "Sociedades",
  SocietyGroup: "Grupos de Sociedades",
  Account: "Cuentas Contables",
};

// Columns to display in the table
const COLUMNS = [
  { key: "event_timestamp", label: "Fecha" },
  { key: "actor_user_name", label: "Usuario" },
  { key: "action_type", label: "Acción" },
  { key: "entity_type", label: "Entidad" },
  { key: "entity_id", label: "ID entidad" },
  { key: "source_ip", label: "IP origen" },
  { key: "metadata_detail", label: "Detalles" },
];

// Limit of entries per page
const LIMIT = 20;

// Helpers
function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
}

function formatMetadata(metadata: Record<string, any> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  return Object.entries(metadata)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

/**
 * Audit Log Table Component
 * Displays the audit log with filters and pagination.
 * @param {AuditEntry[]} initialData - Initial entries to display in the table
 * @param {Meta} initialMeta - Initial metadata for pagination
 * @param {string} role - User role for access control
 * @returns {JSX.Element} The audit log table component
 */
export default function BitacoraTable({
  initialData,
  initialMeta,
  initialSocietyGroupId = '',
  societyGroups = [],
  token
}: Readonly<Props>) {
  const [data, setData] = useState<AuditEntry[]>(initialData);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [selectedSocietyGroupId, setSelectedSocietyGroupId] = useState(initialSocietyGroupId);

  const totalPages = Math.ceil(meta.total_count / LIMIT);

  // Fetch a specific page of audit log entries
  async function fetchPage(newPage: number) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String((newPage - 1) * LIMIT),
        include_metadata: "true",
      });
      if (selectedSocietyGroupId && selectedSocietyGroupId !== "") {
        params.set('society_group_id', selectedSocietyGroupId);
      }
      const json = await apiRequest(`/audit-log/get-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(json.data ?? []);
      setMeta(json.meta);
      setPage(newPage);
    } catch {
      setError("No se pudo cargar el registro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Filters
  // useMemo to avoid recalculating filtered rows on every render
  const rows = useMemo(
    () =>
      data
        .filter((e) => (filterEntity ? e.entity_type === filterEntity : true))
        .filter((e) =>
          filterName
            ? e.actor_user_name.toLowerCase().includes(filterName.toLowerCase())
            : true
        )
        .filter((e) => {
          // Only compare date part of the timestamp (YYYY-MM-DD)
          const eventDateStr = e.event_timestamp.split('T')[0];
          if (filterStartDate && filterEndDate) {
            // If both dates provided, check event timestamp is within the range
            return eventDateStr >= filterStartDate && eventDateStr <= filterEndDate;
          }
          if (filterStartDate) {
            // Only start date provided
            return eventDateStr >= filterStartDate;
          }
          if (filterEndDate) {
            // Only end date provided
            return eventDateStr <= filterEndDate;
          }
          return true;
        })
        .map((e) => ({
          event_timestamp: formatDate(e.event_timestamp),
          actor_user_name: e.actor_user_name,
          action_type: ACTION_TYPE_LABELS[e.action_type] ?? e.action_type,
          entity_type: e.entity_type,
          entity_id: e.entity_id,
          source_ip: e.source_ip,
          metadata_detail: formatMetadata(e.metadata),
        })),
    [data, filterEntity, filterName, filterStartDate, filterEndDate, selectedSocietyGroupId]
  );

  function handleSocietyGroupChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    setSelectedSocietyGroupId(value);
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedSocietyGroupId("");
    setFilterEntity("");
    setFilterName("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // Refetch data when selected society group changes
  useEffect(() => {
    fetchPage(1);
  }, [selectedSocietyGroupId]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-end mb-2">
        {societyGroups.length > 0 ? (
          <div className="w-full md:flex-1 [&>div]:mb-0">
            <Select
              name="filter-society-group"
              label="Grupo de sociedad"
              value={selectedSocietyGroupId}
              onChange={handleSocietyGroupChange}
            >
              <option value="">Todos</option>
              {societyGroups.map((group) => (
                <option key={group.id} value={String(group.id)}>
                  {group.description}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <div className="w-full md:flex-1 [&>div]:mb-0">
          <Select
            name="filter-entity"
            label="Entidad"
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
          >
            <option value="">Todas</option>
            {Object.entries(ENTITY_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full md:flex-1">
          <Input
            name="filter-name"
            type="text"
            label="Buscar usuario"
            placeholder="Nombre de usuario..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div className="w-full md:flex-1">
          <Input
            name="filter-start-date"
            type="date"
            label="Fecha Inicio"
            max={filterEndDate || ""}
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>
        <div className="w-full md:flex-1">
          <Input
            name="filter-end-date"
            type="date"
            label="Fecha Fin"
            min={filterStartDate || ""}
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 mb-2">
        <p className="text-sm text-text-secondary md:whitespace-nowrap">
          Mostrando {rows.length} de {meta.total_count} resultados
        </p>
        <Button
          variant="link"
          color="secondary"
          size="small"
          onClick={resetFilters}
        >
          Limpiar filtros
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="p-8 text-center text-text-secondary text-sm border border-border rounded-lg">
          Cargando registros...
        </div>
      ) : (
        <DataTable columns={COLUMNS} rows={rows} />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          page={page}
          setPage={fetchPage}
        />
      )}
    </div>
  );
}