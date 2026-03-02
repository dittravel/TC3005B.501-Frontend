/**
 * Author: Eduardo Porto Morales & Hector Julian Zarate Ramirez
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "bg-success-50/20 text-success-100";
      case "Pendiente":
        return "bg-alert-50/20 text-alert-100";
      default:
        return "bg-warning-50/20 text-warning-100";
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
              className="content-wrapper block transition hover:shadow-lg"
            >
              <div className="grid grid-cols-[1fr] md:grid-cols-[2fr_1fr] gap-8 items-center">
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
                <div className="flex items-center justify-center md:justify-end">
                  <span className={`text-xs font-semibold px-4 py-2 rounded-full ${getStatusStyle(request.currentStatus)}`}>
                    {(request.status || "DESCONOCIDO").toUpperCase()}
                  </span>
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
