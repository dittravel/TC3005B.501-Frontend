/**
 * UltimateWrapper Component
 * Wraps a ModalWrapper with automatic API request handling and success/error feedback.
 * Displays a confirmation modal that triggers an API call (typically for user deactivation)
 * and shows a toast notification on success before redirecting.
 */

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@components/ModalWrapper";
import Toast from "@components/Toast";

interface Props {
  user_id: number;
  endpoint: string;
  title: string;
  message: string;
  modal_type: "success" | "warning";
  children: React.ReactNode;
  token: string;
  redirectTo?: string;
}

/**
 * UltimateWrapper
 * @param {number} user_id - The ID of the user to perform the action on
 * @param {string} endpoint - The API endpoint for the action (without user_id)
 * @param {string} title - Modal title
 * @param {string} message - Modal confirmation message
 * @param {string} modal_type - Modal style type (success or warning)
 * @param {React.ReactNode} children - Button label/content to display
 * @param {string} token - Bearer token for API authentication
 * @param {string} [redirectTo="/dashboard"] - URL to redirect to after success
 * @returns {React.ReactNode} Modal with toast notification system
 */
export default function UltimateWrapper({
  user_id,
  endpoint,
  title,
  message,
  modal_type,
  children,
  token,
  redirectTo = "/dashboard"
}: Props) {
  // State for toast notification display
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handles the modal confirmation action
   * Makes API PUT request to the specified endpoint, displays success toast,
   * and redirects to the specified URL after a 2-second delay
   */
  const handleConfirm = useCallback(async () => {
    try {
      // Construct the full endpoint URL with user_id
      const url = `${endpoint}/${user_id}`;
      await apiRequest(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      // Display success toast notification
      setToast({ message: 'Usuario desactivado exitosamente.', type: 'success' });
      // Wait 2 seconds before redirecting to allow user to see success message
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [endpoint]);

  return (
    <>
      <ModalWrapper
        title={title}
        message={message}
        button_type={modal_type}
        modal_type={modal_type}
        onConfirm={handleConfirm}
      >
        {children}
      </ModalWrapper>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}