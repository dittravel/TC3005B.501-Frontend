/**
 * RejectReceiptsModal Component
 * 
 * Displays a modal for rejecting a receipt. When confirmed, sends a PUT request
 * to mark the receipt as rejected and reloads the page to reflect the changes.
 */

import { useCallback } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@components/ModalWrapper";

interface Props {
  receiptId: number;
  title: string;
  message: string;
  redirection: string;
  modalType: "success" | "warning";
  variant?: "primary" | "secondary"| "filled";
  children: React.ReactNode;
  disabled?: boolean;
  token: string;
}

export default function RejectReceiptStatus({
  receiptId,
  title,
  message,
  redirection,
  modalType,
  variant,
  children,
  disabled = false,
  token,
}: Props) {
  /**
   * Handles the confirmation action for rejecting a receipt.
   * Sends a PUT request to set approval status to 0 (rejected) and reloads the page.
   * @returns {Promise<void>}
   */
  const handleConfirm = useCallback(async () => {
    try {
      const url = `/accounts-payable/validate-receipt/${receiptId}`;
      await apiRequest(url, { 
        method: "PUT", 
        data: { "approval": 0 },
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Rechazado correctamente`);

      // Reload page to reflect receipt rejection
      window.location.reload();
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [receiptId, redirection]);

  return (
    <ModalWrapper
      title={title}
      message={message}
      buttonType={modalType}
      modalType={modalType}
      onConfirm={handleConfirm}
      variant={variant}
      disabled={disabled}
    >
      {children}
    </ModalWrapper>
  );
}