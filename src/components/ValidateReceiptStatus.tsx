/**
 * ValidateReceiptStatus Component
 * Confirmation modal wrapper for sending receipt validation/expense validation requests.
 * Makes an API call to validate and send expenses for a travel request,
 * then redirects or reloads the page on success.
 */

import { useCallback } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@components/ModalWrapper";

interface Props {
  request_id: number;
  title: string;
  message: string;
  redirection: string;
  modal_type: "success" | "warning";
  variant?: "primary" | "secondary";
  children: React.ReactNode;
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
  variant,
  children,
  token,
}: Props) {
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
      alert(`Comprobante enviado exitosamente.`)

      // Redirect or reload page based on redirection parameter
      if (redirection) {
        window.location.href = redirection;
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [request_id, redirection]);

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