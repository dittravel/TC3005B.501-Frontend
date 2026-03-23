/**
 * AproveReceiptModal component handles the approval of receipts in 
 * the accounts payable module.
 */

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from '@/components/Utils/Toast';

interface Props {
  receipt_id: number;
  title: string;
  message: string;
  redirection: string;
  modal_type: "success" | "warning";
  color?: "success" | "warning" | "primary" | "secondary";
  variant?: "filled" | "border" | "empty";
  label?: string;
  token: string;
}

export default function AproveRequestModal({
  receipt_id,
  title,
  message,
  redirection,
  modal_type,
  color = "success",
  variant = "filled",
  label = "Aprobar",
  token
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handles confirmation action for approving a receipt.
   * Sends API request and redirects or reloads page on success.
   */
  const handleConfirm = useCallback(async () => {
    try {
      // API call to validate receipt
      const url = `/api/accounts-payable/validate-receipt/${receipt_id}`;
      await apiRequest(url, { method: "PUT", data: { approval: 1 }, headers: { Authorization: `Bearer ${token}` } });
      setToast({ message: 'Comprobante aprobado exitosamente.', type: 'success' });

      // Redirect or reload after success
      setTimeout(() => {
        if (redirection) {
          window.location.href = redirection;
        } else {
          window.location.reload();
        }
      }, 2000);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setToast({ message: 'Error al aprobar el comprobante.', type: 'error' });
    }
  }, [receipt_id, redirection]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ModalWrapper
        title={title}
        message={message}
        color={color}
        modal_type={modal_type}
        variant={variant}
        onConfirm={handleConfirm}
      >
        {label}
      </ModalWrapper>
    </>
  );
}