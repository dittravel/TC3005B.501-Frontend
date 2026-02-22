/**
 * FinisCheck component for finalizing and checking travel requests.
 */

import React from "react";
import Button from "@components/Button";
import { apiRequest } from "@utils/apiClient";

interface Props {
  requestId: number;
  redirectTo?: string;
  token: string;
}

/**
 * Handle the finalization of the request by validating all receipts.
 * @param {number} requestId - The ID of the travel request to finalize
 * @param {string} redirectTo - Optional URL to redirect after finalization (default: "/dashboard")
 * @param {string} token - Authorization token for API requests
 */
export default function FinishRequestButton({ requestId, redirectTo = "/dashboard", token}: Props) {
  const handleClick = async () => {
    try {
      // Submit the request for finalization with all validated receipts
      await apiRequest(`/accounts-payable/validate-receipts/${requestId}`, { 
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` } 
    });

      alert("Solicitud finalizada correctamente");
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Error al finalizar la solicitud", error);
      alert("Error al finalizar la solicitud.");
    }
  };

  return (
    <Button color="success" size="medium" onClick={handleClick}>
      Terminar
    </Button>
  );
}
