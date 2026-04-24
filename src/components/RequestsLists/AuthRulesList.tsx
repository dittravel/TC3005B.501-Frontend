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
  token: string;
  itemsPerPage?: number;
  canCreateRule?: boolean;
  canEditRule?: boolean;
  canDeleteRule?: boolean;
}

export default function AuthRulesList({ data, token, itemsPerPage = 5, canCreateRule = false, canEditRule = false, canDeleteRule = false }: Props) {
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
        defaultRule={defaultRule}
        token={token}
      />
      {/* Header with total count of rules */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Reglas de Autorización ({rules.length})
        </h2>
        {canCreateRule ? (
          <Button
            variant="filled"
            color="secondary"
            href="/crear-regla"
          >
            Crear Regla
          </Button>
        ) : null}
      </div>
      {rules.length > 0 ? (
        <div className="space-y-6">
          {pageRequests.map((rule: any, index: number) => (
            <Card
              key={rule.rule_id}
              tag={{ text: `#${rule.rule_id}`, type: 'secondary' }}
              status={{
                text: rule.travel_type || 'Desconocido',
                type: getStatusTagType(rule.travel_type),
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8">
                {/* Name */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                  {rule.rule_name}
                </h2>
                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-primary">
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Niveles:</span>{" "}
                      {rule.num_levels ?? "–"}
                    </p>
                    <p>
                      <span className="font-semibold">Automático:</span>{" "}
                      {rule.automatic ? "Sí" : "No"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Duración:</span>{" "}
                      {rule.min_duration ?? 0}–{rule.max_duration ?? "-"} día(s)
                    </p>
                    <p>
                      <span className="font-semibold">Monto:</span>{" "}
                      ${rule.min_amount ?? 0}–{rule.max_amount ?? "-"} MXN
                    </p>
                  </div>
                </div>
                {/* Actions */}
                <div>
                  <div className="w-full flex flex-row gap-2">
                    {canEditRule ? (
                      <Button
                        variant="filled"
                        color="primary"
                        className="w-full"
                        href={`/editar-regla/${rule.rule_id}`}
                      >
                        <span className="flex justify-center">
                          Editar
                        </span>
                      </Button>
                    ) : null}
                    {canDeleteRule ? (
                      <DeleteAuthRuleModal
                        title="Eliminar Regla"
                        message="¿Estás seguro de que deseas eliminar esta regla de autorización?"
                        token={token}
                        rule_id={rule.rule_id}
                      />
                    ) : null}
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
            No existen reglas de autorización adicionales
          </p>
        </Card>
      )}
    </div>
  );
}
