/**
 * Receipts List Component
 * 
 * Displays a list of expense receipts/comprobantes with validation status and actions.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import ReceiptActions from '@/components/Actions/ReceiptActions';
import UltimateWrapper from '@/components/Modals/UltimateWrapper';
import type { TagType } from '@/types/card';
import type { a } from 'node_modules/tailwindcss/dist/types-CJYAW1ql.d.mts';

interface Props {
  expenses: any[];
  token: string;
  allReviewed?: boolean;
  requestId: string | number;
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
export default function ReceiptsList({ expenses, token, allReviewed, requestId }: Props) {
  return (
    <section className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">Comprobantes ({expenses.length})</h2>
        {expenses.length > 0 && allReviewed && (
          <UltimateWrapper
            id={Number(requestId)}
            endpoint="/accounts-payable/validate-receipts"
            title="Finalizar Solicitud"
            message="¿Está seguro de que desea finalizar esta solicitud?"
            modal_type="success"
            color="success"
            variant="filled"
            label="Finalizar Solicitud"
            token={token}
            redirectTo="/dashboard"
            successMessage="Solicitud finalizada correctamente."
          />
        )}
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
                        <span className="font-semibold">Monto:</span> ${receipt.amount} {receipt.currency || 'MXN'}
                      </p>
                      <p>
                        <span className="font-semibold">Rubro:</span> {receipt.receipt_type_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {pdf && (
                      <a
                        href={`${apiBaseUrl}/files/receipt-file/${pdf.fileId}`}
                        className="block"
                      >
                        <Button
                          color="secondary"
                          variant="border"
                          size="small"
                          className="w-full flex flex-col items-center justify-center gap-y-1 py-3"
                          title={`Descargar: ${pdf.fileName}`}
                        >
                          <span className="text-xs font-semibold truncate">{pdf.fileName}</span>
                          <span className="text-sm">Descargar PDF</span>
                        </Button>
                      </a>
                    )}

                    {xml && (
                      <a
                        href={`${apiBaseUrl}/files/receipt-file/${xml.fileId}`}
                        className="block"
                      >
                        <Button
                          color="secondary"
                          variant="border"
                          size="small"
                          className="w-full flex flex-col items-center justify-center gap-y-1 py-3"
                          title={`Descargar: ${xml.fileName}`}
                        >
                          <span className="text-sm">Descargar XML</span>
                          <span className="text-xs font-semibold truncate">{xml.fileName}</span>
                        </Button>
                      </a>
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
