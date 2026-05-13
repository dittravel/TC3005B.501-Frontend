/**
* UltimateWrapper Component
* Wraps a ModalWrapper with automatic API request handling and success/error feedback.
* Displays a confirmation modal that triggers an API call and shows a toast notification on success before redirecting.
*/

import { useCallback, useState } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from "@/components/Utils/Toast";

interface Props {
  id: string | number;
  endpoint: string;
  title: string;
  message: string;
  modal_type: "success" | "warning";
  color?: "success" | "warning" | "primary" | "secondary";
  variant?: "filled" | "border" | "empty";
  size?: "small" | "medium" | "big";
  label?: string;
  token: string;
  method?: "PUT" | "DELETE";
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  redirectTo?: string;
}

/**
 * Ultimate Wrapper Component
 * Displays a button that triggers a confirmation modal. 
 * On confirmation, it makes an API request and shows a toast notification based on the result.
 * @param {Props} props - Configuration for the modal and API request
 * @returns {JSX.Element} Modal and toast components
 */
export default function UltimateWrapper({
  id,
  endpoint,
  title,
  message,
  modal_type = "warning",
  color = "warning",
  variant = "filled",
  size = "medium",
  label = "Confirmar",
  method = "PUT",
  successMessage = "Operación realizada exitosamente.",
  errorMessage = "Error al realizar la operación.",
  token,
  className,
  redirectTo = "/dashboard"
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${endpoint}/${id}`;
      await apiRequest(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: successMessage, type: 'success' });
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 2000);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setToast({ message: errorMessage, type: 'error' });
      setLoading(false);
    }
  }, [endpoint, redirectTo, id]);
  
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ModalWrapper
        title={title}
        message={message}
        color={color}
        modal_type={modal_type}
        variant={variant}
        size={size}
        onConfirm={handleConfirm}
        disabled={loading}
        className={className}
      >
        {loading ? "Procesando..." : label}
      </ModalWrapper>
    </>
  );
}