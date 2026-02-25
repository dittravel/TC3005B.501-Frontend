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
  token: string;
}

export default function AproveRequestModal({
  receiptId: propReceiptId,
  title,
  message,
  redirection,
  modalType: propModalType,
  variant,
  children,
  token
}: Props) {
  const receiptId = propReceiptId;
  const modalType = propModalType;
  const redirectionUrl = redirection;

  /**
   * Handles confirmation action for approving a receipt.
   * Sends API request and redirects or reloads page on success.
   */
  const handleConfirm = useCallback(async () => {
    try {
      // API call to validate receipt
      const url = `/api/accounts-payable/validate-receipt/${receiptId}`;
      await apiRequest(url, { method: "PUT", data: { approval: 1 }, headers: { Authorization: `Bearer ${token}` } });
      alert(`Comprobante enviado exitosamente.`);

      // Redirect or reload after success
      if (redirectionUrl) {
        window.location.href = redirectionUrl;
      } else {
        window.location.reload();
      }
    } catch (error) {
      
    }
  }, [receiptId, redirectionUrl, token]);

  return (
    <ModalWrapper
      title={title}
      message={message}
      buttonType={modalType}
      modalType={modalType}
      onConfirm={handleConfirm}
      variant={variant}
    >
      {children}
    </ModalWrapper>
  );
}