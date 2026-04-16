/**
 * UploadFiles Component
 * Provides file upload inputs for PDF and XML documents with international trip checkbox.
 * Conditionally displays XML upload field only for domestic trips.
 */

import Checkbox from "@/components/Utils/Checkbox";

interface Props {
  onPdfChange?: (file: File | null) => void;
  onXmlChange?: (file: File | null) => void;
  onXMLParsed?: (cfdiData: any) => void;
  onCFDIValidation?: (result: any) => void;
  isInternational: boolean;
  setIsInternational: (value: boolean) => void;
  token?: string;
}

/**
 * UploadFiles
 * @param {Function} [onPdfChange] - Callback fired when PDF file is selected or cleared
 * @param {Function} [onXmlChange] - Callback fired when XML file is selected or cleared
 * @param {boolean} isInternational - Flag indicating if the trip is international
 * @param {Function} setIsInternational - Updates the international trip flag
 * @returns {React.ReactNode} File upload form with international checkbox
 */
export default function UploadFiles({
  onPdfChange,
  onXmlChange,
  onXMLParsed,
  onCFDIValidation,
  isInternational,
  setIsInternational,
  token,
}: Props) {

  // Handle XML file changes
  // This function is responsible for invoking the onXmlChange callback and then sending
  // the selected XML file to the backend for parsing to extract CFDI data for preview in the UI.
  const handleXmlChange = async (file: File | null) => {
    onXmlChange?.(file);

    // Clear previous validation when file is removed
    if (!file) {
      onCFDIValidation?.(null);
      return;
    }

    try {
      const previewForm = new FormData();
      previewForm.append("xml", file);

      const validateForm = new FormData();
      validateForm.append("xml", file);

      const requests: Promise<Response>[] = [
        fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/files/parse-xml-preview`, {
          method: "POST",
          body: previewForm,
        }),
      ];

      if (token) {
        requests.push(
          fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/cfdi/validate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: validateForm,
          })
        );
      }

      const [previewRes, validateRes] = await Promise.all(requests);

      if (previewRes.ok) {
        const previewData = await previewRes.json();
        onXMLParsed?.(previewData.cfdiData);
      }

      if (validateRes) {
        const validateData = await validateRes.json();
        onCFDIValidation?.(validateData);
      }
    } catch (error) {
      console.error("Error procesando XML:", error);
    }
  };

  return (
    <div className="space-y-4 w-full md:w-1/2">

      <Checkbox
        label="Comprobante internacional"
        name="isInternational"
        checked={isInternational}
        onChange={(e) => setIsInternational(e.target.checked)}
      />

      {/* PDF file upload - always visible */}
      <div>
        <label className="text-sm font-medium block mb-1 text-text-secondary">Subir archivo PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => onPdfChange?.(e.target.files?.[0] || null)}
          className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary/20 file:text-secondary-500 hover:file:bg-secondary/30"
        />
      </div>

      {/* XML file upload - only visible for domestic trips */}
      {!isInternational && (
        <div>
          <label className="text-sm font-medium block mb-1 text-text-secondary">Subir archivo XML</label>
          <input
            type="file"
            accept=".xml"
            onChange={(e) => handleXmlChange(e.target.files?.[0] || null)}
            className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary/20 file:text-secondary-500 hover:file:bg-secondary/30"
          />
        </div>
      )}
    </div>
  );
}
