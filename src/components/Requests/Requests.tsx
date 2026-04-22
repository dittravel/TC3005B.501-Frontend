/**
 * Requests Component
 * 
 * Displays a list of travel requests for the user, with filtering and sorting options.
 * Allows users to quickly access actions based on the status of each request.
 */

import { useState, useMemo } from 'react';
import type { UserRole } from '@type/roles';
import Button from '@components/Buttons/Button';
import Select from '@components/Utils/Select';
import Card from '@components/Utils/Card';
import Pagination from '@components/Table/Pagination';
import { getStatusTagType } from '@utils/statusMapper';

interface TravelRequest {
  request_id: number;
  request_status: string;
  notes: string;
  requested_fee: number;
  imposed_fee: number;
  request_days: number;
  creation_date: string;
  routes: Array<{
    route_id: number;
    origin_country: string;
    origin_city: string;
    destination_country: string;
    destination_city: string;
    beginning_date: string;
    ending_date: string;
  }>;
}

interface RequestsProps {
  data: TravelRequest[];
  role: UserRole;
}

// Function to determine the appropriate action route based on request status
const getActionRoute = (status: string, requestId: number): string => {
  if (status === 'Borrador') {
    return `/editar-solicitud/${requestId}`;
  }
  if (status === 'Comprobación gastos del viaje') {
    return `/comprobar-solicitud/${requestId}`;
  }

  // Default to details view
  return `/detalles-solicitud/${requestId}`;
};

export default function Requests({ data }: RequestsProps) {
  // State for filters, sorting, and pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filter or sort changes
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: 'asc' | 'desc') => {
    setSort(newSort);
    setCurrentPage(1);
  };

  // Define the available status filters
  const REQUEST_STATUSES = [
    { value: "all", label: "Todos" },
    { value: "Borrador", label: "Borrador" },
    { value: "Revisión", label: "Revisión" },
    { value: "Cotización del Viaje", label: "Cotización del Viaje" },
    { value: "Comprobación gastos del viaje", label: "Comprobación gastos del viaje" },
    { value: "Atención Agencia de Viajes", label: "Atención Agencia de Viajes" },
    { value: "Cancelado", label: "Cancelado" },
    { value: "Finalizado", label: "Finalizado" },
  ];

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = data || [];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.request_status === statusFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.creation_date).getTime();
      const dateB = new Date(b.creation_date).getTime();
      return sort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [data, statusFilter, sort]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredAndSortedRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-end mb-8">
        <div className="w-full md:flex-1 [&>div]:mb-0">
          <Select
            name="filter-status"
            label="Estado"
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            {REQUEST_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full md:flex-1 [&>div]:mb-0">
          <Select
            name="filter-sort"
            label="Ordenar"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Más reciente primero</option>
            <option value="asc">Más antigua primero</option>
          </Select>
        </div>
        <Button
          onClick={() => window.location.href = '/crear-solicitud'}
          variant="filled"
          color="secondary"
          size="medium"
        >
          Crear Solicitud
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {paginatedRequests.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary font-semibold">
              No hay solicitudes con ese filtro
            </p>
          </Card>
        ) : (
          paginatedRequests.map((request) => (
            <Card
              key={request.request_id}
              href={`/detalles-solicitud/${request.request_id}`}
              tag={{ text: `Solicitud #${request.request_id}`, type: 'secondary' }}
              status={{
                text: request.request_status || 'Desconocido',
                type: getStatusTagType(request.request_status),
              }}
            >
              <div className="flex justify-between gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div className="space-y-1">
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Destino:</span> {request.routes?.[0]?.destination_city}, {request.routes?.[0]?.destination_country}
                    </p>
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Duración:</span> {request.request_days} días
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Fechas:</span> {request.routes?.[0]?.beginning_date ? new Date(request.routes[0].beginning_date).toLocaleDateString('es-MX') : '—'} - {request.routes?.[0]?.ending_date ? new Date(request.routes[0].ending_date).toLocaleDateString('es-MX') : '—'}
                    </p>
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Monto:</span> ${request.requested_fee}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      const actionRoute = getActionRoute(request.request_status, request.request_id);
                      if (actionRoute) {
                        window.location.href = actionRoute;
                      }
                    }}
                    variant="filled"
                    color={request.request_status === 'Borrador' ? 'secondary' : 'primary'}
                    size="small"
                  >
                    {request.request_status === 'Borrador' 
                      ? 'Editar Borrador' 
                      : request.request_status === 'Comprobación gastos del viaje'
                      ? 'Comprobar Gastos'
                      : 'Ver Detalles'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          page={currentPage}
          setPage={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
