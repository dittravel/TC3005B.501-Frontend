/**
 * RejectReceiptsModal Component
 * 
 * Displays a modal for rejecting a receipt. When confirmed, sends a PUT request
 * to mark the receipt as rejected and reloads the page to reflect the changes.
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
  disabled?: boolean;
  token: string;
}

export default function RejectReceiptStatus({
  receipt_id,
  title,
  message,
  redirection,
  modal_type,
  color = "warning",
  variant = "filled",
  label = "Rechazar",
  disabled = false,
  token,
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  /**
   * Handles the confirmation action for rejecting a receipt.
   * Sends a PUT request to set approval status to 0 (rejected) and reloads the page.
   * @returns {Promise<void>}
   */
  const handleConfirm = useCallback(async () => {
    try {
      const url = `/accounts-payable/validate-receipt/${receipt_id}`;
      await apiRequest(url, { 
        method: "PUT", 
        data: { "approval": 0 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Comprobante rechazado exitosamente.', type: 'success' });

      // Reload page to reflect receipt rejection
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setToast({ message: 'Error al rechazar el comprobante.', type: 'error' });
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
        disabled={disabled}
        onConfirm={handleConfirm}
      >
        {label}
      </ModalWrapper>
    </>
  );
}