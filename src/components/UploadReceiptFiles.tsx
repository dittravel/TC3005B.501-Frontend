/**
 * UploadReceiptFiles Component
 * Handles file uploads for receipts (PDF and XML) to the backend API.
 * Automatically triggers upload when files are provided and optionally deletes
 * a previous receipt if replaceReceipt ID is specified.
 * This is a headless component that returns null and manages side effects via callbacks.
 */

import { useEffect } from "react";

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface Props {
  receiptId: number;
  pdfFile: File | null;
  xmlFile: File | null;
  token: string;
  onDone: () => void;
  onError: (err: Error) => void;
  receiptToReplace?: string | null;
}

/**
 * UploadReceiptFiles
 * @param {number} receiptId - The ID of the receipt to upload files for
 * @param {File | null} pdfFile - The PDF file to upload (optional)
 * @param {File | null} xmlFile - The XML file to upload (optional)
 * @param {string} token - Bearer token for API authentication
 * @param {Function} onDone - Callback invoked when upload completes successfully
 * @param {Function} onError - Callback invoked if upload fails with error details
 * @param {string | null} [receiptToReplace] - Optional ID of a previous receipt to delete
 * @returns {null} Headless component with no visual output
 */
export default function UploadReceiptFiles({
  receiptId,
  pdfFile,
  xmlFile,
  token,
  receiptToReplace,
  onDone,
  onError,
}: Props) {
  useEffect(() => {
    // Skip if no files provided
    if (!pdfFile && !xmlFile) return;

    /**
     * Uploads receipt files to the backend API and optionally deletes a previous receipt
     */
    const upload = async () => {
      try {
        // Prepare FormData with files
        const formData = new FormData();
        if (pdfFile) formData.append("pdf", pdfFile);
        if (xmlFile) formData.append("xml", xmlFile);

        // Upload files to backend
        const response = await fetch(`${API_BASE_URL}/files/upload-receipt-files/${receiptId}`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Error al subir los archivos");

        // Delete previous receipt if specified
        if (receiptToReplace) {
          try {
            const delRes = await fetch(`${API_BASE_URL}/applicant/delete-receipt/${receiptToReplace}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!delRes.ok) {
              const text = await delRes.text();
              console.error("Error en DELETE:", delRes.status, text);
            } else {
              console.log("Recibo actualizado correctamente.");
            }
          } catch (delErr) {
            console.error("Error eliminando comprobante anterior:", delErr);
          }
        }

        // Notify parent component of successful upload
        onDone();
      } catch (err) {
        // Notify parent component of upload failure
        onError(err as Error);
      }
    };

    upload();
  }, [receiptId, pdfFile, xmlFile, receiptToReplace]);

  // Headless component - no visual output
  return null;
}
