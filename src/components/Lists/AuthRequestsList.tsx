/**
 * This component renders a paginated list of authorization requests for an authorizer.
 * It receives the list of requests as a prop and displays them in a card format.
 * The component also handles pagination logic to show a limited number of requests per page.
 */

import { useState, useMemo } from 'react';
import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import LabeledValue from '@/components/Utils/LabeledValue';
import Pagination from '@components/Table/Pagination';
import Tag from '@/components/Utils/Tag';
import type { UserRole } from "@type/roles";
import { formatDate } from '@utils/dateFormatter';
import { getStatusTagType } from '@utils/statusMapper';

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

interface Props {
  data: TravelRequest[];
  type?: string;
  role: UserRole;
  title?: string;
  subtitle?: string;
}

/**
 * AuthorizerRequestsList component renders a paginated list of authorization requests.
 * @param data - The array of request objects to display.
 * @param type - An optional string to specify the type of requests (e.g., "autorizaciones").
 * @param role - The user role to determine available actions.
 * @param title - Optional title for the section.
 * @param subtitle - Optional subtitle for the section.
 * @returns A React component that displays the requests in cards with pagination controls.
 */
export default function AuthorizerRequestsList({ data, type, role, title = "Solicitudes", subtitle }: Props) {
  const requestsPerPage = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / requestsPerPage);
  
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    return data.slice(start, end);
  }, [page, data]);
  
  return (
    <section className="space-y-6 w-full">
      <div className="flex flex-col justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title} ({data.length})</h2>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {data.length > 0 ? (
        <div className="space-y-6">
          {paginatedRequests.map((request: TravelRequest) => (
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
                  <a href={`/${type}/${request.request_id}`} className="block">
                    <Button
                      color="secondary"
                      variant="filled"
                    >
                      Revisar
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
          <Pagination
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            maxVisible={10}
          />
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">No hay solicitudes disponibles</p>
        </Card>
      )}
    </section>
  );
}
