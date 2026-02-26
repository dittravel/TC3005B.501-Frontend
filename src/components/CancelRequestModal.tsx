/**
 * CancelRequestModal Component
 * 
 * Provides a button that opens a confirmation modal for canceling a travel request.
 * When confirmed, sends a PUT request to cancel the request and reloads the page.
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

  /**
   * Cancels a travel request by sending a PUT request to the API.
   * On success, reloads the page to reflect the changes.
   * @returns {Promise<void>}
   */
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
        style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
        className="hover:scale-110 transform transition-transform duration-200"
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
