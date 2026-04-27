/**
 * Refund Policies List Component
 * Displays a list of refund policies (excluding default)
 */

import { useState } from "react";
import Button from "@components/Buttons/Button";
import Card from "@components/Utils/Card";
import Pagination from "@components/Table/Pagination";
import UltimateWrapper from "@components/Modals/UltimateWrapper";

interface Props {
  data: any[];
  token: string;
  itemsPerPage?: number;
  currency?: string;
}

/**
 * Refund Policies List Component
 * Renders a paginated list of refund policies, excluding the default policy. 
 * Each policy card displays key information and provides edit/delete buttons
 * @param {Array} data - Array of refund policies
 * @param {string} token - Authentication token for API requests
 * @param {string} currency - Currency code for displaying amounts (default: "MXN")
 * @param {number} itemsPerPage - Number of policies to display per page
 * @returns {JSX.Element}
 */
export default function RefundPoliciesList({
  data = [],
  token,
  currency = "MXN",
  itemsPerPage = 5
}: Props) {
  // Filter out the default policy
  const policies = data.filter(p => !p.is_default);

  // Pagination states
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(policies.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = policies.slice(start, end);

  return (
    <div className="space-y-6">
      {/* Header with total count */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Políticas de Reembolso ({policies.length})
        </h2>
        <Button
          variant="filled"
          color="secondary"
          href="/crear-politica-reembolso"
        >
          Crear Política
        </Button>
      </div>

      {/* Policies List */}
      {policies.length > 0 ? (
        <div className="space-y-4">
          {pageData.map((policy: any) => (
            <Card
              key={policy.policy_id}
              tag={{ text: `Política #${policy.policy_id}`, type: 'primary' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8">
                {/* Name */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                  {policy.policy_name}
                </h2>
                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-primary">
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Monto:</span>{" "}
                      ${policy.min_amount.toFixed(2)} - ${policy.max_amount.toFixed(2)} {currency}
                    </p>
                    <p>
                      <span className="font-semibold">Días límite:</span>{" "}
                      {policy.submission_deadline_days ? `${policy.submission_deadline_days} días` : 'Sin límite'}
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
                      href={`/editar-politica-reembolso/${policy.policy_id}`}
                    >
                      Editar
                    </Button>
                    <UltimateWrapper
                      id={policy.policy_id}
                      endpoint="/refund-policy"
                      title="¿Estás seguro de que deseas eliminar esta política?"
                      message="Esta acción no se puede deshacer."
                      modal_type="warning"
                      color="warning"
                      variant="filled"
                      label="Eliminar"
                      redirectTo="/politicas-reembolso"
                      successMessage="Política de reembolso eliminada exitosamente."
                      errorMessage="Error al eliminar la política de reembolso."
                      token={token}
                      method="DELETE"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              page={page}
              setPage={setPage}
              maxVisible={5}
            />
          )}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            No hay políticas de reembolso creadas
          </p>
        </Card>
      )}
    </div>
  );
}
