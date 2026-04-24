/**
 * BitacoraTable Component
 *
 * Displays the audit log table with client-side filters by action type
 * and actor name, plus pagination.
 */

import { useState, useMemo } from "react";
import DataTable from "./DataTable";
import Pagination from "./Pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

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

const LIMIT = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function BitacoraTable({ initialData, initialMeta, role }: Props) {
  const [data, setData] = useState<AuditEntry[]>(initialData);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterAction, setFilterAction] = useState("");
  const [filterName, setFilterName] = useState("");

  const totalPages = Math.ceil(meta.total_count / LIMIT);

  // ── Fetch página ──────────────────────────────────────────────────────────
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

  // ── Filtros en cliente ────────────────────────────────────────────────────
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
      {/* Encabezado */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">
          Bitácora de acciones {meta.total_count > 0 && `(${meta.total_count})`}
        </h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-action"
            className="text-sm font-medium text-text-secondary"
          >
            Tipo de acción
          </label>
          <select
            id="filter-action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-border rounded-md px-3 py-2 bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Todas</option>
            {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-name"
            className="text-sm font-medium text-text-secondary"
          >
            Buscar usuario
          </label>
          <input
            id="filter-name"
            type="text"
            placeholder="Nombre de usuario..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="border border-border rounded-md px-3 py-2 bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-52"
          />
        </div>

        <span className="text-sm text-text-secondary ml-auto self-end">
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