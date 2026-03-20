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
   * Returns CSS classes for styling the status badge based on the request status.
   * @param {string} status - The current status of the request
   * @returns {string} Tailwind CSS classes for the status badge styling
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "bg-success-100/20 text-text-primary/60";
      case "Rechazado":
        return "bg-alert-200/50 text-text-primary/60";
      case "Cancelado":
        return "bg-warning-100/20 text-text-primary/60";
      default:
        return "bg-secondary/20 text-text-primary/60";
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
                  <h2 className="text-xl font-bold text-text-primary">
                    #{request.request_id}
                  </h2>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">Origen:</span> {request.origin_country}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">Destino:</span> {request.destination_country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">Fecha Inicio:</span> {request.beginning_date}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">Fecha Fin:</span> {request.ending_date}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <p className={`text-xs font-semibold px-4 py-2 rounded-full ${getStatusStyle(request.status)}`}>
                    {(request.status || "DESCONOCIDO").toUpperCase()}
                  </p>
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
        <div className="content-wrapper text-center text-text-secondary font-semibold">
          NO CUENTAS CON VIAJES COMPLETADOS, CANCELADOS O RECHAZADOS
        </div>
      )}
    </div>
  );
}
