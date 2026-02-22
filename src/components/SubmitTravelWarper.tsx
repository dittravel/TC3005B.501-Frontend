/**
 * SubmitTravelWrapper component for handling travel request submission 
 * and expense management.
 */

import { apiRequest } from "@utils/apiClient";

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
  concepto: string;
  monto: number;
  token: string;
}

/**
 * Submits a travel expense/receipt for a specific travel request.
 * @param {number} requestId - The ID of the travel request
 * @param {string} concepto - The expense concept/category (e.g., "Vuelo", "Hotel")
 * @param {number} monto - The expense amount in currency units
 * @param {string} token - Authorization token for API requests
 * @returns {Promise<{count: number, lastReceiptId: number | null}>} Receipt count and last receipt ID
 */
export async function submitTravelExpense({
  requestId,
  concepto,
  monto,
  token,
}: SubmitExpenseParams): Promise<{ count: number; lastReceiptId: number | null }> {
  const receipt_type_id = receiptTypeMap[concepto];
  if (!receipt_type_id) throw new Error(`Concepto inválido: ${concepto}`);

  const payload = {
    receipts: [
      {
        receipt_type_id,
        request_id: requestId,
        amount: monto,
      },
    ],
  };

  await apiRequest("/applicant/create-expense-validation", {
    method: "POST",
    data: payload,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Wait briefly for server-side processing
  await new Promise((res) => setTimeout(res, 500));

  const res = await apiRequest(`/accounts-payable/get-expense-validations/${requestId}`, { 
    method: "GET",
    headers: { Authorization: `Bearer ${token}` } 
  });

  const expenses = res.Expenses ?? [];
  const count = expenses.length;

  expenses.sort((a: any, b: any) => b.receipt_id - a.receipt_id);
  const lastReceiptId = count > 0 ? expenses[0].receipt_id : null;

  return { count, lastReceiptId };
}
