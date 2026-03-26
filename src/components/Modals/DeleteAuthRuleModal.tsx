/**
 * Delete Auth Rule Modal Component
 * 
 * Modal component used to confirm the deletion of an authorization rule. 
 */

import { useCallback, useState } from "react";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from '@/components/Utils/Toast';

interface Props {
  rule_id: number;
  title?: string;
  message?: string;
  color?: "success" | "warning" | "primary" | "secondary";
  variant?: "filled" | "border" | "empty";
  label?: string;
  token: string;
  onSuccess?: () => void;
}

export default function DeleteReceiptModal({
  rule_id,
  title = "Eliminar Regla",
  message = "¿Estás seguro de que deseas eliminar esta regla de autorización?",
  color = "warning",
  variant = "filled",
  label = "Eliminar",
  token,
  onSuccess
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle confirmation action
  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/applicant/delete-auth-rule/${rule_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setToast({ message: 'Regla eliminada exitosamente.', type: 'success' });
        
        // Execute callback or reload after success
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.reload();
          }
        }, 1500);
      } else {
        const error = await response.json();
        setToast({ message: error.error || 'Error al eliminar la regla.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error al eliminar la regla.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [rule_id, token, onSuccess]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ModalWrapper
        title={title}
        message={message}
        color={color}
        modal_type="confirm"
        variant={variant}
        onConfirm={handleConfirm}
        disabled={isDeleting}
      >
        {isDeleting ? 'Eliminando...' : label}
      </ModalWrapper>
    </>
  );
}
