/**
 * CancelRequestModal Component
 * 
 * A wrapper that opens a confirmation modal for canceling a travel request.
 * When confirmed, sends a PUT request to cancel the request and reloads the page.
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

export default function CancelRequestModal({ 
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
      await apiRequest(`/applicant/cancel-travel-request/${id}`, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` } 
      });
      setToast({ message: 'Solicitud cancelada exitosamente.', type: 'success' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error("Error inesperado:", err);
      setToast({ message: 'Error al cancelar la solicitud.', type: 'error' });
    }
  }, [id, token]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ModalWrapper
        title="Cancelar Solicitud"
        message="¿Estás seguro de que deseas cancelar esta solicitud?"
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
