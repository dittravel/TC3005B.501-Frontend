/**
 * Expense Receipts List Component
 * 
 * Displays a list of expense receipts uploaded by applicants.
 * Allows viewing receipt details and re-uploading if rejected.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import ValidateReceiptStatus from '@/components/Modals/ValidateReceiptStatus';
import DeleteReceiptModal from '@/components/Modals/DeleteReceiptModal';
import UltimateWrapper from '@/components/Modals/UltimateWrapper';
import type { TagType } from '@/types/card';
import { useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';

interface Props {
  expenses: any[];
  requestId: string | number;
  token: string;
  deadlineStatus?: any;
}

const stateColors: Record<string, TagType> = {
  'Aprobado': 'success',
  'Rechazado': 'alert',
  'Pendiente': 'warning'
};

/**
 * Expense Receipts List Component
 * Renders a list of expense receipts with options to view, edit, 
 * delete, or re-upload based on their validation status.
 * @param expenses - Array of expense receipts to display
 * @param requestId - ID of the associated request
 * @param token - Authentication token for API requests
 * @param deadlineStatus - Status of the authorization deadline
 * @returns JSX Element
 */
export default function ExpenseReceiptsList({ 
  expenses, 
  requestId,
  token,
  deadlineStatus
}: Props) {
  // Determine if the deadline has passed for uploading receipts
  const expired = (() => {
    // If no deadline status, assume not expired
    if (!deadlineStatus) return false;

    const days = 
      deadlineStatus.days_remaining ??
      null;
    if (days === null) return false; // If no days info, assume not expired
    return days <= 0;
  })();

  const [expensesList, setExpensesList] = useState(expenses);

  /**
   * Handler for successful receipt deletion
   * Removes the deleted expense from the list
   * @param receipt_id - The ID of the deleted receipt
   */
  const handleDeleteSuccess = (receipt_id: number) => {
    setExpensesList(prev => prev.filter(exp => exp.receipt_id !== receipt_id));
  };

  return (
    <section className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">Comprobantes ({expensesList.length})</h2>
        {!expired ? (
          <a href={`/subir-comprobante/${requestId}`} className="w-auto">
            <Button color="secondary" variant="filled" size="medium">
              Agregar Comprobante
            </Button>
          </a>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-alert font-semibold">
              El plazo para subir comprobantes ha expirado.
            </p>
          </div>
        )}
      </div>

      {expensesList.length > 0 ? (
        <div className="space-y-4">
          {expensesList.map((expense: any, index: number) => {
            const hasPdf = expense.pdf_id && expense.pdf_name;
            const hasXml = expense.xml_id && expense.xml_name;
            const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL;

            return (
              <Card
                key={expense.receipt_id}
                tag={{ text: `Comprobante #${expense.receipt_id}`, type: 'secondary' }}
                status={{ text: expense.validation, type: (stateColors[expense.validation] || 'default') as TagType }}
              >
                <div className="card-content-grid">
                  <div className="space-y-2">
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Tipo de gasto:</span> {expense.receipt_type_name}
                    </p>
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Monto:</span> ${expense.amount} {expense.currency || 'MXN'}
                    </p>
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">Fecha de creación:</span> {formatDate(expense.submission_date)}
                    </p>
                  </div>

                  {/* Download and Delete buttons */}
                  <div className="flex flex-col gap-2 w-full">
                    {hasPdf && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex flex-col items-start justify-center gap-1">
                          <p className="text-md font-semibold text-text-primary">PDF</p>
                          <p className="text-xs text-text-primary">{expense.pdf_name}</p>
                        </div>
                        <a href={`${apiBaseUrl}/files/receipt-file/${expense.pdf_id}`}>
                          <Button
                            color="secondary"
                            variant="border"
                            size="small"
                          >
                            Descargar
                          </Button>
                        </a>
                      </div>
                    )}

                    {hasXml && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex flex-col items-start justify-center">
                          <p className="text-md font-semibold text-text-primary">XML</p>
                          <p className="text-xs text-text-primary truncate">{expense.xml_name}</p>
                        </div>
                        <a href={`${apiBaseUrl}/files/receipt-file/${expense.xml_id}`}>
                          <Button
                            color="secondary"
                            variant="border"
                            size="small"
                          >
                            Descargar
                          </Button>
                        </a>
                      </div>
                    )}

                    {expense.validation !== 'Aprobado' && expense.validation !== 'Rechazado' && (
                      <div className="flex gap-2 w-full">
                        <a href={`/editar-comprobante/${expense.receipt_id}/${requestId}`} className="block w-full">
                          <Button
                            color="primary"
                            variant="filled"
                            className="w-full"
                          >
                            Editar
                          </Button>
                        </a>
                        <DeleteReceiptModal
                          receipt_id={expense.receipt_id}
                          token={token}
                          onSuccess={() => handleDeleteSuccess(expense.receipt_id)}
                        />
                      </div>
                    )}

                    {expense.validation === 'Rechazado' && !expired && (
                      <div className="flex flex-col gap-2 w-full">
                        <a href={`/resubir-comprobante/${requestId}?replace=${expense.receipt_id}`} className="block">
                          <Button
                            color="secondary"
                            variant="filled"
                            size="medium"
                            className="w-full"
                          >
                            Volver a subir
                          </Button>
                        </a>
                      </div>
                    )}

                    {expense.validation === 'Rechazado' && expired && (
                      <div className="text-sm text-alert">Plazo de reenvío cerrado</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            Aún no has subido comprobantes para esta solicitud
          </p>
        </Card>
      )}

      {!expired ? (
        <ValidateReceiptStatus
          request_id={Number(requestId)}
          title="Confirmar envío"
          message="¿Está seguro de que desea mandar estos comprobantes?"
          redirection="/dashboard"
          modal_type="success"
          color="success"
          variant="filled"
          label="Enviar a validar"
          token={token}
        />
      ) : (
        <UltimateWrapper
          user_id={Number(requestId)}
          endpoint="/applicant/cancel-travel-request"
          method="PUT"
          title="Cancelar Solicitud"
          message="El plazo para subir comprobantes ha expirado. ¿Desea cancelar esta solicitud?"
          modal_type="warning"
          color="warning"
          variant="filled"
          label="Cancelar Solicitud"
          token={token}
          redirectTo="/comprobar-gastos"
          successMessage="Solicitud cancelada exitosamente."
          errorMessage="Error al cancelar la solicitud."
        />
      )}
    </section>
  );
}
