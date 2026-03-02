/**
 * ExpensesForm component for managing travel request expenses and receipts.
 */

import { useState } from "react";
import UploadFiles from "@components/UploadFiles";
import Button from "@components/Button.tsx";
import { submitTravelExpense } from "@components/SubmitTravelWarper";
import ModalWrapper from "@components/ModalWrapper.tsx";
import UploadReceiptFiles from "@components/UploadReceiptFiles.tsx";

interface Props {
  requestId: number;
  token: string;
  receiptToReplace?: string | null;
}

const labelClass = "block text-sm font-medium text-text-secondary mb-1";
const baseInputClass = "w-full border border-border rounded-md px-3 py-2 bg-card text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";
const buttonContainerClass = "flex flex-col sm:flex-row justify-end gap-3 pt-4";

export default function ExpensesFormClient({ requestId, token, receiptToReplace }: Props) {
  const [concepto, setConcepto] = useState("Transporte");
  const [monto, setMonto] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isInternational, setIsInternational] = useState(false);
  const [lastReceiptId, setLastReceiptId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!concepto || !monto || isNaN(parseFloat(monto)) || !pdfFile || (!isInternational && !xmlFile)) {
        alert("Por favor, completa todos los campos correctamente.");
        setSubmitting(false);
        return;
      }
      
      if (pdfFile && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
        alert("El archivo debe ser un PDF válido.");
        setSubmitting(false);
        return;
      }
      
      if (!isInternational && xmlFile && !xmlFile.name.toLowerCase().endsWith('.xml')) {
        alert("El archivo debe ser un XML válido.");
        setSubmitting(false);
        return;
      }

      let finalXmlFile = xmlFile;
      if (isInternational && !xmlFile) {
        const response = await fetch("/default.xml");
        const blob = await response.blob();
        finalXmlFile = new File([blob], "default.xml", { type: "application/xml" });
        setXmlFile(finalXmlFile);
      }

      const { lastReceiptId } = await submitTravelExpense({
        requestId,
        concepto,
        monto: parseFloat(monto),
        token,
      });

      
      setLastReceiptId(lastReceiptId);

    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className={labelClass}>Concepto</label>
          <select
            name="concepto"
            className={baseInputClass}
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
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
          <label className={labelClass}>Monto</label>
          <input
            type="number"
            step="0.01"
            className={baseInputClass}
            placeholder="Ej. 443.50"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
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

      <div className={buttonContainerClass}>
        <a href={`/comprobar-solicitud/${requestId}`} className="w-full sm:w-auto">
          <Button variant="border" color="warning">
            Cancelar
          </Button>
        </a>
        <ModalWrapper
          title="Subir comprobación"
          message="¿Está seguro de que desea subir este Comprobante?"
          modal_type="confirm"
          button_type="success"
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
