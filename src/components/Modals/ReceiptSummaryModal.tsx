/**
 * Receipt Summary Component
 *
 * Provides a Pop-up menu that summarizes the total amount of approved receipts,
 * the imposed fee, and the final reimbursement amount.
 */

import { useState } from "react";
import Button from "@/components/Buttons/Button";
import UltimateWrapper from "@/components/Modals/UltimateWrapper";
import Card from "@/components/Utils/Card";
import Reminder from "@/components/Utils/Reminder";

interface Props {
  requestId: string | number;
  token: string;
  expenses: any[];
  imposedFee?: number | null;
  redirectTo?: string;
}

/**
 * Receipt Summary Modal
 * Displays a summary of the approved receipts, imposed fee, and reimbursement amount.
 * Provides options to finalize the request or cancel.
 * @param {number | string} requestId - The ID of the request being summarized
 * @param {string} token - Authentication token for API requests
 * @param {any[]} expenses - Array of expense receipts associated with the request
 * @param {number} imposedFee - The advance amount assigned by accounts payable (if any)
 * @param {string} redirectTo - URL to redirect to after finalizing the request
 * @returns {JSX.Element} A button that triggers a modal with the receipt summary
 */
export default function ReceiptSummaryModal({
  requestId,
  token,
  expenses,
  imposedFee,
  redirectTo = "/dashboard"
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter approved expenses
  const approvedExpenses = expenses.filter(e => e.validation === 'Aprobado');

  // Calculate total approved amount
  // .reduce calculates the sum of local_amount for approved expenses, starting from 0
  const totalApproved = approvedExpenses.reduce((sum, exp) => sum + (exp.local_amount || 0), 0);

  // Calculate reimbursement amount considering requested fee (if any)
  const hasAdvance = imposedFee && imposedFee > 0;
  const reimbursement = hasAdvance ? imposedFee - totalApproved : totalApproved;

  return (
    <div>
      {/* Button to open the modal */}
      <Button
        color="success"
        variant="filled"
        onClick={() => setIsOpen(true)}
      >
        Finalizar Solicitud
      </Button>

      {/* Modal Content */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg space-y-4">
            {/* Title */}
            <div className="card-title">
              <h2>Resumen de Solicitud</h2>
            </div>

            {/* Summary Info */}
            <div className="space-y-3 bg-card-hover p-4 rounded border border-border">
              {/* Imposed Fee */}
              <div>
                <p className="text-sm text-text-secondary">Anticipo Solicitado</p>
                <p className="text-2xl font-semibold text-text-primary">${(imposedFee || 0).toFixed(2)}</p>
              </div>

              {/* Approved Receipts */}
              <div>
                <p className="text-sm text-text-secondary">Comprobantes Aprobados</p>
                <p className="text-2xl font-semibold text-text-primary">${totalApproved.toFixed(2)}</p>
              </div>
              
              {/* Reimbursement Summary */}
              <div className="border-t border-border pt-3">
                <p className="text-sm text-text-secondary">
                  {hasAdvance
                    ? reimbursement < 0
                      ? "Balance a Favor del Usuario"
                      : totalApproved > 0
                        ? "Usuario Debe"
                        : "Reembolso"
                    : "Reembolso a Hacer"
                  }
                </p>
                <p className="text-2xl font-bold text-success">
                  {hasAdvance && totalApproved === 0 ? "Sin Reembolso" : `$${Math.abs(reimbursement).toFixed(2)}`}
                </p>
              </div>
            </div>

            {/* Description */}
            {hasAdvance ? (
              reimbursement < 0 ? (
                <Reminder
                  type="success"
                  text={`El usuario comprobó $${Math.abs(reimbursement).toFixed(2)} más de lo solicitado.`}
                />
              ) : totalApproved > 0 ? (
                <Reminder
                  type="info"
                  text={`Se descontarán $${totalApproved.toFixed(2)} del anticipo. El usuario debe $${reimbursement.toFixed(2)}.`}
                />
              ) : (
                <Reminder
                  type="info"
                  text="No hay comprobantes aprobados con archivos adjuntos. El anticipo ya fue descontado del balance del usuario."
                />
              )
            ) : (
              <Reminder
                type="success"
                text={`Se reembolsará $${reimbursement.toFixed(2)} al usuario.`}
              />
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                color="primary"
                variant="filled"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <UltimateWrapper
                id={Number(requestId)}
                endpoint="/accounts-payable/validate-receipts"
                title="Finalizar Solicitud"
                message="¿Deseas finalizar esta solicitud? Una vez finalizada, no podrás hacer más cambios a los comprobantes."
                modal_type="success"
                color="success"
                variant="filled"
                label="Finalizar Solicitud"
                token={token}
                redirectTo={redirectTo}
                successMessage="Solicitud finalizada correctamente."
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
