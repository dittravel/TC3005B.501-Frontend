/**
 * Modal Component
 * 
 * A reusable modal dialog component that displays a title, message, and action buttons.
 * Supports different modal types with corresponding styles from the modal configuration.
 * Includes a semi-transparent backdrop and keyboard accessibility features.
 */

import { MODAL_STYLES } from "@config/modal";
import type { ModalType } from "@config/modal";

interface ModalProps {
  title: string;
  message: string;
  type?: ModalType;
  onClose: () => void;
  onConfirm?: () => void;
  show: boolean;
}

/**
 * Modal Component
 * Displays a centered modal dialog with title, message, and action buttons.
 * The modal is conditionally rendered based on the `show` prop.
 * @param {ModalProps} props - Modal properties including title, message, callbacks, and display state
 * @returns {JSX.Element | null} Rendered modal or null if not shown
 */
export default function Modal({
  title,
  message,
  type = "confirm",
  onClose,
  onConfirm,
  show,
}: ModalProps) {
  // Only render modal when show is true
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className={`rounded-lg border shadow-lg p-6 w-96 ${MODAL_STYLES[type]} text-black bg-white bg-opacity-50 backdrop-blur-sm`}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-300 rounded hover:bg-neutral-400"
          >
            Cancelar
          </button>
          {/* Confirm Button - Only shown if onConfirm callback is provided */}
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
              }}
              className="px-4 py-2 bg-secondary-300 text-white rounded hover:bg-secondary-400"
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
