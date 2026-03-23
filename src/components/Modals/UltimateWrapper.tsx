/**
* UltimateWrapper Component
* Wraps a ModalWrapper with automatic API request handling and success/error feedback.
* Displays a confirmation modal that triggers an API call (typically for user deactivation)
* and shows a toast notification on success before redirecting.
*/

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from "@/components/Utils/Toast";

interface Props {
  user_id: number;
  endpoint: string;
  title: string;
  message: string;
  modal_type: "success" | "warning";
  color?: "success" | "warning" | "primary" | "secondary";
  variant?: "filled" | "border" | "empty";
  label?: string;
  token: string;
  redirectTo?: string;
}

export default function UltimateWrapper({ 
  user_id,
  endpoint,
  title,
  message,
  modal_type = "warning",
  color = "warning",
  variant = "filled",
  label = "Eliminar",
  token,
  redirectTo = "/dashboard"
}: Props) {
  // State for toast notification display
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const handleConfirm = useCallback(async () => {
    try {
      const url = `${endpoint}/${user_id}`;
      await apiRequest(url, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Usuario desactivado exitosamente.', type: 'success' });
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 2000);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setToast({ message: 'Error al desactivar el usuario.', type: 'error' });
    }
  }, [endpoint, redirectTo]);
  
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