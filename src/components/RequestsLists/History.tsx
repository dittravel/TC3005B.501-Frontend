/**
 * History Component
 * 
 * Displays a paginated list of travel requests with their status, origin, destination,
 * and travel dates. Each request is clickable and links to the detailed view.
 * Manages pagination client-side using React hooks.
 * 
 * This component uses React to render client side de useState 
 * to manage pagination.
 */

import { useState } from "react";
import Pagination from "@/components/Table/Pagination";
import Tag from "@/components/Utils/Tag";

interface Props {
  data: any[];
  itemsPerPage?: number;
}

export default function History({ data , itemsPerPage = 5 }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageRequests = data.slice(start, end);

  /**
   * Returns the tag type for styling the status badge based on the request status.
   * @param {string} status - The current status of the request
   * @returns {string} Tag type for the component
   */
  const getStatusType = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "success";
      case "Rechazado":
        return "alert";
      case "Cancelado":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {data.length > 0 ? (
        <div className="space-y-6">
          {pageRequests.map((request: any) => (
            <a
              key={request.request_id}
              href={`/detalles-solicitud/${request.request_id}`}
              className="content-wrapper block"
            >
              <div className="grid grid-cols-[1fr] md:grid-cols-[2fr_1fr] gap-8 items-start">
                <div className="space-y-2">
                  <Tag text={`Solicitud #${request.request_id}`} type="secondary" />
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">Origen:</span> {request.origin_country}
                      </p>
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">Destino:</span> {request.destination_country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">Fecha Inicio:</span> {request.beginning_date}
                      </p>
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">Fecha Fin:</span> {request.ending_date}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Tag text={(request.status || "Desconocido")} type={getStatusType(request.status)} />
                </div>
              </div>
            </a>
          ))}
          <Pagination
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            maxVisible={5}
          />
        </div>
      ) : (
        <div className="card text-center text-text-secondary font-semibold">
          No cuentas con viajes completados, rechazados o cancelados
        </div>
      )}
    </div>
  );
}
