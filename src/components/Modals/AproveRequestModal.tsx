/**
 * AproveRequestModal Component
 * 
 * Displays a modal dialog for approving travel requests.
 * Handles the confirmation action by sending a PUT request to attend the travel request
 * and displays a success toast notification before redirecting or reloading the page.
 */

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from '@/components/Utils/Toast';

interface Props {
  request_id: number;
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
  request_id,
  title,
  message,
  redirection,
  modal_type,
  color = "success",
  variant = "filled",
  label = "Aprobar",
  token,
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handles the confirmation action for approving a travel request.
   * Sends a PUT request to the travel agent endpoint to mark the request as attended.
   * On success, displays a toast notification and redirects or reloads the page.
   * @returns {Promise<void>}
   */
  const handleConfirm = useCallback(async () => {
    try {
      const url = `/travel-agent/complete-service-assignment/${request_id}`;
      await apiRequest(url, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Estado actualizado exitosamente.', type: 'success' });
      
      // Wait for toast to be visible before navigation
      setTimeout(() => {
        if (redirection) {
          window.location.href = redirection;
        } else {
          window.location.reload();
        }
      }, 2000);
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setToast({ message: 'Error al actualizar el estado.', type: 'error' });
    }
  }, [request_id, redirection]);

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