/**
 * Authorization Rules List
 * 
 * Displays a paginated list of authorization rules defined in the system.
 */

import { useState } from "react";
import Pagination from "@/components/Table/Pagination";
import Card from "@/components/Utils/Card";
import { getStatusTagType } from "@/utils/statusMapper";
import DefaultAuthRule from "@/components/Forms/DefaultAuthRule";
import Button from "@/components/Buttons/Button";

interface Props {
  data: any[];
  itemsPerPage?: number;
}

export default function AuthRulesList({ data, itemsPerPage = 5 }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageRequests = data.slice(start, end);

  return (
    <div className="space-y-6">
      {/* Default Auth Rule */}
      <DefaultAuthRule />
      {/* Header with total count of rules */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Reglas de Autorización ({data.length})
        </h2>
        <Button variant="filled" color="secondary">
          Crear Regla
        </Button>
      </div>
      {data.length > 0 ? (
        <div className="space-y-6">
          {pageRequests.map((request: any) => (
            <Card
              key={request.request_id}
              href={`/detalles-solicitud/${request.request_id}`}
              tag={{ text: `Solicitud #${request.request_id}`, type: 'secondary' }}
              status={{
                text: request.status || 'Desconocido',
                type: getStatusTagType(request.status),
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Origen:</span> {request.origin_country}
                  </p>
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Destino:</span> {request.destination_country}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Fecha Inicio:</span> {request.beginning_date}
                  </p>
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Fecha Fin:</span> {request.ending_date}
                  </p>
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
          <p className="text-text-secondary font-semibold">
            No cuentas con viajes completados, rechazados o cancelados
          </p>
        </Card>
      )}
    </div>
  );
}
