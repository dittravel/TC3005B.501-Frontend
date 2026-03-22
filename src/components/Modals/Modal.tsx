/**
 * Modal Component
 * 
 * A reusable modal dialog component that displays a title, message, and action buttons.
 * Supports different modal types with corresponding styles from the modal configuration.
 * Includes a semi-transparent backdrop and keyboard accessibility features.
 */

import Button from "@/components/Buttons/Button";

interface ModalProps {
  title: string;
  message: string;
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
  onClose,
  onConfirm,
  show,
}: ModalProps) {
  // Only render modal when show is true
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div
        className={`rounded-lg bg-card border border-border shadow-lg p-6 w-96 text-text-primary`}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="border" color="primary" onClick={onClose}>
            Cancelar
          </Button>
          {onConfirm && (
            <Button variant="filled" color="secondary" onClick={onConfirm}>
              Confirmar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
