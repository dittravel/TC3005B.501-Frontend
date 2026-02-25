/**
 * RequestActions Component
 * 
 * Provides action buttons for authorizing or rejecting travel requests.
 * Displays approve and reject buttons that open a confirmation modal before
 * executing the selected action.
 */

import React, { useState } from "react";
import Button from "@components/Button.tsx";
import Modal from "@components/Modal";

interface RequestProps {
  requestId: string;
  requestStatusId: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function RequestActions({
  requestId,
  onApprove,
  onReject,
}: RequestProps) {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  /**
   * Opens the confirmation modal for the specified action type.
   * @param {string} type - The action type: "approve" or "reject"
   * @returns {void}
   */
  const handleClick = (type: "approve" | "reject") => {
    setAction(type);
    setShowModal(true);
  };

  /**
   * Handles the confirmation of the action and executes the appropriate callback.
   * Closes the modal and resets the action state.
   * @returns {void}
   */
  const confirmAction = () => {
    if (action === "approve") onApprove(requestId);
    if (action === "reject") onReject(requestId);
    setShowModal(false);
    setAction(null);
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-center w-full">
      {/* Authorize Request Button */}
      <Button
        color="success"
        size="medium"
        customSizeClass="w-full"
        onClick={() => handleClick("approve")}
      >
        Autorizar
      </Button>

      {/* Reject Request Button */}
      <Button
        color="warning"
        size="medium"
        customSizeClass="w-full"
        onClick={() => handleClick("reject")}
      >
        Rechazar
      </Button>

      {/* Confirmation Modal */}
      <Modal
        title="¿Estás seguro?"
        message={`¿Seguro que deseas ${action === "approve" ? "autorizar" : "rechazar"} este comprobante?`}
        type={action === "approve" ? "success" : "warning"}
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmAction}
      />
    </div>
  );
}