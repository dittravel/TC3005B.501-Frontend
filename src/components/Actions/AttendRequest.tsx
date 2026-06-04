/**
 * AttendRequest Component
 * 
 * Allows accounts payable staff to assign a budget (imposed fee) to a travel request.
 * Validates the fee amount and submits it via API, then redirects to dashboard on success.
 */

import { useState, useCallback } from "react";
import { apiRequest } from "@utils/apiClient";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from '@/components/Utils/Toast';
import Button from "@/components/Buttons/Button";
import Input from "@/components/Utils/Input";

interface Props {
  request_id: string;
  token: string;
  currency?: string;
}

export default function AttendRequest({ request_id, token, currency = 'MXN' }: Props) {
  const [imposedFee, setImposedFee] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handles the confirmation action for assigning a budget to a travel request.
   * Validates the imposed fee amount, submits it to the accounts payable endpoint,
   * and redirects to dashboard on success.
   * @returns {Promise<void>}
   */
  const handleConfirm = useCallback(async () => {
    // Allow empty (defaults to 0) or valid positive number
    if (imposedFee && (isNaN(parseFloat(imposedFee)) || parseFloat(imposedFee) < 0)) {
      setErrorMessage("Por favor ingrese un monto válido o déjalo en blanco.");
      return;
    }

    // Clear any previous error messages
    setErrorMessage("");

    try {
      const url = `/accounts-payable/attend-travel-request/${request_id}`;
      const parsedFee = imposedFee ? parseFloat(imposedFee) : 0;
      await apiRequest(url, {
        method: "PUT",
        data: {
          imposed_fee: parsedFee,
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Presupuesto asignado exitosamente.', type: 'success' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al asignar presupuesto:", error);
      setToast({ message: 'Ocurrió un error al enviar la información.', type: 'error' });
    }
  }, [imposedFee, request_id]);

  return (
    <div className="card">
      <div className="card-title">
        <h2 className="text-lg font-semibold text-text-primary">Cotizar Solicitud</h2>
        <p className="text-sm text-text-secondary">Asigna un presupuesto a esta solicitud de viaje.</p>
      </div>

      <Input
        type="number"
        name="imposedFee"
        label="Presupuesto impuesto"
        placeholder={`0.00 ${currency}`}
        min="0"
        value={imposedFee}
        onChange={(e) => setImposedFee(e.target.value)}
        error={errorMessage}
      />

      <div className="flex w-full justify-end mt-6">
        <ModalWrapper
          title="¿Estás seguro de asignar este presupuesto?"
          message="Una vez asignado, la solicitud no podrá ser modificada."
          color="success"
          modal_type="success"
          onConfirm={handleConfirm}
          triggerElement={
            <Button color="success" variant="filled" size="medium">
              Asignar presupuesto
            </Button>
          }
        />
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
