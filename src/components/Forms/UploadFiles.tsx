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
  isInternational: boolean;
  setIsInternational: (value: boolean) => void;
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
  isInternational,
  setIsInternational,
}: Props) {

  // Handle XML file changes
  // This function is responsible for invoking the onXmlChange callback and then sending
  // the selected XML file to the backend for parsing to extract CFDI data for preview in the UI.
  const handleXmlChange = async (file: File | null) => {
    onXmlChange?.(file);

    // If a file is selected, send it to the backend for parsing
    if (file) {
      try {
        // Create a form data object to send the file
        const formData = new FormData();
        formData.append("xml", file);

        // Use the same API endpoint as UploadReceiptFiles to parse the XML and extract CFDI data for preview
        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/files/parse-xml-preview`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        // If the response is successful and contains CFDI data, pass it to the parent component for preview
        if (response.ok) {
          onXMLParsed?.(data.cfdiData);
        }
      } catch (error) {
        console.error("Error parsing XML preview:", error);
      }
    }
  };

  return (
    <div className="space-y-4 w-full md:w-1/3">

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
