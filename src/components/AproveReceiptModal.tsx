import { useCallback } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@components/ModalWrapper";

interface Props {
  receipt_id: number;
  title: string;
  message: string;
  redirection: string;
  modal_type: "success" | "warning";
  variant?: "primary" | "secondary"| "filled";
  children: React.ReactNode;
  token: string;
}

export default function AproveRequestModal({
  receipt_id,
  title,
  message,
  redirection,
  modal_type,
  variant,
  children,
  token
}: Props) {

  /**
   * Handles confirmation action for approving a receipt.
   * Sends API request and redirects or reloads page on success.
   */
  const handleConfirm = useCallback(async () => {
    try {
      // API call to validate receipt
      const url = `/api/accounts-payable/validate-receipt/${receipt_id}`;
      await apiRequest(url, { method: "PUT", data: { approval: 1 }, headers: { Authorization: `Bearer ${token}` } });
      alert(`Comprobante enviado exitosamente.`);

      // Redirect or reload after success
      if (redirection) {
        window.location.href = redirection;
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [receipt_id, redirection]);

  return (
    <ModalWrapper
      title={title}
      message={message}
      button_type={modal_type}
      modal_type={modal_type}
      onConfirm={handleConfirm}
      variant={variant}
    >
      {children}
    </ModalWrapper>
  );
}