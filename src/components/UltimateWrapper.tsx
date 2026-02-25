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
  userId: number;
  endpoint: string;
  title: string;
  message: string;
  modalType: "success" | "warning";
  children: React.ReactNode;
  token: string;
  redirectTo?: string;
}

/**
 * UltimateWrapper
 * @param {number} userId - The ID of the user to perform the action on
 * @param {string} endpoint - The API endpoint for the action (without userId)
 * @param {string} title - Modal title
 * @param {string} message - Modal confirmation message
 * @param {string} modalType - Modal style type (success or warning)
 * @param {React.ReactNode} children - Button label/content to display
 * @param {string} token - Bearer token for API authentication
 * @param {string} [redirectTo="/dashboard"] - URL to redirect to after success
 * @returns {React.ReactNode} Modal with toast notification system
 */
export default function UltimateWrapper({
  userId,
  endpoint,
  title,
  message,
  modalType,
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
      // Construct the full endpoint URL with userId
      const url = `${endpoint}/${userId}`;
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
      // TODO: Implement proper error handling with specific error messages and toast display
    }
  }, [endpoint]);

  return (
    <>
      <ModalWrapper
        title={title}
        message={message}
        buttonType={modalType}
        modalType={modalType}
        onConfirm={handleConfirm}
      >
        {children}
      </ModalWrapper>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}