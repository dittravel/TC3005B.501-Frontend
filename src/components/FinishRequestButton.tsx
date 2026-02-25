/**
 * FinishRequestButton Component
 * 
 * Provides a button to finalize a travel request after all receipts have been validated.
 * Sends a PUT request to validate receipts and displays a confirmation message before redirecting.
 */

import React from "react";
import Button from "@components/Button";
import { apiRequest } from "@utils/apiClient";

interface Props {
  requestId: number;
  redirectTo?: string;
  token: string;
}

export default function FinishRequestButton({ requestId, redirectTo = "/dashboard", token}: Props) {
  /**
   * Handles the click event to finalize a travel request.
   * Sends a validation request to the accounts payable endpoint and redirects on success.
   * @returns {Promise<void>}
   */
  const handleClick = async () => {
    try {
      // Validate all receipts for the travel request before finalization
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
