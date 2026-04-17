/**
 * SubmitTravelExpense Module
 * 
 * Creates a receipt with XML/PDF files and expense details in a single request
 */

import { apiRequest } from "@utils/apiClient";

// Maps expense concepto names to their corresponding receipt type IDs
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
  routeId: number;
  concepto: string;
  monto: number;
  currency: string;
  receiptDate?: string | null;
  pdfFile: File;
  xmlFile?: File | null;
  token: string;
  receiptToReplace?: string | null;
}

/**
 * Submits a travel expense for a specific request and retrieves the updated expense list.
 * Maps the expense concept to a receipt type ID and sends it to the API.
 * If receiptToReplace is provided, deletes the old receipt and resets the request status to allow resubmission.
 * @param {SubmitExpenseParams} params - The expense submission parameters
 * @param {number} params.requestId - The travel request ID
 * @param {number} params.routeId - The route ID associated with the expense
 * @param {string} params.concepto - The expense concepto (e.g., "Transporte", "Hotel")
 * @param {number} params.monto - The expense amount in MXN
 * @param {string} params.currency - The currency code (e.g., "MXN")
 * @param {File} params.pdfFile - The PDF file of the receipt
 * @param {File | null} [params.xmlFile] - The XML file of the receipt (optional)
 * @param {string} params.token - The authentication token
 * @param {string | null} [params.receiptToReplace] - The ID of a previous receipt to delete when resubmitting
 * @returns {Promise<{ receipt_id: number; count: number; cfdiData: any }>} Receipt id and expense count
 * @throws {Error} If the expense concepto is not found in the receipt type map
 */
export async function SubmitTravelExpense({
  requestId,
  routeId,
  concepto,
  monto,
  currency,
  receiptDate,
  pdfFile,
  xmlFile,
  token,
  receiptToReplace,
}: SubmitExpenseParams): Promise<{ receipt_id: number; count: number; cfdiData: any }> {
  // Get the receipt type ID for the expense concepto
  const receipt_type_id = receiptTypeMap[concepto];
  if (!receipt_type_id) throw new Error(`Concepto inválido: ${concepto}`);

  // Create FormData for file upload
  const formData = new FormData();
  
  // Add files
  formData.append("pdf", pdfFile);
  if (xmlFile) formData.append("xml", xmlFile);

  // Add receipt details
  formData.append("receipt_type_id", receipt_type_id.toString());
  formData.append("request_id", requestId.toString());
  formData.append("route_id", routeId.toString());
  formData.append("amount", monto.toString());
  formData.append("currency", currency);
  if (receiptDate) formData.append("receipt_date", receiptDate);

  const uploadRes = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/applicant/create-expense-with-files`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  // Parse the response
  if (!uploadRes.ok) {
    const contentType = uploadRes.headers.get('content-type');
    let errorData;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        errorData = await uploadRes.json();
      } catch {
        errorData = { error: uploadRes.statusText };
      }
    } else {
      const text = await uploadRes.text();
      errorData = { error: text || uploadRes.statusText };
    }
    
    throw new Error(errorData.error || `Upload failed with status ${uploadRes.status}`);
  }

  const uploadData = await uploadRes.json();

  // Wait for the server to process
  await new Promise((res) => setTimeout(res, 500));

  // If replacing a previous receipt, delete it
  if (receiptToReplace) {
    try {
      // Delete the previous receipt
      await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/applicant/delete-receipt/${receiptToReplace}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error replacing receipt:", err);
      // Don't throw - the new receipt was uploaded successfully
    }
  }

  // Get the updated list of expenses for the request
  const listRes = await apiRequest(`/accounts-payable/get-expense-validations/${requestId}`, { 
    method: "GET",
    headers: { Authorization: `Bearer ${token}` } 
  });

  // Extract expenses from response and count them
  const expenses = listRes.Expenses ?? [];
  const count = expenses.length;

  return {
    receipt_id: uploadData.receipt_id,
    count,
    cfdiData: uploadData.cfdiData
  };
}
