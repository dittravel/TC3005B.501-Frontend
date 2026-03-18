/**
 * ModalWrapper Component
 * 
 * A wrapper component that combines a button with a modal dialog.
 * When the button is clicked, it opens the modal with the specified title, message, and styling.
 * The modal can be customized with different types and button variants.
 * 
 */

import { useState } from "react";
import Modal from "@components/Modal";
import { getButtonClasses } from "@type/button";

interface ModalWrapperProps {
  title: string;
  message: string;
  button_type: "success" | "warning" | "primary" | "secondary";
  modal_type: "confirm" | "warning" | "error" | "success";
  variant?: "filled" | "border" | "empty";
  disabled?: boolean;
  show?: boolean;
  buttonClassName?: string;
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
  button_type,
  variant="filled",
  disabled = false,
  show = false,
  buttonClassName = getButtonClasses({ variant: `${variant}`, color: `${button_type}`, size: "medium" }),
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
        <div onClick={() => setIsOpen(true)} className="w-full">
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
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClassName + " cursor-pointer"}
        style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
      >
        {children}
      </button>

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

