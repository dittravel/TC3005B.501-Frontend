/**
 * Expense Receipts List Component
 * 
 * Displays a list of expense receipts uploaded by applicants.
 * Allows viewing receipt details and re-uploading if rejected.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import ValidateReceiptStatus from '@/components/Modals/ValidateReceiptStatus';
import type { TagType } from '@/types/card';

interface Props {
  expenses: any[];
  requestId: string | number;
  token: string;
}

const stateColors: Record<string, TagType> = {
  'Aprobado': 'success',
  'Rechazado': 'alert',
  'Pendiente': 'warning'
};

export default function ExpenseReceiptsList({ expenses, requestId, token }: Props) {
  return (
    <section className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">Comprobantes ({expenses.length})</h2>
        <a href={`/subir-comprobante/${requestId}`} className="w-auto">
          <Button color="secondary" variant="filled" size="medium">
            Agregar Comprobante
          </Button>
        </a>
      </div>

      {expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense: any, index: number) => (
            <Card
              key={expense.receipt_id}
              tag={{ text: `Comprobante #${index + 1}`, type: 'secondary' }}
              status={{ text: expense.validation, type: (stateColors[expense.validation] || 'default') as TagType }}
            >
              <div className="card-content-grid">
                <div className="space-y-2">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">ID:</span> {expense.receipt_id}
                  </p>
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Tipo de gasto:</span> {expense.receipt_type_name}
                  </p>
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Monto:</span> ${expense.amount} {expense.currency || 'MXN'}
                  </p>
                </div>

                {expense.validation === 'Rechazado' && (
                  <div className="flex flex-col gap-2 w-full">
                    <a href={`/resubir-comprobante/${requestId}?replace=${expense.receipt_id}`} className="block">
                      <Button
                        color="warning"
                        variant="border"
                        size="medium"
                        className="w-full"
                      >
                        Volver a subir
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            Aún no has subido comprobantes para esta solicitud
          </p>
        </Card>
      )}

      <div className="flex justify-end mt-8">
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
      </div>
    </section>
  );
}
