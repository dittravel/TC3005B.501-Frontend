/**
 * Receipts List Component
 *
 * Displays a list of expense receipts/comprobantes with validation status and actions.
 */

import { useState } from 'react';
import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import ReceiptActions from '@/components/Actions/ReceiptActions';
import UltimateWrapper from '@/components/Modals/UltimateWrapper';
import ReceiptSummaryModal from '@/components/Modals/ReceiptSummaryModal';
import Input from '@/components/Utils/Input';
import Toast from '@/components/Utils/Toast';
import Reminder from '@/components/Utils/Reminder';
import { formatDate } from '@/utils/dateFormatter';
import { apiRequest } from '@/utils/apiClient';
import type { TagType } from '@/types/card';

interface Props {
  expenses: any[];
  token: string;
  allReviewed?: boolean;
  requestId: string | number;
  imposedFee?: number;
  currency?: string;
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
 * @param {string | number} requestId - ID of the associated request
 * @param {number} imposedFee - Any fee imposed on the request (for summary)
 * @param {string} currency - Currency code for displaying amounts (default: "MXN")
 * @returns {JSX.Element} A section containing the list of receipts and actions
 */
export default function ReceiptsList({
  expenses,
  token,
  requestId,
  imposedFee,
  currency = "MXN"
}: Props) {
  // Editing states for receipts that exceed policy limits
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");

  // Toast state for success/error messages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Handle saving the edited amount for receipts
  const handleSaveAmount = async (receiptId: number) => {
    if (!editAmount || isNaN(parseFloat(editAmount))) {
      setToast({ message: "Ingresa un monto válido", type: 'error' });
      return;
    }

    try {
      // Send request to backend
      await apiRequest(`/accounts-payable/edit-receipt-amount/${receiptId}`, {
        method: "PUT",
        data: { new_amount: parseFloat(editAmount) },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: "Monto actualizado correctamente", type: 'success' });
      setEditingReceiptId(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Error al actualizar", type: 'error' });
    }
  };

  return (
    <section className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">Comprobantes ({expenses.length})</h2>
        <div className="flex gap-4">
          <UltimateWrapper
            id={Number(requestId)}
            endpoint="/accounts-payable/return-receipts"
            title="Devolver Comprobantes"
            message="¿Deseas devolver los comprobantes para corrección? Esto marcará la solicitud como pendiente nuevamente."
            modal_type="success"
            color="secondary"
            variant="filled"
            label="Devolver Comprobantes"
            token={token}
            redirectTo="/dashboard"
            successMessage="Comprobantes devueltos para corrección"
          />
          <ReceiptSummaryModal
            requestId={requestId}
            token={token}
            expenses={expenses}
            imposedFee={imposedFee}
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
                    <div className="text-sm text-text-primary space-y-2">
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

                    {/* Show policy limit warning and edit option */}
                    {receipt.exceeds_policy_limit && (
                      <div>
                        <Reminder
                          text="Este comprobante excede los límites establecidos por la política de reembolso."
                          type="warning"
                        />
                        {editingReceiptId === receipt.receipt_id ? (
                          <div className="space-y-2">
                            <Input
                              name="editAmount"
                              label={`Nuevo Monto (${currency})`}
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              placeholder="0.00"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => setEditingReceiptId(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="small"
                                color="secondary"
                                onClick={() => handleSaveAmount(receipt.receipt_id)}
                              >
                                Guardar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="small"
                            color="warning"
                            onClick={() => {
                              setEditingReceiptId(receipt.receipt_id);
                              setEditAmount((receipt.local_amount || receipt.amount).toString());
                            }}
                          >
                            Editar Monto
                          </Button>
                        )}
                      </div>
                    )}
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
      {toast && <Toast message={toast.message} type={toast.type} />}
    </section>
  );
}
