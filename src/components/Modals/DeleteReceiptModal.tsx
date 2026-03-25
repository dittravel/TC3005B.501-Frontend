/**
 * DeleteReceiptModal component handles the deletion of receipts.
 */

import { useCallback, useState } from "react";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from '@/components/Utils/Toast';

interface Props {
  receipt_id: number;
  title?: string;
  message?: string;
  color?: "success" | "warning" | "primary" | "secondary";
  variant?: "filled" | "border" | "empty";
  label?: string;
  token: string;
  onSuccess?: () => void;
}

export default function DeleteReceiptModal({
  receipt_id,
  title = "Eliminar Comprobante",
  message = "¿Está seguro de que desea eliminar este comprobante?",
  color = "warning",
  variant = "filled",
  label = "Eliminar",
  token,
  onSuccess
}: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handles confirmation action for deleting a receipt.
   * Sends DELETE request to API and executes callback on success.
   */
  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/applicant/delete-receipt/${receipt_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setToast({ message: 'Comprobante eliminado exitosamente.', type: 'success' });
        
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
        setToast({ message: error.error || 'Error al eliminar el comprobante.', type: 'error' });
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      setToast({ message: 'Error al eliminar el comprobante.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [receipt_id, token, onSuccess]);

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
