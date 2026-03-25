/**
 * TravelRequestActionWrapper Component
 * 
 * Wraps an action button with a confirmation modal for authorizing or declining travel requests.
 * Handles API requests and displays success toast notifications before redirecting.
 */

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Button from "@/components/Buttons/Button";
import Toast from "@/components/Utils/Toast";

interface Props {
  request_id: number;
  user_id: string | undefined;
  endpoint: string;
  role: number;
  title: string;
  message: string;
  redirection: string;
  modal_type: "success" | "warning";
  children: React.ReactNode;
  token: string;
}

export default function TravelRequestActionWrapper({
  request_id,
  user_id,
  endpoint,
  role,
  title,
  message,
  redirection,
  modal_type,
  children,
  token,
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const getButtonColor = (): "success" | "warning" => {
    return endpoint.includes("authorize-travel-request") ? "success" : "warning";
  };

  const handleConfirm = useCallback(async () => {
    try {
      const url = `${endpoint}/${request_id}/${user_id}`;
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
  }, [request_id, user_id, endpoint, redirection, token]);

  return (
    <>
      <ModalWrapper
        title={title}
        message={message}
        color={modal_type}
        modal_type={modal_type}
        onConfirm={handleConfirm}
        triggerElement={
          <Button
            color={getButtonColor()}
            variant="filled"
            size="medium"
            customSizeClass="w-full"
          >
            {children}
          </Button>
        }
      />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}