/**
* Button to import data from a file
*
* This button is used in the AdminView to allow administrators to import users
* from a file. When clicked, it triggers a hidden file input that accepts files
*/

import { useState } from "react";
import Button from "@/components/Buttons/Button";
import Tag from "@/components/Utils/Tag";
import Reminder from "@/components/Utils/Reminder";

interface Props {
  endpoint: string; // API endpoint to send the file for processing
  token: string;
}

// Structure of the response expected from the backend after importing data
interface ImportResponse {
  success: boolean;
  message: string;
  summary?: {
    users: {
      created: string[];
      updated: string[];
      deactivated: string[];
      skipped: string[];
    };
    departments: {
      created: string[];
      updated: string[];
      skipped: string[];
    };
    costCenters: {
      created: string[];
      updated: string[];
      skipped: string[];
    };
  };
  error?: string;
}

interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Component to display a summary card for import results
 * It shows the number of departments, cost centers, and users created or skipped during the import process.
 * @param {title} - The title of the summary card (e.g., "Departments", "Cost Centers", "Users")
 * @param {children} - The content of the card, which includes the created and skipped items.
 */
function SummaryCard({ title, children }: SummaryCardProps) {
  return (
    <div className="card">
      <div className="card-title">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  items: string[];
  type: 'success' | 'warning';
}

/**
 * Component to display a summary item within the summary card
 * @param {label} - The label for the item (e.g., "Created", "Skipped")
 * @param {items} - An array of strings representing the items that were created or skipped.
 * @param {type} - The type of the item, which determines the color of the tag (success for created, warning for skipped).
 */
function SummaryItem({ label, items, type }: SummaryItemProps) {
  return (
    <div>
      <span className="font-medium">{label}:</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {items.length ? (
          // Map each item to a Tag component with the appropriate type and size
          items.map(item => 
            <Tag key={item} text={item} type={type} size="small" />
          )
        ) : (
          <span className="text-text-secondary">Ninguno</span>
        )}
      </div>
    </div>
  );
}

export default function ImportDataButton({ endpoint, token }: Props) {
  const [showSummary, setShowSummary] = useState(false);
  const [importData, setImportData] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file input
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Reset states before new import
    setError(null);
    setSuccess(null);
    setShowSummary(false);
    setImportData(null);

    // Send the file to the backend
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data: ImportResponse = await response.json();

      if (!response.ok || !data.success) {
        // Mostrar el mensaje de error del backend
        setError("Error al importar el archivo: " + (data.error || data.message));
        setSuccess(null);
        setImportData(null);
        setShowSummary(false);
      } else {
        setImportData(data);
        setShowSummary(true);
        setError(null);
        setSuccess("Archivo importado exitosamente: " + data.message);
      }
    } catch (error) {
      setError(`Error al importar archivo: ${error instanceof Error ? error.message : "Desconocido"}`);
      setSuccess(null);
      setImportData(null);
      setShowSummary(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <Reminder type="warning" text={error} />
      )}
      {/* Acceptance message */}
      {success && (
        <Reminder type="success" text={success} />
      )}
      {/* Import data button */}
      <Button
        variant="filled"
        color="secondary"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
            <path d="M7.25 10.25a.75.75 0 0 0 1.5 0V4.56l2.22 2.22a.75.75 0 1 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 1.06 1.06l2.22-2.22v5.69Z" />
            <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
          </svg>
          Subir archivo JSON
        </div>
      </Button>
      <input
        type="file"
        id="fileInput"
        accept=".json"
        className="hidden"
        onChange={handleFile}
      />
      {/* Summary of import results */}
      {showSummary && importData && importData.summary && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resumen de Importación</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Users */}
            <SummaryCard title="Usuarios">
              <SummaryItem
                label="Creados"
                items={importData.summary.users.created}
                type="success"
              />
              <SummaryItem
                label="Actualizados"
                items={importData.summary.users.updated}
                type="success"
              />
              <SummaryItem
                label="Omitidos"
                items={importData.summary.users.skipped}
                type="warning"
              />
              <SummaryItem
                label="Desactivados"
                items={importData.summary.users.deactivated}
                type="warning"
              />
            </SummaryCard>
            {/* Departments */}
            <SummaryCard title="Departamentos">
              <SummaryItem
                label="Creados"
                items={importData.summary.departments.created}
                type="success"
              />
              <SummaryItem
                label="Actualizados"
                items={importData.summary.departments.updated}
                type="success"
              />
              <SummaryItem
                label="Omitidos"
                items={importData.summary.departments.skipped}
                type="warning"
              />
            </SummaryCard>
            {/* Cost Centers */}
            <SummaryCard title="Centros de Costo">
              <SummaryItem
                label="Creados"
                items={importData.summary.costCenters.created}
                type="success"
              />
              <SummaryItem
                label="Actualizados"
                items={importData.summary.costCenters.updated}
                type="success"
              />
              <SummaryItem
                label="Omitidos"
                items={importData.summary.costCenters.skipped}
                type="warning"
              />
            </SummaryCard>
          </div>
        </div>
      )}
    </div>
  );
}