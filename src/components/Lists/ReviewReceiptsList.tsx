/**
 * Review Receipts List Component
 *
 * Displays a list of expense receipts with validation status and actions.
 */

import { useState } from 'react';
import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import LabeledValue from '@/components/Utils/LabeledValue';
import Tag from '@/components/Utils/Tag';
import ReceiptSummaryModal from '@/components/Modals/ReceiptSummaryModal';
import ApproveReceiptStatus from '@/components/Modals/AproveReceiptsModal';
import RejectReceiptStatus from '@/components/Modals/RejectReceiptsModal';
import UltimateWrapper from '@/components/Modals/UltimateWrapper';
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
 * Review Receipts List Component
 * Renders a list of expense receipts with their validation 
 * status and available actions.
 * @param {any[]} expenses - Array of expense receipts to display
 * @param {string} token - Authentication token for API requests
 * @param {string | number} requestId - ID of the associated request
 * @param {number} imposedFee - Any fee imposed on the request (for summary)
 * @param {string} currency - Currency code for displaying amounts (default: "MXN")
 * @returns {JSX.Element} A section containing the list of receipts and actions
 */
export default function ReviewReceiptsList({
  expenses,
  token,
  requestId,
  imposedFee,
  currency = "MXN"
}: Props) {
  // Editing states for receipts that exceed policy limits
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");

  // State for editing notes
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");

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
        data: { new_amount: parseFloat(parseFloat(editAmount).toFixed(2)) },
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

  // Handle saving notes for a receipt
  const handleSaveNotes = async (receiptId: number, notes: string) => {
    if (notes.length > 500) {
      setToast({ message: "Las notas no pueden exceder los 500 caracteres", type: 'error' });
      return;
    }

    try {
      await apiRequest(`/accounts-payable/edit-receipt-notes/${receiptId}`, {
        method: "PUT",
        data: { notes: notes || null },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setToast({ message: "Notas actualizadas correctamente", type: 'success' });
      setEditingNotesId(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Error al actualizar notas", type: 'error' });
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-20">
                  {/* Receipt Details */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <LabeledValue
                      label="Tipo de gasto"
                      value={receipt.receipt_type_name}
                    />
                    <LabeledValue
                      label="Monto Original"
                      value={`$${parseFloat(receipt.amount).toFixed(2)} ${receipt.currency || 'MXN'}`}
                    />
                    <LabeledValue
                      label="Monto Local"
                      value={`$${parseFloat(receipt.local_amount || receipt.amount).toFixed(2)} MXN`}
                    />
                    <LabeledValue
                      label="Fecha de creación"
                      value={formatDate(receipt.submission_date)}
                    />
                  </div>

                  {/* Receipt Actions */}
                  {receipt.validation === 'Pendiente' && (
                    <div className="flex gap-2 mt-4">
                      <RejectReceiptStatus
                        receipt_id={receipt.receipt_id}
                        title="Rechazar Comprobante"
                        message="¿Deseas rechazar este comprobante?"
                        redirection={`/comprobar-solicitud/${requestId}`}
                        modal_type="warning"
                        color="warning"
                        variant="filled"
                        label="Rechazar"
                        token={token}
                      />
                      <ApproveReceiptStatus
                        receipt_id={receipt.receipt_id}
                        title="Aprobar Comprobante"
                        message="¿Deseas aprobar este comprobante?"
                        redirection={`/comprobar-solicitud/${requestId}`}
                        modal_type="success"
                        color="success"
                        variant="filled"
                        label="Aprobar"
                        token={token}
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  {editingNotesId === receipt.receipt_id ? (
                    <div className="space-y-2">
                      <Input
                        name={`notes-${receipt.receipt_id}`}
                        label="Notas (opcional)"
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Agrega notas para el solicitante"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => setEditingNotesId(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => handleSaveNotes(receipt.receipt_id, editNotes)}
                        >
                          Guardar Notas
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary mb-2">Notas</p>
                        <p className="text-sm text-text-secondary">{receipt.notes || "Sin notas"}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="small"
                          color="secondary"
                          variant="filled"
                          onClick={() => {
                            setEditingNotesId(receipt.receipt_id);
                            setEditNotes(receipt.notes || "");
                          }}
                        >
                          Editar Notas
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                

                {/* Files */}
                <div>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* PDF */}
                    {pdf && pdf.fileId && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex items-center justify-center gap-2">
                          <Tag text="PDF" type="secondary" />
                          <p className="text-xs text-text-primary truncate">{pdf.fileName}</p>
                        </div>
                        <Button
                          color="secondary"
                          variant="border"
                          size="small"
                          href={`${apiBaseUrl}/files/receipt-file/${pdf.fileId}`}
                        >
                          Descargar
                        </Button>
                      </div>
                    )}

                    {/* XML */}
                    {xml && xml.fileId && (
                      <div className="flex w-full bg-card-hover p-2 border border-border rounded-md gap-4 items-center justify-between">
                        <div className="flex items-center justify-center gap-2">
                          <Tag text="XML" type="secondary" />
                          <p className="text-xs text-text-primary truncate">{xml.fileName}</p>
                        </div>
                        <Button
                          color="secondary"
                          variant="border"
                          size="small"
                          href={`${apiBaseUrl}/files/receipt-file/${xml.fileId}`}
                        >
                          Descargar
                        </Button>
                      </div>
                    )}
                  </div>
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
                        <div className="flex gap-2 justify-end w-full">
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
                      <div className="flex justify-end">
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
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </section>
  );
}
