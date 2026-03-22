/**
 * ExpensesForm component for managing travel request expenses and receipts.
 */

import { useState, useEffect } from "react";
import UploadFiles from "@/components/Forms/UploadFiles";
import Button from "@/components/Buttons/Button";
import Input from "@/components/Utils/Input";
import Select from "@/components/Utils/Select";
import { SubmitTravelExpense } from "@/components/Forms/SubmitTravelExpense";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import UploadReceiptFiles from "@/components/Forms/UploadReceiptFiles";

interface Props {
  requestId: number;
  routes: any[]; // List of routes associated with the travel request
  token: string;
  receiptToReplace?: string | null;
}

export default function ExpensesFormClient({ requestId, routes, token, receiptToReplace }: Props) {
  const [concepto, setConcepto] = useState("Transporte");
  const [monto, setMonto] = useState("");
  const [currency, setCurrency] = useState("");
  const [routeId, setRouteId] = useState<number | null>(routes?.[0]?.route_id || null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isInternational, setIsInternational] = useState(false);
  const [lastReceiptId, setLastReceiptId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cfdiData, setCfdiData] = useState<any>(null);
  const [cfdiDataEdited, setCfdiDataEdited] = useState<any>(null);

  // Select MXN currency by default for national expenses
  useEffect(() => {
    isInternational ? setCurrency("USD") : setCurrency("MXN");
  }, [isInternational]);

  /**
   * Handles the submission of a travel expense.
   * Validates all required fields and file formats before submitting.
   * For international expenses, creates a default XML file if none is provided.
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate that a route is selected
      if (!routeId) {
        alert("Por favor, selecciona un destino válido.");
        setSubmitting(false);
        return;
      }

      // Validate that all required fields are filled with valid data
      if (!concepto || !monto || isNaN(parseFloat(monto)) || !pdfFile || (!isInternational && !xmlFile)) {
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
        routeId,
        concepto,
        monto: parseFloat(monto),
        currency,
        token,
      });

      // Store the last receipt ID for file upload
      setLastReceiptId(lastReceiptId);

    } catch (err) {
      setSubmitting(false);
    }
  };

  // Handle CFDI data received from XML parsing
  const handleCfdiDataReceived = (data: any) => {
    // Set the original CFDI data for reference
    setCfdiData(data);
    
    // Create a separate data object for editing
    setCfdiDataEdited(data);

    // Autofill fields
    if (data.total && !monto) {
      setMonto(data.total.toString());
      setCurrency(data.moneda || "MXN");
    }
  };

  // Handles changes to CFDI data fields in the UI
  // This allows the user to edit the parsed CFDI data before submission
  const handleCfdiFieldChange = (field: string, value: string) => {
    // Maintain the original cfdiData for reference and only update edited values
    setCfdiDataEdited((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setRouteId(value);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-5 gap-4 mb-4">
        <Select
          name="routeId"
          label="Destino"
          value={routeId?.toString() || ""}
          onChange={(e) => handleRouteChange(e)}
          required={true}
        >
          <option value="">Selecciona un destino</option>
          {routes?.map((route: any, idx: number) => (
            <option key={idx} value={route.route_id || ""}>
              {route.destination_city}, {route.destination_country} ({route.beginning_date} - {route.ending_date})
            </option>
          ))}
        </Select>

        <Select
          name="concepto"
          label="Concepto"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          required={true}
        >
          <option>Transporte</option>
          <option>Hospedaje</option>
          <option>Comida</option>
          <option>Caseta</option>
          <option>Autobús</option>
          <option>Vuelo</option>
          <option>Otro</option>
        </Select>

        <Input
          name="monto"
          label="Monto"
          type="number"
          placeholder="Ej. 443.50"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required={true}
        />

        <Select
          name="currency"
          label="Moneda"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required={true}
        >
          <option value="MXN">MXN</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="CAD">CAD</option>
        </Select>
      </div>

      <UploadFiles
        onPdfChange={setPdfFile}
        onXmlChange={setXmlFile}
        onXMLParsed={handleCfdiDataReceived}
        isInternational={isInternational}
        setIsInternational={setIsInternational}
      />

      {/* Show CFDI data if xml was parsed successfully */}
      {cfdiData && (
        <div className="bg-background/50 border border-border rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-4">Datos del Comprobante CFDI</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="rfcEmisor"
              label="RFC Emisor"
              type="text"
              value={cfdiDataEdited.rfcEmisor || ""}
              onChange={(e) => handleCfdiFieldChange("rfcEmisor", e.target.value)}
            />
            <Input
              name="nombreEmisor"
              label="Nombre Emisor"
              type="text"
              value={cfdiDataEdited.nombreEmisor || ""}
              onChange={(e) => handleCfdiFieldChange("nombreEmisor", e.target.value)}
            />
            <Input
              name="uuid"
              label="UUID"
              type="text"
              value={cfdiDataEdited.uuid || ""}
              onChange={(e) => handleCfdiFieldChange("uuid", e.target.value)}
            />
            <Input
              name="fecha"
              label="Fecha"
              type="text"
              value={cfdiDataEdited.fecha || ""}
              onChange={(e) => handleCfdiFieldChange("fecha", e.target.value)}
            />
            <Input
              name="subtotal"
              label="Subtotal"
              type="number"
              value={cfdiDataEdited.subtotal || ""}
              onChange={(e) => handleCfdiFieldChange("subtotal", e.target.value)}
            />
            <Input
              name="impuestos"
              label="Impuestos"
              type="number"
              value={cfdiDataEdited.impuestos || ""}
              onChange={(e) => handleCfdiFieldChange("impuestos", e.target.value)}
            />
            <Input
              name="moneda"
              label="Moneda"
              type="text"
              value={cfdiDataEdited.moneda || ""}
              onChange={(e) => handleCfdiFieldChange("moneda", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <a href={`/comprobar-solicitud/${requestId}`} className="w-full sm:w-auto">
          <Button variant="border" color="primary" className="w-full sm:w-auto">
            Cancelar
          </Button>
        </a>
        <ModalWrapper
          title="Subir comprobación"
          message="¿Está seguro de que desea subir este Comprobante?"
          modal_type="confirm"
          color="success"
          variant="filled"
          onConfirm={handleSubmit}
        >
          Subir Comprobantes
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
