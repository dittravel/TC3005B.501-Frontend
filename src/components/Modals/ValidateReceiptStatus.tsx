/**
 * ValidateReceiptStatus Component
 * Confirmation modal wrapper for sending receipt validation/expense validation requests.
 * Makes an API call to validate and send expenses for a travel request,
 * then redirects or reloads the page on success.
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

/**
 * ValidateReceiptStatus
 * @param {number} request_id - The ID of the travel request to validate receipts for
 * @param {string} title - Modal title
 * @param {string} message - Modal confirmation message
 * @param {string} redirection - URL to redirect to after successful validation
 * @param {string} modal_type - Modal style type (success or warning)
 * @param {string} [variant] - Button variant style (primary or secondary)
 * @param {React.ReactNode} children - Button label/content to display
 * @param {string} token - Bearer token for API authentication
 * @returns {React.ReactNode} Confirmation modal for receipt validation
 */
export default function ValidateReceiptStatus({
  request_id,
  title,
  message,
  redirection,
  modal_type,
  color = "success",
  variant = "filled",
  label = "Enviar",
  token,
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  /**
   * Handles the modal confirmation action
   * Makes API PUT request to validate and send expenses,
   * then redirects to specified URL or reloads the page
   */
  const handleConfirm = useCallback(async () => {
    try {
      // Call expense validation endpoint
      const url = `/applicant/send-expense-validation/${request_id}`;
      await apiRequest(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Comprobante enviado exitosamente.', type: 'success' });

      // Redirect or reload page based on redirection parameter
      setTimeout(() => {
        if (redirection) {
          window.location.href = redirection;
        } else {
          window.location.reload();
        }
      }, 2000);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setToast({ message: 'Error al enviar el comprobante.', type: 'error' });
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
        onConfirm={handleConfirm}
        variant={variant}
      >
        {label}
      </ModalWrapper>
    </>
  );
}