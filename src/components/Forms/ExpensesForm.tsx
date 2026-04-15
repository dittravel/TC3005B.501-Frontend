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
import Toast from "@/components/Utils/Toast";
import Reminder from "@/components/Utils/Reminder";
import { apiRequest } from "@/utils/apiClient";

interface CurrencyOption {
  currency: string;
  name: string;
  country: string;
  banxico_series_id: string | null;
  frequency: string;
}

interface Props {
  requestId: number;
  routes: any[]; // List of routes associated with the travel request
  token: string;
  receiptToReplace?: string | null;
  receiptToEdit?: any; // Receipt data for editing
}

export default function ExpensesFormClient({ requestId, routes, token, receiptToReplace, receiptToEdit }: Props) {
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
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [disabledButton, setDisabledButton] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [receiptIdToEdit, setReceiptIdToEdit] = useState<number | null>(null);
  const [mxnEquivalent, setMxnEquivalent] = useState("");
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [cfdiValidation, setCfdiValidation] = useState<any>(null);

  // Fetch currency catalog from the backend on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/exchange-rate/catalog`);
        const json = await res.json();
        if (json.success) setCurrencies(json.data);
      } catch {
        // Silently fail — fallback options are shown in the Select
      }
    };
    fetchCurrencies();
  }, []);

  // Initialize form with receipt data if editing
  useEffect(() => {
    if (receiptToEdit) {
      setIsEditing(true);
      setReceiptIdToEdit(receiptToEdit.receipt_id);
      setConcepto(receiptToEdit.receipt_type_name || "Transporte");
      setMonto(receiptToEdit.amount?.toString() || "");
      setCurrency(receiptToEdit.currency || "MXN");
      setRouteId(receiptToEdit.route_id || routes?.[0]?.route_id || null);
      setIsInternational(receiptToEdit.currency !== "MXN");
    }
  }, [receiptToEdit, routes]);

  /**
   * Sets a toast notification that automatically hides after the specified duration.
   * Disables the submit button during the notification display.
   * @param {string} message - The toast message
   * @param {'success' | 'error'} type - The toast type
   * @param {number} duration - How long to display the toast (default: 2000ms)
   * @returns {void}
   */
  const handleSetToast = (message: string, type: 'success' | 'error', duration: number = 2000) => {
    setDisabledButton(true);
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
      setDisabledButton(false);
    }, duration);
  };

  // Fetch MXN equivalent when monto or currency changes
  useEffect(() => {
    const seriesId = currencies.find(c => c.currency === currency)?.banxico_series_id;
    // If no valid currency, monto, or series (e.g. MXN has no series), clear equivalent
    if (!seriesId || !monto || isNaN(parseFloat(monto))) {
      setMxnEquivalent("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/exchange-rate?series=${seriesId}`);
        const json = await res.json();
        if (json.success && json.data?.rate) {
          const equivalent = parseFloat(monto) * json.data.rate;
          // Format of MXN string, example: "≈ $111.50 MXN"
          setMxnEquivalent(`≈ $${equivalent.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`);
        }
      } catch {
        setMxnEquivalent("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [monto, currency, currencies]);

  // Select MXN currency by default for national expenses
  useEffect(() => {
    if (!isInternational) {
      setCurrency("MXN");
    } else {
      setCurrency("USD");
      // Clear XML file and CFDI data
      setXmlFile(null);
      setCfdiData(null);
    }
  }, [isInternational]);

  /**
   * Handles the submission of a travel expense.
   * Validates all required fields and file formats before submitting.
   * For international expenses, creates a default XML file if none is provided.
   * Supports both creating new expenses and editing existing ones.
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      setError(null);
      setSubmitting(true);

      // Validate that a route is selected
      if (!routeId) {
        setError("Por favor, selecciona un destino válido.");
        handleSetToast("Por favor, selecciona un destino válido.", "error");
        setSubmitting(false);
        return;
      }

      // Validate that all required fields are filled with valid data
      // For editing, files are optional. For creation, they are required.
      if (!concepto || !monto || isNaN(parseFloat(monto))) {
        setError("Por favor, completa todos los campos correctamente.");
        handleSetToast("Por favor, completa todos los campos correctamente.", "error");
        setSubmitting(false);
        return;
      }

      // For new expenses, files are required
      if (!isEditing && (!pdfFile || (!isInternational && !xmlFile))) {
        setError("Por favor, adjunta todos los archivos requeridos.");
        handleSetToast("Por favor, adjunta todos los archivos requeridos.", "error");
        setSubmitting(false);
        return;
      }
      
      // Validate PDF file extension if provided
      if (pdfFile && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
        setError("El archivo PDF debe tener extensión .pdf válida.");
        handleSetToast("El archivo PDF debe tener extensión .pdf válida.", "error");
        setSubmitting(false);
        return;
      }
      
      // Validate XML file extension for national expenses
      if (!isInternational && xmlFile && !xmlFile.name.toLowerCase().endsWith('.xml')) {
        setError("El archivo XML debe tener extensión .xml válida.");
        handleSetToast("El archivo XML debe tener extensión .xml válida.", "error");
        setSubmitting(false);
        return;
      }

      if (isEditing && receiptIdToEdit) {
        // Update existing receipt
        await apiRequest(`/applicant/update-receipt/${receiptIdToEdit}`, {
          method: 'PUT',
          data: {
            route_id: routeId,
            receipt_type_name: concepto,
            amount: parseFloat(monto),
            currency: currency
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // If there are new files, upload them
        if (pdfFile || xmlFile) {
          setLastReceiptId(receiptIdToEdit);
        } else {
          // No files to update, just show success
          handleSetToast("Comprobante actualizado exitosamente.", "success");
          await new Promise(resolve => setTimeout(resolve, 1500));
          window.location.href = `/comprobar-solicitud/${requestId}`;
        }
      } else {
        // Create new receipt
        const { receipt_id } = await SubmitTravelExpense({
          requestId,
          routeId,
          concepto,
          monto: parseFloat(monto),
          currency,
          pdfFile: pdfFile!,
          xmlFile: xmlFile || undefined,
          token,
          receiptToReplace,
        });

        // Show success and redirect
        handleSetToast("Comprobante subido exitosamente.", "success");
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = `/comprobar-solicitud/${requestId}`;
      }

    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el comprobante. Intenta nuevamente.';
      setError(errorMessage);
      handleSetToast(errorMessage, "error");
      setSubmitting(false);
    }
  };

  // Handle CFDI data received from XML parsing
  const handleCfdiDataReceived = (data: any) => {
    // Set the parsed CFDI data to state
    setCfdiData(data);

    // Autofill fields
    if (data.total && !monto) {
      setMonto(data.total.toString());
      setCurrency(data.moneda || "MXN");
    }
  };

  const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setRouteId(value);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title font-semibold">
            {isEditing
              ? "Editar Comprobante"
              : receiptToReplace ?
                "Volver a subir Comprobante"
                : "Nuevo Comprobante"}
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
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
            altText={mxnEquivalent}
          />

          <Select
            name="currency"
            label="Moneda"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required={true}
          >
            {currencies.length > 0 ? (
              currencies.map(c => (
                <option key={c.currency} value={c.currency}>
                  {c.currency} — {c.name}
                </option>
              ))
            ) : (
              // Fallback while currencies are loading
              <>
                <option value="MXN">MXN — Mexican Peso</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="JPY">JPY — Japanese Yen</option>
              </>
            )}
          </Select>
        </div>

        <UploadFiles
          onPdfChange={setPdfFile}
          onXmlChange={setXmlFile}
          onXMLParsed={handleCfdiDataReceived}
          onCFDIValidation={setCfdiValidation}
          isInternational={isInternational}
          setIsInternational={setIsInternational}
          token={token}
        />

        {/* CFDI validation result shown as soon as the user picks the XML */}
        {cfdiValidation?.validationResult && (
          <Reminder
            text={
              cfdiValidation.validationResult.valid
                ? "CFDI validado correctamente."
                : "El CFDI no pudo ser validado."
            }
            type={cfdiValidation.validationResult.valid ? "success" : "warning"}
          />
        )}

        {/* Show CFDI data if xml was parsed successfully */}
        {cfdiData && (
          <div className="bg-background/50 border border-border rounded-lg p-4 mt-8">
            <h3 className="font-semibold text-text-primary mb-4">Datos del Comprobante CFDI</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                name="rfcEmisor"
                label="RFC Emisor"
                type="text"
                value={cfdiData.rfcEmisor || ""}
                disabled
              />
              <Input
                name="nombreEmisor"
                label="Nombre Emisor"
                type="text"
                value={cfdiData.nombreEmisor || ""}
                disabled
              />
              <Input
                name="uuid"
                label="UUID"
                type="text"
                value={cfdiData.uuid || ""}
                disabled
              />
              <Input
                name="fecha"
                label="Fecha"
                type="text"
                value={cfdiData.fecha || ""}
                disabled
              />
              <Input
                name="subtotal"
                label="Subtotal"
                type="number"
                value={cfdiData.subtotal || ""}
                disabled
              />
              <Input
                name="impuestos"
                label="Impuestos"
                type="number"
                value={cfdiData.impuestos || ""}
                disabled
              />
              <Input
                name="moneda"
                label="Moneda"
                type="text"
                value={cfdiData.moneda || ""}
                disabled
              />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <a href={`/comprobar-solicitud/${requestId}`} className="md:auto">
          <Button variant="filled" color="primary" className="w-full md:auto" disabled={disabledButton}>
            Cancelar
          </Button>
        </a>
        <div>
          <ModalWrapper
            title={isEditing ? "Editar Comprobante" : "Subir Comprobante"}
            message={isEditing ? "¿Está seguro de que desea guardar los cambios?" : "¿Está seguro de que desea subir este Comprobante?"}
            modal_type="confirm"
            color="success"
            variant="filled"
            onConfirm={handleSubmit}
            disabled={disabledButton}
          >
            {isEditing ? "Guardar cambios" : "Subir Comprobantes"}
          </ModalWrapper>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </div>
  );
}
