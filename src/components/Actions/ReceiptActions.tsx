/**
 * Receipt Actions Component
 * 
 * Provides action buttons for approving or rejecting travel receipts.
 * Manages the state for displaying confirmation modals and handles API requests
 * to update receipt approval status.
 */

import React, { useState } from "react";
import Modal from "@/components/Modals/Modal";
import ApproveReceiptStatus from "@/components/Modals/AproveReceiptsModal";
import RejectReceiptStatus from "@/components/Modals/RejectReceiptsModal";

interface ReceiptProps {
  receipt_id: number;
  disabled: boolean;
  token: string;
}

/**
 * Receipt Actions Component
 * Renders approve and reject buttons for a receipt, 
 * and handles the logic for confirming actions
 * @param {number} receipt_id - The ID of the receipt to act upon
 * @param {boolean} disabled - Whether the action buttons should be disabled
 * @param {string} token - Authentication token for API requests
 * @returns {JSX.Element} - The rendered component
 */
export default function ReceiptActions({ receipt_id, disabled, token }: ReceiptProps) {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);

  // Handles the confirmation of receipt approval or rejection.
  const confirmAction = async () => {
    const approval = action === "approve" ? "Aprobado" : "Rechazado";

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/accounts-payable/validate-receipt/${receipt_id}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ approval }),
        }
      );

      const data = await res.json();

      // Execute appropriate callback based on action result
      if (res.ok) {
        alert(`Comprobante ${approval.toLowerCase()} exitosamente.`);
      } else {
        alert(data.error || "No se pudo actualizar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setShowModal(false);
      setAction(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      <ApproveReceiptStatus
        receipt_id={receipt_id}
        title="Aprobar comprobante"
        message="¿Está seguro de que deseas aprobar este comprobante?"
        redirection="/dashboard"
        modal_type="success"
        color="success"
        variant="filled"
        label="Aprobar"
        disabled={disabled}
        token={token}
      />

      {/* Reject Receipt Button */}
      <RejectReceiptStatus
        receipt_id={receipt_id}
        title="Rechazar comprobante"
        message="¿Está seguro de que deseas rechazar este comprobante?"
        redirection="/dashboard"
        modal_type="warning"
        color="warning"
        variant="filled"
        label="Rechazar"
        disabled={disabled} 
        token={token}
      />

      {/* Confirmation Modal */}
      <Modal
        title="¿Estás seguro?"
        message={`¿Seguro que deseas ${action === "approve" ? "aprobar" : "rechazar"} este comprobante?`}
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
