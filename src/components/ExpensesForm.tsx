/**
 * ExpensesForm Component
 * 
 * Allows users to submit travel expenses with detailed information including
 * the expense concept, amount, and supporting documents (PDF and XML files).
 * Supports both national and international expenses with different requirements.
 */

import React, { useState } from "react";
import UploadFiles from "@components/UploadFiles";
import Button from "@components/Button.tsx";
import { SubmitTravelExpense } from "@/components/SubmitTravelExpense";
import ModalWrapper from "@components/ModalWrapper.tsx";
import UploadReceiptFiles from "@components/UploadReceiptFiles.tsx";

interface Props {
  requestId: number;
  token: string;
  receiptToReplace?: string | null;
}

export default function ExpensesForm({ requestId, token, receiptToReplace }: Props) {
  const [concept, setConcept] = useState("Transporte");
  const [amount, setAmount] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isInternational, setIsInternational] = useState(false);
  const [lastReceiptId, setLastReceiptId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handles the submission of a travel expense.
   * Validates all required fields and file formats before submitting.
   * For international expenses, creates a default XML file if none is provided.
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate that all required fields are filled with valid data
      if (!concept || !amount || isNaN(parseFloat(amount)) || !pdfFile || (!isInternational && !xmlFile)) {
        alert("Por favor, completa todos los campos correctamente.");
        setSubmitting(false);
        return;
      }
      
      // Validate PDF file extension
      if (pdfFile && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
        alert("El archivo debe ser un PDF válido.");
        setSubmitting(false);
        return;
      }
      
      // Validate XML file extension for national expenses
      if (!isInternational && xmlFile && !xmlFile.name.toLowerCase().endsWith('.xml')) {
        alert("El archivo debe ser un XML válido.");
        setSubmitting(false);
        return;
      }

      // For international expenses, use default XML if none provided
      let finalXmlFile = xmlFile;
      if (isInternational && !xmlFile) {
        const response = await fetch("/default.xml");
        const blob = await response.blob();
        finalXmlFile = new File([blob], "default.xml", { type: "application/xml" });
        setXmlFile(finalXmlFile);
      }

      const { lastReceiptId } = await SubmitTravelExpense({
        requestId,
        concept,
        amount: parseFloat(amount),
        token,
      });

      // Store the last receipt ID for file upload
      setLastReceiptId(lastReceiptId);

    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">Concepto</label>
          <select
            name="concept"
            className="w-full border rounded-md px-3 py-2"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          >
            <option>Transporte</option>
            <option>Hospedaje</option>
            <option>Comida</option>
            <option>Caseta</option>
            <option>Autobús</option>
            <option>Vuelo</option>
            <option>Otro</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Monto</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Ej. 443.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <UploadFiles
        onPdfChange={setPdfFile}
        onXmlChange={setXmlFile}
        isInternational={isInternational}
        setIsInternational={setIsInternational}
      />

      <div className="flex justify-end gap-4 pt-4">
        <a href={`/comprobar-solicitud/${requestId}`}>
          <Button type="button" variant="border" color="warning">
            Cancelar
          </Button>
        </a>
        <ModalWrapper
          title="Subir comprobación"
          message="¿Está seguro de que desea subir este Comprobante?"
          modalType="confirm"
          buttonType="primary"
          variant="filled"
          onConfirm={handleSubmit}
        >
          Subir Comprobante
        </ModalWrapper>
      </div>

      {lastReceiptId !== null && (
        <UploadReceiptFiles
          token={token}
          receiptId={lastReceiptId}
          pdfFile={pdfFile}
          xmlFile={xmlFile}
          receiptToReplace={receiptToReplace}
          onDone={() => {
            alert("Subidos correctamente");
            window.location.href = `/comprobar-solicitud/${requestId}`;
          }}
          onError={(err) => {
            console.error("Error al subir archivos:", err);
            setSubmitting(false);
          }}
        />
      )}
    </div>
  );
}
