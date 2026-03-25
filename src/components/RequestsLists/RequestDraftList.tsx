/**
 * Request Draft List Component
 * 
 * Displays user draft travel requests with edit/delete actions.
 */

import { useState } from 'react';
import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import CancelRequestModal from '@/components/Modals/CancelRequestModal';

interface DraftRequest {
  request_id: string;
  status: string;
  destination_country: string;
  beginning_date: string;
  ending_date: string;
}

interface Props {
  requests: DraftRequest[];
  token: string;
}

export default function RequestDraftList({ requests, token }: Props) {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const filteredRequests = requests.filter(
    (r) => r.status === 'Borrador' && !deletedIds.has(r.request_id)
  );

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
  };

  return (
    <section>
      {filteredRequests.length > 0 ? (
        <div className="grid gap-4">
          {filteredRequests.map((request: any) => (
            <Card
              key={request.request_id}
              tag={{ text: `Solicitud #${request.request_id}`, type: 'secondary' }}
              status={{ text: 'Borrador', type: 'default' }}
            >
              <div className="card-content-grid">
                {/* Draft info */}
                <div className="space-y-1 text-sm text-text-primary">
                  <p>
                    <span className="font-semibold">País Destino:</span>{' '}
                    {request.destination_country === 'notSelected'
                      ? 'NO SELECCIONADO'
                      : request.destination_country}
                  </p>
                  <p>
                    <span className="font-semibold">Fechas:</span>{' '}
                    {request.beginning_date === '1900-01-01'
                      ? 'NO DETERMINADA'
                      : `${request.beginning_date} - ${request.ending_date}`}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 w-full">
                  <a href={`/completar-draft/${request.request_id}`} className="block">
                    <Button
                      color="secondary"
                      variant="filled"
                      size="medium"
                      className="w-full"
                    >
                      Editar
                    </Button>
                  </a>
                  <CancelRequestModal
                    id={request.request_id}
                    token={token}
                    color="warning"
                    variant="filled"
                    label="Eliminar"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            No tienes drafts de solicitudes
          </p>
        </Card>
      )}
    </section>
  );
}
