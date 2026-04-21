/**
 * Audit Log Table Component
 *
 * Displays the audit log table with client-side filters by action type
 * and actor name, plus pagination.
 */

import { useState, useMemo } from "react";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import Select from "@/components/Utils/Select";
import Input from "@/components/Utils/Input";

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
}

// Constants
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
  REFUND_PROCESSED: "Reembolso procesado",
};

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
const LIMIT = 50;

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
export default function BitacoraTable({ initialData, initialMeta, role }: Props) {
  const [data, setData] = useState<AuditEntry[]>(initialData);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterAction, setFilterAction] = useState("");
  const [filterName, setFilterName] = useState("");

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
      const res = await fetch(`/api/audit-log/get-logs?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
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
        .filter((e) => (filterAction ? e.action_type === filterAction : true))
        .filter((e) =>
          filterName
            ? e.actor_user_name.toLowerCase().includes(filterName.toLowerCase())
            : true
        )
        .map((e) => ({
          event_timestamp: formatDate(e.event_timestamp),
          actor_user_name: e.actor_user_name,
          action_type: ACTION_TYPE_LABELS[e.action_type] ?? e.action_type,
          entity_type: e.entity_type,
          entity_id: e.entity_id,
          source_ip: e.source_ip,
          metadata_detail: formatMetadata(e.metadata),
        })),
    [data, filterAction, filterName]
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-end mb-8">
        <div className="w-full md:flex-1 [&>div]:mb-0">
          <Select
            name="filter-action"
            label="Tipo de acción"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">Todas</option>
            {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
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

        <span className="text-sm text-text-secondary md:ml-10 md:whitespace-nowrap">
          {rows.length} resultado{rows.length !== 1 ? "s" : ""} en esta página
        </span>
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
        <DataTable columns={COLUMNS} rows={rows} role={role as any} type="" />
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