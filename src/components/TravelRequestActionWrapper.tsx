/**
 * TravelRequestActionWrapper Component
 * 
 * Wraps an action button with a confirmation modal for authorizing or declining travel requests.
 * Handles API requests and displays success toast notifications before redirecting.
 */

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@components/ModalWrapper";
import Toast from "@components/Toast";

interface Props {
  requestId: number;
  endpoint: string;
  role: number;
  title: string;
  message: string;
  redirection: string;
  modalType: "success" | "warning";
  children: React.ReactNode;
  token: string;
}

export default function TravelRequestActionWrapper({
  requestId,
  endpoint,
  role,
  title,
  message,
  redirection,
  modalType,
  children,
  token,
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handles the confirmation action for travel request authorization or rejection.
   * Sends a PUT request to the appropriate endpoint and displays a success toast
   * before redirecting or reloading the page.
   * @returns {Promise<void>}
   */
  const handleConfirm = useCallback(async () => {
    try {
      const url = `${endpoint}/${requestId}/${role}`;
      await apiRequest(url, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      // Display appropriate success message based on the endpoint action
      if (endpoint.includes("authorize-travel-request")) {
        setToast({ message: 'Solicitud autorizada exitosamente.', type: 'success' });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else if (endpoint.includes("decline-travel-request")) {
        setToast({ message: 'Solicitud rechazada exitosamente.', type: 'success' });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Redirect to specified URL or reload current page
      if (redirection) {
        window.location.href = redirection;
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [requestId, endpoint, redirection, role]);

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