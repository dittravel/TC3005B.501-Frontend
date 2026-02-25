/**
 * SubmitTravelExpense Module
 * 
 * Provides functionality for submitting travel expense validations.
 * Maps expense concepts to receipt types and handles the submission and retrieval
 * of expense data from the API.
 */

import { apiRequest } from "@utils/apiClient";

// Maps expense concept names to their corresponding receipt type IDs
const receiptTypeMap: Record<string, number> = {
  "Autobús": 5,
  "Caseta": 4,
  "Comida": 2,
  "Hospedaje": 1,
  "Otro": 7,
  "Transporte": 3,
  "Vuelo": 6,
};

interface SubmitExpenseParams {
  requestId: number;
  concept: string;
  amount: number;
  token: string;
}

/**
 * Submits a travel expense for a specific request and retrieves the updated expense list.
 * Maps the expense concept to a receipt type ID and sends it to the API.
 * @param {SubmitExpenseParams} params - The expense submission parameters
 * @param {number} params.requestId - The travel request ID
 * @param {string} params.concept - The expense concept (e.g., "Transporte", "Hotel")
 * @param {number} params.amount - The expense amount in MXN
 * @param {string} params.token - The authentication token
 * @returns {Promise<{ count: number; lastReceiptId: number | null }>} Object containing the expense count and last receipt ID
 * @throws {Error} If the expense concept is not found in the receipt type map
 */
export async function SubmitTravelExpense({
  requestId,
  concept,
  amount,
  token,
}: SubmitExpenseParams): Promise<{ count: number; lastReceiptId: number | null }> {
  // Get the receipt type ID for the expense concept
  const receiptTypeId = receiptTypeMap[concept];
  if (!receiptTypeId) throw new Error(`Concepto inválido: ${concept}`);

  // Prepare the payload for creating the expense validation
  const payload = {
    receipts: [
      {
        receiptTypeId,
        requestId: requestId,
        amount: amount,
      },
    ],
  };

  // Submit the expense validation to the API
  await apiRequest("/applicant/create-expense-validation", {
    method: "POST",
    data: payload,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Wait briefly for the server to process the creation
  await new Promise((res) => setTimeout(res, 500));

  // Retrieve the updated list of expenses for the request
  const res = await apiRequest(`/accounts-payable/get-expense-validations/${requestId}`, { 
    method: "GET",
    headers: { Authorization: `Bearer ${token}` } 
  });

  // Extract expenses from response and sort by receipt ID (newest first)
  const expenses = res.Expenses ?? [];
  const count = expenses.length;

  expenses.sort((a, b) => b.receiptId - a.receiptId);
  const lastReceiptId = count > 0 ? expenses[0].receiptId : null;

  return { count, lastReceiptId };
}
