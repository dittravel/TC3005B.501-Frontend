/**
 * CancelRefundPolicyModal Component
 * 
 * A wrapper that opens a confirmation modal for canceling a refund policy.
 * When confirmed, sends a PUT request to cancel the policy and reloads the page.
 */

import { useCallback, useState } from "react";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from '@/components/Utils/Toast';
import { apiRequest } from "@utils/apiClient";

interface Props {
  id: number;
  disabled?: boolean;
  token: string;
  color?: "success" | "warning" | "primary" | "secondary";
  variant?: "filled" | "border" | "empty" | "link";
  label?: string;
}

export default function CancelRefundPolicyModal({ 
  id, 
  disabled = false, 
  token,
  color = "warning",
  variant = "border",
  label = "Eliminar"
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCancel = useCallback(async () => {
    try {
        // Check endpoint
      await apiRequest(`/applicant/cancel-refund-policy/${id}`, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` } 
      });
      setToast({ message: 'Política de reembolso cancelada exitosamente.', type: 'success' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error("Error inesperado:", err);
      setToast({ message: 'Error al cancelar la política de reembolso.', type: 'error' });
    }
  }, [id, token]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ModalWrapper
        title="Cancelar Política de Reembolso"
        message="¿Estás seguro de que deseas cancelar esta política de reembolso?"
        color={color}
        modal_type="warning"
        variant={variant}
        disabled={disabled}
        onConfirm={handleCancel}
      >
        {label}
      </ModalWrapper>
    </>
  );
}