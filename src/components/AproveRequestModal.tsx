/**
 * AproveRequestModal Component
 * 
 * Displays a modal dialog for approving travel requests.
 * Handles the confirmation action by sending a PUT request to attend the travel request
 * and displays a success toast notification before redirecting or reloading the page.
 */

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@components/ModalWrapper";
import Toast from '@/components/Toast';

interface Props {
  requestId: number;
  title: string;
  message: string;
  redirection: string;
  modalType: "success" | "warning";
  variant?: "primary" | "secondary"| "filled";
  children: React.ReactNode;
  token: string;
}

export default function AproveRequestModal({
  requestId,
  title,
  message,
  redirection,
  modalType,
  variant,
  children,
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
      const url = `/travel-agent/attend-travel-request/${requestId}`;
      await apiRequest(url, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Comprobante enviado exitosamente.', type: 'success' });
      // Wait for toast to be visible before navigation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to specified URL or reload current page
      if (redirection) {
        window.location.href = redirection;
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error attending travel request:', error);
    }
  }, [requestId, redirection]);

  return (
    <>
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
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}