/**
 * This component renders a paginated list of authorization requests for an authorizer.
 * It receives the list of requests as a prop and displays them in a card format.
 * The component also handles pagination logic to show a limited number of requests per page.
 */

import { useState, useEffect } from 'react';
import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import Pagination from '@components/Table/Pagination';
import type { UserRole } from "@type/roles";

interface Props {
  data: any[];
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
  const [visibleRequests, setVisibleRequests] = useState<Record<string, any>[]>([]);
  const totalPages = Math.ceil(data.length / requestsPerPage);
  
  useEffect(() => {
    const start = (page - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    
    setVisibleRequests(data.slice(start, end));
  }, [page, data]);
  
  return (
    <section className="space-y-6 w-full">
      <div className="flex flex-col justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title} ({data.length})</h2>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {data.length > 0 ? (
        <div className="space-y-6">
          {visibleRequests.map((request: any) => (
            <Card
              key={request.request_id}
              tag={{ text: `Solicitud #${request.request_id}`, type: 'secondary' }}
              status={{ text: request.request_status, type: 'default' }}
            >
              <div className="card-content-grid">
                <div className="space-y-2 text-sm text-text-primary">
                  <p className="text-lg font-semibold">{request.destination_country}</p>
                  <p>
                    <span className="font-medium">Inicio:</span> {request.beginning_date}
                    <span className="font-medium ml-2">Fin:</span> {request.ending_date}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <a href={`/${type}/${request.request_id}`} className="block">
                    <Button
                      color="secondary"
                      variant="filled"
                      size="medium"
                      className="w-full"
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
            maxVisible={5}
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
