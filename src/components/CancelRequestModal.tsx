/**
 * CancelRequestModal component for canceling travel requests.
 */

import { useState } from "react";
import Modal from "@components/Modal";
import { apiRequest } from "@utils/apiClient";

interface Props {
  id: number;
  disabled: boolean;
  children: React.ReactNode;
  token: string;
}

export default function CancelRequestModal({ id, disabled = false, children, token }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const cancelRequest = async () => {
    try {
      await apiRequest(`/applicant/cancel-travel-request/${id}`, { method: "PUT" , headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (err) {
      console.error("Error inesperado:", err);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={disabled ? { pointerEvents: "none" } : undefined}
      >
        {children}
      </button>

      <Modal
        title="Cancelar Solicitud"
        message="¿Estás seguro de que deseas cancelar esta solicitud?"
        type="confirm"
        show={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={cancelRequest}
      />
    </>
  );
}
