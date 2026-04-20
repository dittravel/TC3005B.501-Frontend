/**
 * Receipts List Component
 * 
 * Displays a list of expense receipts/comprobantes with validation status and actions.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import ReceiptActions from '@/components/Actions/ReceiptActions';
import UltimateWrapper from '@/components/Modals/UltimateWrapper';
import ReceiptSummaryModal from '@/components/Modals/ReceiptSummaryModal';
import { formatDate } from '@/utils/dateFormatter';
import type { TagType } from '@/types/card';

interface Props {
  expenses: any[];
  token: string;
  allReviewed?: boolean;
  requestId: string | number;
  requestedFee?: number;
}

const validationColors: Record<string, TagType> = {
  'Aprobado': 'success',
  'Rechazado': 'alert',
  'Pendiente': 'warning',
};

/**
 * Receipts List Component
 * Renders a list of expense receipts with their validation 
 * status and available actions.
 * @param {any[]} expenses - Array of expense receipts to display
 * @param {string} token - Authentication token for API requests
 * @param {boolean} allReviewed - Flag indicating if all receipts have been reviewed
 * @param {string | number} requestId - ID of the associated request
 * @returns {JSX.Element} A section containing the list of receipts and actions
 */
export default function ReceiptsList({ expenses, token, allReviewed, requestId, requestedFee }: Props) {
  return (
    <section className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">Comprobantes ({expenses.length})</h2>
        <div className="flex gap-4">
          <UltimateWrapper
            id={Number(requestId)}
            endpoint="/accounts-payable/validate-receipts"
            title="Devolver Comprobantes"
            message="¿Deseas devolver los comprobantes para corrección? Esto marcará la solicitud como pendiente nuevamente."
            modal_type="success"
            color="secondary"
            variant="filled"
            label="Devolver Comprobantes"
            token={token}
            redirectTo="/dashboard"
            successMessage="Solicitud finalizada correctamente."
          />
          <ReceiptSummaryModal
            requestId={requestId}
            token={token}
            expenses={expenses}
            requestedFee={requestedFee}
            redirectTo="/comprobaciones"
          />
        </div>
      </div>

      {expenses.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            No hay comprobantes de gastos para revisar
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((receipt: any) => {
            const pdf = receipt.fileMap?.pdf;
            const xml = receipt.fileMap?.xml;
            const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL;

            return (
              <Card
                key={receipt.receipt_id}
                tag={{ text: `Comprobante #${receipt.receipt_id}`, type: 'secondary' }}
                status={{
                  text: receipt.validation,
                  type: (validationColors[receipt.validation] || 'default') as TagType
                }}
              >
                <div className="card-content-grid">
                  <div className="space-y-3">
                    <div className="text-sm text-text-primary space-y-1">
                      <p>
                        <span className="font-semibold">Rubro:</span> {receipt.receipt_type_name}
                      </p>
                      <p>
                        <span className="font-semibold">Monto Original:</span> ${receipt.amount} {receipt.currency || 'MXN'}
                      </p>
                      <p>
                        <span className="font-semibold">Monto Local:</span> ${receipt.local_amount || receipt.amount} MXN
                      </p>
                      <p>
                        <span className="font-semibold">Fecha:</span> {formatDate(receipt.submission_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {pdf && pdf.fileId && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex flex-col items-start justify-center gap-1">
                          <p className="text-md font-semibold text-text-primary">PDF</p>
                          <p className="text-xs text-text-primary truncate">{pdf.fileName}</p>
                        </div>
                        <a href={`${apiBaseUrl}/files/receipt-file/${pdf.fileId}`}>
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

                    {xml && xml.fileId && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex flex-col items-start justify-center gap-1">
                          <p className="text-md font-semibold text-text-primary">XML</p>
                          <p className="text-xs text-text-primary truncate">{xml.fileName}</p>
                        </div>
                        <a href={`${apiBaseUrl}/files/receipt-file/${xml.fileId}`}>
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

                    {receipt.validation === 'Pendiente' && (
                      <ReceiptActions
                        receipt_id={receipt.receipt_id}
                        disabled={false}
                        token={token}
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
