/**
 * ModalWrapper Component
 * 
 * A wrapper component that combines a button with a modal dialog.
 * When the button is clicked, it opens the modal with the specified title, message, and styling.
 * The modal can be customized with different types and button variants.
 * 
 */

import { useState } from "react";
import Modal from "@/components/Modals/Modal";
import Button from "@/components/Buttons/Button";

interface ModalWrapperProps {
  title: string;
  message: string;
  color: "success" | "warning" | "primary" | "secondary";
  modal_type: "confirm" | "warning" | "error" | "success";
  variant?: "filled" | "border" | "empty" | "link";
  size?: "small" | "medium" | "big";
  disabled?: boolean;
  show?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  triggerElement?: React.ReactNode;
}

/**
 * ModalWrapper Component
 * Renders a button that triggers a modal dialog on click.
 * Handles modal state management and callback execution.
 * @param {ModalWrapperProps} props - Configuration for button and modal behavior
 * @returns {JSX.Element} Button and modal elements
 */
export default function ModalWrapper({
  title,
  message,
  color = "primary",
  variant="filled",
  size = "medium",
  disabled = false,
  show = false,
  onConfirm,
  children,
  triggerElement,
}: ModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(show);

  /**
   * Handles the confirmation action from the modal.
   * Executes the onConfirm callback and closes the modal.
   * @returns {void}
   */
  const confirm = () => {
    onConfirm?.();
    setIsOpen(false);
  };

  if (triggerElement) {
    return (
      <>
        <div onClick={() => setIsOpen(true)} className="inline-block">
          {triggerElement}
        </div>

        <Modal
          title={title}
          message={message}
          show={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={confirm}
        />
      </>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        className="w-full"
      >
        {children}
      </Button>

      {/* Modal Dialog */}
      <Modal
        title={title}
        message={message}
        show={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={confirm}
      />
    </>
  );
}

