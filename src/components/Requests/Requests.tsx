/**
 * Requests Component
 * 
 * Displays a list of travel requests for the user, with filtering and sorting options.
 * Allows users to quickly access actions based on the status of each request.
 */

import { useState, useMemo } from 'react';
import Button from '@components/Buttons/Button';
import Select from '@components/Utils/Select';
import Card from '@components/Utils/Card';
import LabeledValue from '@components/Utils/LabeledValue';
import Pagination from '@components/Table/Pagination';
import UltimateWrapper from '@components/Modals/UltimateWrapper';
import { getStatusTagType } from '@utils/statusMapper';
import { formatDate } from '@utils/dateFormatter';
import Tag from '../Utils/Tag';

interface TravelRequest {
  request_id: number;
  request_status: string;
  notes: string;
  requested_fee: number;
  imposed_fee: number;
  request_days: number;
  creation_date: string;
  assigned_to_name?: string;
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
  token: string;
}

// Function to determine the appropriate action route based on request status
const getActionRoute = (status: string, requestId: number): string => {
  if (status === 'Borrador') {
    return `/editar-borrador/${requestId}`;
  }
  if (status === 'Comprobación gastos del viaje') {
    return `/comprobar-solicitud/${requestId}`;
  }

  // Default to details view
  return `/detalles-solicitud/${requestId}`;
};

/**
 * Requests Component
 * Displays a list of travel requests for the user, with filtering and sorting options.
 * @param {TravelRequest[]} data - Array of travel requests to display.
 * @param {string} token - Authentication token for API requests.
 * @returns {JSX.Element} The rendered Requests component.
 */
export default function Requests({
  data,
  token
}: RequestsProps) {
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
    { value: "Rechazado", label: "Rechazado" },
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
        >
          Crear Solicitud
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {paginatedRequests.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary font-semibold">
              No se encontraron solicitudes
            </p>
          </Card>
        ) : (
          paginatedRequests.map((request) => (
            <Card
              key={request.request_id}
              tag={{ text: `Solicitud #${request.request_id}`, type: 'secondary' }}
              status={{
                text: request.request_status || 'Desconocido',
                type: getStatusTagType(request.request_status),
              }}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                  <LabeledValue
                    label="Destino(s)"
                    value={
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span>
                          {request.routes?.[0]?.destination_city === 'notSelected' ? '—' : request.routes?.[0]?.destination_city},
                          {' '}
                          {request.routes?.[0]?.destination_country === 'notSelected' ? '—' : request.routes?.[0]?.destination_country}
                        </span>
                        {request.routes && request.routes.length > 1 && (
                          <Tag
                            text={`+${request.routes.length - 1}`}
                            type="secondary"
                          />
                        )}
                      </div>
                    }
                  />
                  <LabeledValue
                    label="Fechas"
                    value={`${request.routes?.[0]?.beginning_date ? formatDate(request.routes[0].beginning_date) : '—'} - ${request.routes?.[0]?.ending_date ? formatDate(request.routes[request.routes.length-1].ending_date) : '—'}`}
                  />
                  <LabeledValue
                    label="Monto Solicitado"
                    value={`$${request.requested_fee}`}
                  />
                  <LabeledValue
                    label="Asignado a"
                    value={request.assigned_to_name || 'Sin asignar'}
                  />
                </div>
                
                <div className="flex gap-4 items-end">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      const actionRoute = getActionRoute(request.request_status, request.request_id);
                      if (actionRoute) {
                        window.location.href = actionRoute;
                      }
                    }}
                    variant="filled"
                    color={request.request_status === 'Borrador' ? 'primary' : 'secondary'}
                  >
                    {request.request_status === 'Borrador'
                      ? 'Editar'
                      : request.request_status === 'Comprobación gastos del viaje'
                      ? 'Comprobar Gastos'
                      : 'Ver Detalles'}
                  </Button>
                  {request.request_status === 'Borrador' && (
                    <UltimateWrapper
                      id={Number(request.request_id)}
                      endpoint="/requests/delete-draft"
                      title="Eliminar borrador"
                      message="¿Está seguro de que deseas eliminar este borrador?"
                      redirectTo="/solicitudes"
                      modal_type="warning"
                      color="warning"
                      variant="filled"
                      label="Eliminar"
                      method="DELETE"
                      token={token}
                      successMessage="Borrador eliminado exitosamente."
                    />
                  )}
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
