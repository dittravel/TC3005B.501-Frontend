/**
 * AproveReceiptsModal component handles the approval of receipts 
 * in the accounts payable module.
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

export default function ApproveReceiptStatus({
  receipt_id,
  title,
  message,
  redirection,
  modal_type,
  color = "success",
  variant = "filled",
  label = "Aprobar",
  disabled = false,
  token
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const handleConfirm = useCallback(async () => {
    try {
      const url = `/accounts-payable/validate-receipt/${receipt_id}`;
      await apiRequest(url, { 
        method: "PUT", 
        data: {"approval": "Aprobado"},
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Comprobante aprobado exitosamente.', type: 'success' });

      setTimeout(() => {
        window.location.reload();
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
        disabled={disabled}
        onConfirm={handleConfirm}
      >
        {label}
      </ModalWrapper>
    </>
  );
}