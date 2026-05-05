/**
 * ExpensesForm component for managing travel request expenses and receipts.
 */

import { useState, useEffect } from "react";
import Button from "@/components/Buttons/Button";
import Input from "@/components/Utils/Input";
import Select from "@/components/Utils/Select";
import ModalWrapper from "@/components/Modals/ModalWrapper";
import Toast from "@/components/Utils/Toast";
import Checkbox from "@/components/Utils/Checkbox";
import Reminder from "@/components/Utils/Reminder";
import { apiRequest } from "@/utils/apiClient";

// Mapping of receipt concepts to their corresponding IDs in the backend
const conceptoMap: Record<string, number> = {
  Transporte: 1,
  Hospedaje: 2,
  Comida: 3,
  Caseta: 4,
  Autobús: 5,
  Vuelo: 6,
  Otro: 7,
};

interface CurrencyOption {
  currency: string;
  name: string;
  country: string;
  banxico_series_id: string | null;
  frequency: string;
}

interface Props {
  requestId: number;
  routes: any[];
  token: string;
  mode: "create" | "edit" | "resubmit";
  data?: any;
  societyCurrency?: string;
  currencies?: CurrencyOption[];
  redirectTo: string;
}

/**
 * Expenses Form Component
 * Used to create, edit, or resubmit travel expense receipts
 * @param {number} requestId - ID of the travel request
 * @param {array} routes - Available routes for the request
 * @param {string} token - Authentication token for API requests
 * @param {"create" | "edit" | "resubmit"} mode - Determines form mode: create new, edit existing, or resubmit rejected receipt
 * @param {object} data - Existing receipt data (for edit/resubmit modes)
 * @param {string} societyCurrency - Local currency of the society (default: "MXN")
 * @param {array} currencies - List of available currencies with exchange rate info
 * @returns JSX.Element
 */
export default function ExpensesForm({
  requestId,
  routes,
  token,
  mode,
  data,
  societyCurrency = "MXN",
  currencies = [],
  redirectTo,
}: Props) {
  const [formData, setFormData] = useState({
    routeId: data?.route_id || routes?.[0]?.route_id || (null as number | null),
    concepto: data?.receipt_type_name || "Transporte",
    receiptDate: data ? data.receipt_date.split("T")[0] : "",
    monto: data?.amount ? parseFloat(data.amount).toFixed(2).toString() : "",
    currency: data?.currency || "",
    isInternational: data ? data.currency !== "MXN" : false,
    exch_rate: data?.exch_rate
      ? parseFloat(data.exch_rate).toFixed(2).toString()
      : "1",
  });

  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [cfdiValidation, setCfdiValidation] = useState<any>(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Local currency equivalent state
  const [localAmount, setLocalAmount] = useState<string>("");
  const [apiFailedEquivalent, setApiFailedEquivalent] = useState(false);

  // Calculate local currency equivalent when amount, currency, or receipt date changes
  useEffect(() => {
    if (!formData.monto || isNaN(parseFloat(formData.monto))) {
      setLocalAmount("");
      setApiFailedEquivalent(false);
      return;
    }

    if (formData.currency === societyCurrency) {
      setLocalAmount("");
      setApiFailedEquivalent(false);
      return;
    }

    formData.exch_rate = "1";

    // Timer to only allow API calls every 500ms
    const timer = setTimeout(async () => {
      try {
        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;

        // Fetch exchange rate for a given currency and date (if provided)
        const fetchCurrencyRate = async (curr: string) => {
          // If currency is MXN, the rate is 1. No need to call API.
          if (curr === "MXN") return 1;

          // Find the corresponding Banxico series ID for the currency
          const series = currencies.find(
            (c) => c.currency === curr,
          )?.banxico_series_id;
          if (!series) return null;

          // Construct API URL with date if available
          const url = formData.receiptDate
            ? `${baseUrl}/exchange-rate?series=${series}&date=${formData.receiptDate}`
            : `${baseUrl}/exchange-rate?series=${series}`;

          const res = await fetch(url);
          const json = await res.json();
          return json.success && json.data?.rate
            ? parseFloat(json.data.rate)
            : null;
        };

        const fromRate = await fetchCurrencyRate(formData.currency);
        const toRate = await fetchCurrencyRate(societyCurrency);

        if (fromRate !== null && toRate !== null) {
          // Calculate equivalent amount in local currency
          const finalRate = fromRate / toRate;
          const equivalent = parseFloat(formData.monto) * finalRate;
          setLocalAmount(equivalent.toFixed(2));
          setApiFailedEquivalent(false);
          formData.exch_rate = fromRate.toString();
        } else {
          setLocalAmount("");
          setApiFailedEquivalent(true);
        }
      } catch {
        setLocalAmount("");
        setApiFailedEquivalent(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.monto,
    formData.currency,
    formData.receiptDate,
    formData.exch_rate,
    currencies,
    societyCurrency,
  ]);

  // Reset currency to MXN if switching to national receipt,
  // or set to USD if switching to international
  useEffect(() => {
    if (!formData.isInternational && formData.currency !== "MXN") {
      setFormData((prev) => ({ ...prev, currency: "MXN", exch_rate: "1" }));
    } else if (formData.isInternational && formData.currency === "MXN") {
      setFormData((prev) => ({ ...prev, currency: "USD" }));
      setXmlFile(null);
      setCfdiValidation(null);
    }
  }, [formData.isInternational]);

  // Clear success/error toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle form field changes
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle XML file selection and preview
  const handleXmlPreview = async (file: File) => {
    try {
      const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
      const previewFormData = new FormData();
      previewFormData.append("xml", file);

      const response = await fetch(`${baseUrl}/files/parse-xml-preview`, {
        method: "POST",
        body: previewFormData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        setXmlFile(null);
        if (response.status === 400) {
          throw new Error(
            "El formato del archivo XML es inválido. Por favor, verifica que sea un archivo XML válido.",
          );
        } else if (response.status === 500) {
          throw new Error(
            "El archivo XML no se pudo procesar. Verifica que sea un CFDI válido.",
          );
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.cfdiData) {
        const { fecha, total, moneda } = data.cfdiData;

        // Update form fields with extracted data from XML
        setFormData((prev) => ({
          ...prev,
          receiptDate: fecha.split("T")[0],
          monto: total,
          currency: moneda,
        }));

        setToast({ message: "XML procesado correctamente", type: "success" });

        // Validate CFDI using the extracted XML file
        const validateFormData = new FormData();
        validateFormData.append("xml", file);

        const validateResponse = await fetch(`${baseUrl}/cfdi/validate`, {
          method: "POST",
          body: validateFormData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (validateResponse.ok) {
          const validationData = await validateResponse.json();
          setCfdiValidation(validationData);
        } else {
          setCfdiValidation(null);
        }
      }
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Error al procesar XML",
        type: "error",
      });
    }
  };

  // Handle form submission for creating or updating receipt
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setToast(null);

      // Validation checks
      if (!formData.routeId) {
        setToast({
          message: "Por favor, selecciona un destino válido.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (
        !formData.concepto ||
        !formData.monto ||
        isNaN(parseFloat(formData.monto))
      ) {
        setToast({
          message: "Por favor, completa todos los campos correctamente.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (
        mode === "create" &&
        (!pdfFile || (!formData.isInternational && !xmlFile))
      ) {
        setToast({
          message: "Por favor, adjunta todos los archivos requeridos.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (pdfFile && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
        setToast({
          message: "El archivo PDF debe tener extensión .pdf válida.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (
        !formData.isInternational &&
        xmlFile &&
        !xmlFile.name.toLowerCase().endsWith(".xml")
      ) {
        setToast({
          message: "El archivo XML debe tener extensión .xml válida.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (
        !formData.isInternational &&
        xmlFile &&
        cfdiValidation &&
        !cfdiValidation.validationResult?.valid
      ) {
        setToast({
          message:
            "El CFDI no es válido según el SAT. Por favor, verifica el archivo XML.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (mode === "create") {
        // Create expense with files
        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
        const submitData = new FormData();
        submitData.append("request_id", requestId.toString());
        submitData.append("route_id", formData.routeId.toString());
        submitData.append(
          "receipt_type_id",
          conceptoMap[formData.concepto].toString(),
        );
        submitData.append("amount", parseFloat(formData.monto).toFixed(2));
        submitData.append("currency", formData.currency);
        submitData.append("receipt_date", formData.receiptDate);
        submitData.append(
          "local_amount",
          parseFloat(localAmount || formData.monto).toFixed(2),
        );
        submitData.append(
          "exch_rate",
          parseFloat(formData.exch_rate).toFixed(2),
        );
        if (pdfFile) submitData.append("pdf", pdfFile);
        if (xmlFile) submitData.append("xml", xmlFile);

        const response = await fetch(
          `${baseUrl}/applicant/create-expense-with-files`,
          {
            method: "POST",
            body: submitData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Error: ${response.status}`);
        }
      } else {
        // Update receipt: first update data, then upload files
        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;

        const updateData: any = {
          route_id: formData.routeId,
          receipt_type_name: formData.concepto,
          amount: parseFloat(parseFloat(formData.monto).toFixed(2)),
          currency: formData.currency,
          receipt_date: formData.receiptDate,
          local_amount: parseFloat(
            parseFloat(localAmount || formData.monto).toFixed(2),
          ),
          exch_rate: parseFloat(parseFloat(formData.exch_rate).toFixed(2)),
        };

        // If resubmitting a rejected receipt,
        // reset validation status to "Pendiente"
        if (mode === "resubmit") {
          updateData.validation = "Pendiente";
        }

        await apiRequest(`/applicant/update-receipt/${data.receipt_id}`, {
          method: "PUT",
          data: updateData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (pdfFile || xmlFile) {
          const fileData = new FormData();
          if (pdfFile) fileData.append("pdf", pdfFile);
          if (xmlFile) fileData.append("xml", xmlFile);

          const fileResponse = await fetch(
            `${baseUrl}/files/upload-receipt-files/${data.receipt_id}`,
            {
              method: "POST",
              body: fileData,
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            },
          );

          if (!fileResponse.ok) {
            const error = await fileResponse.json();
            throw new Error(error.error || `Error: ${fileResponse.status}`);
          }
        }
      }

      setToast({
        message: `Comprobante ${mode === "create" ? "creado" : "actualizado"} exitosamente.`,
        type: "success",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.location.href = redirectTo;
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Ocurrió un error al crear el comprobante.",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type of receipt */}
      <div className="grid gap-6 md:grid-cols-2">
        <Checkbox
          label="Comprobante Nacional"
          name="isInternational"
          checked={!formData.isInternational}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isInternational: !e.target.checked,
            }))
          }
        />
        <Checkbox
          label="Comprobante Internacional"
          name="isInternational"
          checked={formData.isInternational}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isInternational: e.target.checked,
            }))
          }
        />
      </div>
      {/* General details */}
      <div className="card">
        <div className="card-title">
          <h2>1. Datos generales</h2>
        </div>
        <div className="space-y-4">
          <Select
            name="routeId"
            label="Destino"
            value={formData.routeId || ""}
            onChange={(e) =>
              handleChange(
                "routeId",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            required={true}
          >
            <option value="">Selecciona un destino</option>
            {routes?.map((route: any, idx: number) => (
              <option key={idx} value={route.route_id || ""}>
                {route.destination_city}, {route.destination_country} (
                {route.beginning_date} - {route.ending_date})
              </option>
            ))}
          </Select>

          <Select
            name="concepto"
            label="Concepto"
            value={formData.concepto}
            onChange={(e) => handleChange("concepto", e.target.value)}
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
        </div>
      </div>
      {/* File uploads */}
      <div className="card">
        <div className="card-title">
          <h2>2. Archivos adjuntos</h2>
        </div>
        <div className="space-y-4">
          {formData.isInternational && (
            <Reminder
              text="¿No encuentras donde subir tu comprobante? Selecciona 'Comprobante Nacional' en la parte superior para subir archivos XML."
              type="info"
            />
          )}
          <Input
            name="pdfFile"
            label="Archivo PDF"
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setPdfFile(e.target.files ? e.target.files[0] : null)
            }
            required={mode === "create"}
          />
          {!formData.isInternational && (
            <div className="space-y-6">
              <Input
                name="xmlFile"
                label="Archivo XML"
                type="file"
                accept=".xml"
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  setXmlFile(file);
                  if (file) {
                    handleXmlPreview(file);
                  } else {
                    setCfdiValidation(null);
                  }
                }}
                required={mode === "create"}
              />
              {cfdiValidation && (
                <Reminder
                  text={
                    cfdiValidation.validationResult?.valid
                      ? `CFDI Válido - Estado: ${cfdiValidation.validationResult.estado}`
                      : `CFDI No válido - Estado: ${cfdiValidation.validationResult?.estado || "No encontrado"}`
                  }
                  type={
                    cfdiValidation.validationResult?.valid ? "success" : "alert"
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Receipt details */}
      <div className="card">
        <div className="card-title">
          <h2>3. Detalles de comprobante</h2>
        </div>
        <Reminder
          text="Asegúrate de que la información coincida exactamente con la del comprobante para evitar rechazos."
          type="info"
        />
        <div className="space-y-4">
          <Input
            name="receiptDate"
            label="Fecha del Comprobante"
            type="date"
            value={formData.receiptDate}
            onChange={(e) => handleChange("receiptDate", e.target.value)}
            required={true}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="monto"
              label="Monto"
              type="number"
              placeholder="Ej. 443.50"
              value={formData.monto}
              onChange={(e) => handleChange("monto", e.target.value)}
              required={true}
              disabled={!formData.receiptDate}
            />
            <Select
              name="currency"
              label="Moneda"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              required={true}
              disabled={!formData.receiptDate}
            >
              {currencies.length > 0 ? (
                currencies.map((c) => (
                  <option key={c.currency} value={c.currency}>
                    {c.currency} - {c.name}
                  </option>
                ))
              ) : (
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
          {(localAmount || apiFailedEquivalent) &&
            formData.monto &&
            formData.currency !== societyCurrency && (
              <div>
                {apiFailedEquivalent && (
                  <Reminder
                    text="No se pudo obtener la conversión automática. Ingresa el monto en moneda local manualmente."
                    type="warning"
                  />
                )}
                <Input
                  name="localAmount"
                  label={`Equivalente en ${societyCurrency}`}
                  type="number"
                  placeholder="Ej. 800.00"
                  value={localAmount}
                  onChange={(e) => setLocalAmount(e.target.value)}
                  disabled={!apiFailedEquivalent}
                  altText={!apiFailedEquivalent ? "Cálculo automático" : ""}
                />
              </div>
            )}
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <a href={`/comprobar-solicitud/${requestId}`} className="md:auto">
          <Button
            variant="filled"
            color="primary"
            className="w-full md:auto"
            disabled={loading}
          >
            Cancelar
          </Button>
        </a>
        <div>
          <ModalWrapper
            title={mode === "edit" ? "Editar Comprobante" : "Subir Comprobante"}
            message="¿Estas seguro de que deseas realizar esta acción?"
            modal_type="confirm"
            color="success"
            variant="filled"
            onConfirm={handleSubmit}
            disabled={loading}
          >
            {mode === "edit" ? "Guardar cambios" : "Subir Comprobante"}
          </ModalWrapper>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
