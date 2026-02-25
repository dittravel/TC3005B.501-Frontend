/**
 * UploadFiles Component
 * Provides file upload inputs for PDF and XML documents with international trip checkbox.
 * Conditionally displays XML upload field only for domestic trips.
 */

interface Props {
  onPdfChange?: (file: File | null) => void;
  onXmlChange?: (file: File | null) => void;
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
  isInternational,
  setIsInternational,
}: Props) {
  return (
    <div className="space-y-4">
      {/* International trip checkbox */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isInternational}
          onChange={(e) => setIsInternational(e.target.checked)}
        />
        Es viaje internacional
      </label>

      {/* PDF file upload - always visible */}
      <div>
        <label className="text-sm font-medium block mb-1">Subir archivo PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => onPdfChange?.(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary-100 file:text-primary-500 hover:file:bg-secondary-200"
        />
      </div>

      {/* XML file upload - only visible for domestic trips */}
      {!isInternational && (
        <div>
          <label className="text-sm font-medium block mb-1">Subir archivo XML</label>
          <input
            type="file"
            accept=".xml"
            onChange={(e) => onXmlChange?.(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary-100 file:text-primary-500 hover:file:bg-secondary-200"
          />
        </div>
      )}
    </div>
  );
}
