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

export default function ApproveReceiptStatus({
  receiptId,
  title,
  message,
  redirection,
  modalType,
  variant,
  children,
  disabled = false,
  token
}: Props) {
  const handleConfirm = useCallback(async () => {
    try {
        const url = `/accounts-payable/validate-receipt/${receiptId}`;
      await apiRequest(url, { 
        method: "PUT", 
        data: {"approval": 1},
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Aprobado correctamente`)

      if (redirection) {
        window.location.reload();
      } else {
        window.location.reload();
      }
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