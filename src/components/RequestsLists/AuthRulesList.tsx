/**
 * Authorization Rules List
 * 
 * Displays a paginated list of authorization rules defined in the system.
 */

import { useState } from "react";
import { getStatusTagType } from "@/utils/statusMapper";

import DefaultAuthRule from "@/components/Forms/DefaultAuthRule";
import DeleteAuthRuleModal from "@/components/Modals/DeleteAuthRuleModal";

import Pagination from "@/components/Table/Pagination";
import Card from "@/components/Utils/Card";
import Button from "@/components/Buttons/Button";

interface Props {
  data: any[];
  users: any[];
  token: string;
  itemsPerPage?: number;
}

export default function AuthRulesList({ data, users, token, itemsPerPage = 5 }: Props) {
  // Separate default and non-default rules
  const defaultRule = data.find(rule => rule.is_default);
  const rules = data.filter(rule => !rule.is_default);

  // Pagination state
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageRequests = rules.slice(start, end);

  return (
    <div className="space-y-6">
      {/* Default Auth Rule */}
      <DefaultAuthRule
        users={users}
        defaultRule={defaultRule}
      />
      {/* Header with total count of rules */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Reglas de Autorización ({rules.length})
        </h2>
        <Button
          variant="filled"
          color="secondary"
          href="/crear-regla"
        >
          Crear Regla
        </Button>
      </div>
      {rules.length > 0 ? (
        <div className="space-y-6">
          {pageRequests.map((request: any) => (
            <Card
              key={request.id}
              tag={{ text: `#${request.id}`, type: 'secondary' }}
              status={{
                text: request.travel_type || 'Desconocido',
                type: getStatusTagType(request.travel_type),
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8">
                {/* Name */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                  {request.name}
                </h2>
                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-primary">
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Niveles:</span>{" "}
                      {request.niveles_autorizacion ?? "–"}
                    </p>
                    <p>
                      <span className="font-semibold">Automático:</span>{" "}
                      {request.automatico ? "Sí" : "No"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Duración:</span>{" "}
                      {request.min_duration ?? 0}–{request.max_duration ?? "-"} día(s)
                    </p>
                    <p>
                      <span className="font-semibold">Monto:</span>{" "}
                      ${request.min_amount ?? 0}–{request.max_amount ?? "-"} MXN
                    </p>
                  </div>
                </div>
                {/* Actions */}
                <div>
                  <div className="w-full flex flex-row gap-2">
                    <Button
                      variant="filled"
                      color="primary"
                      className="w-full"
                      href={`/editar-regla/${request.id}`}
                    >
                      <span className="flex justify-center">
                        Editar
                      </span>
                    </Button>
                    <DeleteAuthRuleModal
                      title="Eliminar Regla"
                      message="¿Estás seguro de que deseas eliminar esta regla de autorización?"
                      token={token}
                      rule_id={request.id}
                    />
                  </div>
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
