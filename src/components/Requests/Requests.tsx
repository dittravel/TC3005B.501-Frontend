/**
 * Requests Component
 * 
 * Displays a list of travel requests for the user, with filtering and sorting options.
 * Allows users to quickly access actions based on the status of each request.
 */

import { useState, useMemo, useEffect } from 'react';
import Button from '@components/Buttons/Button';
import Select from '@components/Utils/Select';
import Card from '@components/Utils/Card';
import LabeledValue from '@components/Utils/LabeledValue';
import Pagination from '@components/Table/Pagination';
import UltimateWrapper from '@components/Modals/UltimateWrapper';
import { apiRequest } from "@utils/apiClient";
import { getStatusTagType } from '@utils/statusMapper';
import { formatDate } from '@utils/dateFormatter';
import Tag from '../Utils/Tag';

interface TravelRequest {
  request_id: number;
  request_status: string;
  notes: string;
  requested_fee: number;
  imposed_fee: number;
  currency: string;
  request_days: number;
  creation_date: string;
  authorization_level?: number;
  authorization_levels_total?: number | null;
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

interface Country {
  country_id: number;
  country_name: string;
}

interface RequestsProps {
  data: TravelRequest[];
  token: string;
  hideFilters?: boolean;
  actionRoute?: string;
}

// Default function to determine the appropriate action route based on request status
const defaultGetActionRoute = (status: string, requestId: number): string => {
  if (status === 'Borrador') {
    return `/editar-borrador/${requestId}`;
  }
  if (status === 'Comprobación gastos del viaje') {
    return `/comprobar-solicitud/${requestId}`;
  }

  // Default to details view
  return `/detalles-solicitud/${requestId}`;
};

// Format status display with authorization level for review states
const formatStatusDisplay = (status: string, authLevel?: number, totalLevels?: number | null): string => {
  if (status === 'Revisión' && authLevel !== undefined) {
    if (totalLevels) {
      return `Revisión ${authLevel + 1}/${totalLevels}`;
    }
    return `Revisión #${authLevel + 1}`;
  }
  return status;
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
  token,
  hideFilters = false,
  actionRoute,
}: RequestsProps) {
  // State for filters, sorting, and pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateField, setDateField] = useState('creation_date');
  const [sort, setSort] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await apiRequest('/countries', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        setCountries(response);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

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

  // Filter and sort requests based on current state
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = data || [];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.request_status === statusFilter);
    }

    // Apply country filter
    if (countryFilter) {
      filtered = filtered.filter(req => 
        req.routes.some(route => route.destination_country === countryFilter)
      );
    }

    // Sort by selected date field and order
    filtered = [...filtered].sort((a, b) => {
      // Filter by date
      let dateA: number, dateB: number;

      if (dateField === 'creation_date') {
        // Order by creation date
        dateA = new Date(a.creation_date).getTime();
        dateB = new Date(b.creation_date).getTime();
      } else {
        // Order by beginning date of the trip
        dateA = new Date(a.routes[0].beginning_date).getTime();
        dateB = new Date(b.routes[0].beginning_date).getTime();
      }

      // Sort based on selected order
      return sort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [data, statusFilter, dateField, sort, countryFilter]);

  const resetFilters = () => {
    setStatusFilter('all');
    setDateField('creation_date');
    setSort('desc');
    setCountryFilter('');
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredAndSortedRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col-reverse gap-4 lg:items-end lg:justify-between mb-2">
        <div className="flex flex-col lg:flex-row gap-3 w-full">
          {!hideFilters && (
            <div className="w-full flex-1">
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
          )}
          <div className="w-full flex-1">
            <Select
              name="filter-date-field"
              label="Fecha"
              value={dateField}
              onChange={(e) => {
                setDateField(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="beginning_date">Inicio del viaje</option>
              <option value="creation_date">Creación</option>
            </Select>
          </div>
          <div className="w-full flex-1">
            <Select
              name="filter-date-order"
              label="Orden"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Más reciente primero</option>
              <option value="asc">Más antigua primero</option>
            </Select>
          </div>
          <div className="w-full flex-1">
            <Select
              name="filter-country"
              label="País de destino"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {countries.map((country: any) => (
                <option key={country.country_id} value={country.country_name}>
                  {country.country_name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {!hideFilters && (
          <Button
            onClick={() => window.location.href = '/crear-solicitud'}
            variant="filled"
            color="secondary"
          >
            Crear Solicitud
          </Button>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Mostrando {paginatedRequests.length} de {filteredAndSortedRequests.length} resultados
          </p>
          <Button 
            variant="link"
            size="small"
            color="secondary"
            onClick={resetFilters}
          >
            Limpiar filtros
          </Button>
        </div>
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
                text: formatStatusDisplay(request.request_status, request.authorization_level, request.authorization_levels_total) || 'Desconocido',
                type: getStatusTagType(request.request_status),
              }}
            >
              <div className="grid flex-cols-1 lg:grid-cols-[1fr_10rem] justify-between gap-6">
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
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
                    label={`${request.imposed_fee > 0 ? 'Anticipo' : 'Monto Solicitado'}`}
                    value={`$${request.imposed_fee > 0 ? request.imposed_fee.toFixed(2) : request.requested_fee.toFixed(2)} ${request.currency}`}
                  />
                  <div className="hidden md:block">
                    <LabeledValue
                      label="Asignado a"
                      value={request.assigned_to_name || 'Sin asignar'}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 items-center justify-end">
                  {!actionRoute && (
                    <Button
                      variant="filled"
                      color="secondary"
                      size="small"
                      href={"detalles-solicitud/" + request.request_id}
                    >
                      Detalles
                    </Button>
                  )}
                  {actionRoute ? (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `${actionRoute}/${request.request_id}`;
                      }}
                      variant="filled"
                      size="small"
                      color="secondary"
                    >
                      {request.request_status === 'Borrador' ? 'Editar' : request.request_status === 'Comprobación gastos del viaje' ? 'Comprobar' : 'Atender'}
                    </Button>
                  ) : (request.request_status === 'Borrador' || request.request_status === 'Comprobación gastos del viaje') && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        const route = defaultGetActionRoute(request.request_status, request.request_id);
                        if (route) {
                          window.location.href = route;
                        }
                      }}
                      variant="filled"
                      size="small"
                      color={request.request_status === 'Borrador' ? 'primary' : 'secondary'}
                    >
                      {request.request_status === 'Borrador' ? 'Editar' : 'Comprobar'}
                    </Button>
                  )}
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
                      size="small"
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