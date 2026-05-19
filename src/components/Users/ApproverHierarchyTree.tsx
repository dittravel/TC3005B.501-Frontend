import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/utils/apiClient';

interface UsuarioBase {
  userId: number;
  userName: string;
  roleName?: string | null;
  departmentName?: string | null;
}

interface NodoArbol {
  userId: number;
  userName: string;
  roleName?: string | null;
  departmentName?: string | null;
  bossId?: number | null;
  outOfOfficeStartDate?: string | null;
  outOfOfficeEndDate?: string | null;
  substituteId?: number | null;
  substituteName?: string | null;
  children?: NodoArbol[];
}

interface RespuestaJerarquia {
  selectedUser: NodoArbol;
  ancestors: NodoArbol[];
  descendants: NodoArbol[];
}

interface Props {
  initialUserId: number;
  users?: UsuarioBase[];
  allowUserSelection?: boolean;
  token?: string;
  compact?: boolean;
}

function obtenerFechaHoy() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function normalizarFecha(valor?: string | null) {
  if (!valor) return null;
  return String(valor).slice(0, 10);
}

function estaAusenteEnFecha(nodo: NodoArbol, fechaEvaluacion: string) {
  const inicio = normalizarFecha(nodo.outOfOfficeStartDate);
  const fin = normalizarFecha(nodo.outOfOfficeEndDate);

  if (!inicio || !fin) {
    return false;
  }

  return fechaEvaluacion >= inicio && fechaEvaluacion <= fin;
}

function NodoUsuario({
  nodo,
  esCompacto = false,
  esUsuarioSeleccionado = false,
  fechaEvaluacion,
}: Readonly<{
  nodo: NodoArbol;
  esCompacto?: boolean;
  esUsuarioSeleccionado?: boolean;
  fechaEvaluacion: string;
}>) {
  const tieneAusenciaProgramada = estaAusenteEnFecha(nodo, fechaEvaluacion);
  const tieneSustituto = Boolean(nodo.substituteName);

  return (
    <div
      className={`rounded-md border-2 px-4 py-3 w-64 ${
        esUsuarioSeleccionado ? 'border-secondary bg-secondary/10 shadow-sm' : 'border-border bg-background'
      } ${esCompacto ? 'py-2 px-3 w-56' : ''}`}
    >
      <p className="font-semibold text-text-primary text-sm truncate">{nodo.userName}</p>
      <p className="text-xs text-text-secondary mt-1 truncate">
        {nodo.roleName || 'Sin rol'} - {nodo.departmentName || 'Sin depto'}
      </p>
      {(tieneAusenciaProgramada || tieneSustituto) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tieneAusenciaProgramada && (
            <span className="rounded border border-warning-500/30 bg-warning-500/10 px-2 py-0.5 text-[11px] text-warning-600">
              Ausencia programada
            </span>
          )}
          {tieneSustituto && (
            <span className="rounded border border-border px-2 py-0.5 text-[11px] text-text-secondary">
              Sustituto: {nodo.substituteName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function RamaSubordinados({
  nodos,
  esCompacto = false,
  usuarioDestacadoId,
  fechaEvaluacion,
}: Readonly<{
  nodos: NodoArbol[];
  esCompacto?: boolean;
  usuarioDestacadoId: number;
  fechaEvaluacion: string;
}>) {
  if (!nodos.length) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full gap-0">
      {nodos.map((nodo, idx) => {
        const tieneHijos = Array.isArray(nodo.children) && nodo.children.length > 0;
        return (
          <div key={nodo.userId} className="flex flex-col items-center w-full">
            <NodoUsuario
              nodo={nodo}
              esCompacto={esCompacto}
              esUsuarioSeleccionado={nodo.userId === usuarioDestacadoId}
              fechaEvaluacion={fechaEvaluacion}
            />
            {tieneHijos && nodo.children && (
              <>
                <div className="w-0.5 h-4 bg-secondary/30 my-2" />
                <RamaSubordinados
                  nodos={nodo.children}
                  esCompacto={esCompacto}
                  usuarioDestacadoId={usuarioDestacadoId}
                  fechaEvaluacion={fechaEvaluacion}
                />
              </>
            )}
            {idx < nodos.length - 1 && (
              <div className="w-0.5 h-4 bg-secondary/30 my-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ArbolJerarquia({
  initialUserId,
  users = [],
  allowUserSelection = false,
  token,
  compact = false,
}: Readonly<Props>) {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number>(initialUserId);
  const [busqueda, setBusqueda] = useState('');
  const [fechaEvaluacion, setFechaEvaluacion] = useState(obtenerFechaHoy());
  const [datos, setDatos] = useState<RespuestaJerarquia | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usuariosDisponibles = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    if (!busquedaNormalizada) return users;
    return users.filter((usuario) => usuario.userName.toLowerCase().includes(busquedaNormalizada));
  }, [users, busqueda]);

  useEffect(() => {
    setUsuarioSeleccionado(initialUserId);
  }, [initialUserId]);

  useEffect(() => {
    let activo = true;

    async function cargarArbol() {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await apiRequest<RespuestaJerarquia>(`/user/approver-hierarchy/${usuarioSeleccionado}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!activo) return;
        setDatos(respuesta);
      } catch (err) {
        console.error('Error al cargar la jerarquía de aprobación:', err);
        if (!activo) return;
        setError('No se pudo cargar la jerarquía de aprobación. Por favor, intenta de nuevo.');
        setDatos(null);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarArbol();

    return () => {
      activo = false;
    };
  }, [usuarioSeleccionado, token]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6">
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {allowUserSelection && users.length > 0 && (
          <>
            <div>
              <label htmlFor="busca-usuario" className="block text-xs font-medium text-text-secondary mb-2">
                Buscar por nombre
              </label>
              <input
                id="busca-usuario"
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: Juan, Maria..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label htmlFor="elige-usuario" className="block text-xs font-medium text-text-secondary mb-2">
                Selecciona usuario
              </label>
              <select
                id="elige-usuario"
                value={usuarioSeleccionado}
                onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {usuariosDisponibles.map((usuario) => (
                  <option key={usuario.userId} value={usuario.userId}>
                    {usuario.userName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className={allowUserSelection && users.length > 0 ? '' : 'md:col-span-3 md:max-w-xs'}>
          <label htmlFor="fecha-evaluacion" className="block text-xs font-medium text-text-secondary mb-2">
            Fecha de evaluacion
          </label>
          <input
            id="fecha-evaluacion"
            type="date"
            value={fechaEvaluacion}
            onChange={(e) => setFechaEvaluacion(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {cargando && <p className="text-sm text-text-secondary">Preparando jerarquía de aprobación...</p>}
      {error && <p className="text-sm text-warning-500">{error}</p>}

      {!cargando && !error && datos && (
        <div className="flex flex-col items-center gap-4">
          {/* Ancestros (Cadena de mando hacia arriba) */}
          {datos.ancestors.length > 0 && (
            <div className="flex flex-col items-center w-full">
              {datos.ancestors.map((ancestro, idx) => (
                <div key={ancestro.userId} className="flex flex-col items-center w-full">
                  <NodoUsuario
                    nodo={ancestro}
                    esCompacto={compact}
                    esUsuarioSeleccionado={ancestro.userId === datos.selectedUser.userId}
                    fechaEvaluacion={fechaEvaluacion}
                  />
                  {idx < datos.ancestors.length - 1 ? (
                    <div className="w-0.5 h-4 bg-secondary/30 my-2" />
                  ) : null}
                </div>
              ))}
              <div className="w-0.5 h-4 bg-secondary/30" />
            </div>
          )}

          {/* Usuario actual */}
          <div className="flex flex-col items-center w-full">
            <NodoUsuario
              nodo={datos.selectedUser}
              esCompacto={compact}
              esUsuarioSeleccionado
              fechaEvaluacion={fechaEvaluacion}
            />
            {datos.descendants.length > 0 && (
              <div className="w-0.5 h-4 bg-secondary/30 my-2" />
            )}
          </div>

          {/* Subordinados */}
          {datos.descendants.length > 0 && (
            <RamaSubordinados
              nodos={datos.descendants}
              esCompacto={compact}
              usuarioDestacadoId={datos.selectedUser.userId}
              fechaEvaluacion={fechaEvaluacion}
            />
          )}
        </div>
      )}
    </div>
  );
}
