/**
 * Applicant Receipts List Component
 * 
 * Displays a list of expense receipts uploaded by applicants.
 * Allows viewing receipt details and re-uploading if rejected.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import UltimateWrapper from '@/components/Modals/UltimateWrapper';
import LabeledValue from '@/components/Utils/LabeledValue';
import Tag from '@/components/Utils/Tag';
import { FileDownload } from "@mui/icons-material";
import type { TagType } from '@/types/card';
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
 * Applicant Receipts List Component
 * Renders a list of expense receipts with options to view, edit, 
 * delete, or re-upload based on their validation status.
 * @param expenses - Array of expense receipts to display
 * @param requestId - ID of the associated request
 * @param token - Authentication token for API requests
 * @param deadlineStatus - Status of the authorization deadline
 * @returns JSX Element
 */
export default function ApplicantReceiptsList({
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

  return (
    <section className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">Comprobantes ({expenses.length})</h2>
        {!expired ? (
          <div className="flex gap-4">
            {expenses.length > 0 && !expenses.some((e: any) => e.validation === 'Rechazado') && (
              <UltimateWrapper
                id={Number(requestId)}
                endpoint="/applicant/send-expense-validation"
                title="Confirmar envío"
                message="¿Está seguro de que deseas mandar estos comprobantes?"
                redirectTo="/dashboard"
                modal_type="success"
                color="success"
                variant="filled"
                label="Enviar a validar"
                token={token}
                successMessage="Comprobantes enviados exitosamente."
              />
            )}
            <a href={`/subir-comprobante/${requestId}`} className="w-auto">
              <Button color="secondary" variant="filled" size="medium">
                Agregar Comprobante
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-alert font-semibold">
              El plazo para subir comprobantes ha expirado.
            </p>
          </div>
        )}
      </div>

      {expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense: any) => {
            const hasPdf = expense.pdf_id && expense.pdf_name;
            const hasXml = expense.xml_id && expense.xml_name;
            const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL;

            return (
              <Card
                key={expense.receipt_id}
                tag={{ text: `Comprobante #${expense.receipt_id}`, type: 'secondary' }}
                status={{ text: expense.validation, type: (stateColors[expense.validation] || 'default') as TagType }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-20">
                  {/* Expense Details */}
                  <div className="flex fex-col md:flex-row items-center justify-between gap-8">
                    <LabeledValue
                      label="Tipo de gasto"
                      value={expense.receipt_type_name}
                    />
                    <LabeledValue
                      label="Monto Original"
                      value={`$${parseFloat(expense.amount).toFixed(2)} ${expense.currency || 'MXN'}`}
                    />
                    <LabeledValue
                      label="Monto Local"
                      value={`$${parseFloat(expense.local_amount || expense.amount).toFixed(2)} MXN`}
                    />
                    <LabeledValue
                      label="Fecha de creación"
                      value={formatDate(expense.submission_date)}
                    />
                  </div>

                  {/* Action Buttons */}
                  {expense.validation === 'Pendiente' && (
                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        variant="filled"
                        href={`/editar-comprobante/${expense.receipt_id}/${requestId}`}
                      >
                        Editar
                      </Button>
                      <UltimateWrapper
                        id={expense.receipt_id}
                        endpoint="/applicant/delete-receipt"
                        title="Eliminar Comprobante"
                        message="¿Está seguro de que desea eliminar este comprobante?"
                        modal_type="warning"
                        color="warning"
                        variant="filled"
                        label="Eliminar"
                        method="DELETE"
                        successMessage="Comprobante eliminado exitosamente."
                        token={token}
                        redirectTo={`/comprobar-solicitud/${requestId}`}
                      />
                    </div>
                  )}

                  {expense.validation === 'Rechazado' && !expired && (
                    <div className="flex flex-col gap-2">
                      <Button
                        color="secondary"
                        variant="filled"
                        size="medium"
                        href={`/resubir-comprobante/${requestId}?replace=${expense.receipt_id}`}
                      >
                        Volver a subir
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Files */}
                <div>
                  {/* Expired Notice */}
                  {expense.validation === 'Rechazado' && expired && (
                    <div className="text-sm text-alert">Plazo de reenvío cerrado</div>
                  )}

                  {/* PDF */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {hasPdf && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex items-center justify-center gap-2">
                          <Tag text="PDF" type="secondary" />
                          <p className="text-xs text-text-primary truncate">{expense.pdf_name}</p>
                        </div>
                        <Button
                          color="secondary"
                          variant="border"
                          size="small"
                          href={`${apiBaseUrl}/files/receipt-file/${expense.pdf_id}`}
                        >
                          Descargar
                        </Button>
                      </div>
                    )}

                    {hasXml && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex items-center justify-center gap-2">
                          <Tag text="XML" type="secondary" />
                          <p className="text-xs text-text-primary truncate">{expense.xml_name}</p>
                        </div>
                        <Button
                          color="secondary"
                          variant="border"
                          size="small"
                          href={`${apiBaseUrl}/files/receipt-file/${expense.xml_id}`}
                        >
                          Descargar
                        </Button>
                      </div>
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
    </section>
  );
}
