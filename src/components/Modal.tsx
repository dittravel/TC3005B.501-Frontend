/**
 * Modal component for displaying confirmation dialogs and alerts.
 */

import type { ModalType } from "@config/modal";
import Button from "@components/Button";

interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  show: boolean;
}

export default function Modal({
  title,
  message,
  onClose,
  onConfirm,
  show,
}: ModalProps) {
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
