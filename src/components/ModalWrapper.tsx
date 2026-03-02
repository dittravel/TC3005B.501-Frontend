/**
 * Author: Eduardo Porto Morales
 * rebuild: Jose Antonio González
 * 
 * Description:
 * This component is a wrapper for the Modal component. 
 * It is used to demonstrate how to use the Modal component 
 * in a real application.
 *
 * This is an example of how to use the Modal component in a 
 * real application. You may create a new file in the src/components 
 * directory and copy this code into it.
 **/ 

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
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClassName + " cursor-pointer"}
        style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
      >
        {children}
      </button>

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

