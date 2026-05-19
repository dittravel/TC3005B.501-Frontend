/**
* Button to import data from a file
*
* This button is used in the AdminView to allow administrators to import users
* from a file. When clicked, it triggers a hidden file input that accepts files
*/

import { useState, useRef } from "react";
import Tag from "@/components/Utils/Tag";
import Reminder from "@/components/Utils/Reminder";
import ImportPreview from "@/components/Modals/ImportPreview";
import Icon from "@/components/Utils/Icon";

// Interfaces for the component props and data structures used in the import process

// Props for the ImportDataButton component
interface Props {
  endpoint: string;
  token: string;
}

// Interface for the response received after importing data
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

// Raw data structures for employees, departments, and cost centers as received from the preview endpoint
interface EmpleadoRaw {
  NoEmpleado: string;
  Nombre: string;
  Usuario: string;
  Email: string;
  JefeInmediato: string | null;
  Proveedor: number;
  CeCo: number;
  Departamento: number;
  Status: string;
  FechaAlta: string;
  FechaCambio: string;
  Rol?: string;
}

interface DepartamentoRaw {
  Clave: number;
  Descripcion: string;
  CeCo: number;
}

interface CeCoRaw {
  Clave: number;
  Descripcion: string;
}

// Interface for the parsed import data that will be used in the preview
interface ParsedImportData {
  Empleados: EmpleadoRaw[];
  Departamentos: DepartamentoRaw[];
  CeCo: CeCoRaw[];
}

// Props for the SummaryCard component
interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
}

interface SummaryItemProps {
  label: string;
  items: string[];
  type: 'success' | 'warning';
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

/**
 * Import Data Button Component
 * This component allows administrators to import data from a file.
 * It handles file selection, previewing the data, and displaying a summary of the import results.
 * @param {endpoint} - The API endpoint to which the file will be uploaded for import.
 * @param {token} - The authentication token to be included in the request headers.
 */
export default function ImportDataButton({ endpoint, token }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States to manage the import process
  const [showSummary, setShowSummary] = useState(false);
  const [importData, setImportData] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Handler for file selection and processing
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Send the file to the preview endpoint before importing
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint.replace('/import-data', '/preview-import')}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      setShowSummary(false);

      if (!response.ok || !result.success) {
        setError(result.error || "Error al procesar el archivo");
        setParsedData(null);
        setShowPreview(false);
        return;
      }

      // Map the preview data to the format expected
      const previewData: ParsedImportData = {
        Empleados: result.preview.employees.map((emp: any) => ({
          NoEmpleado: emp.employee_code,
          Nombre: emp.full_name,
          Usuario: emp.user_name,
          Email: emp.email,
          JefeInmediato: emp.boss_user,
          Proveedor: emp.supplier,
          CeCo: emp.cost_center_code,
          Departamento: emp.department_clave,
          Status: emp.active ? 'A' : 'I',
          Rol: emp.role,
        })),
        Departamentos: result.preview.departments.map((dept: any) => ({
          Clave: dept.department_clave,
          Descripcion: dept.department_name,
          CeCo: dept.cost_center_code,
        })),
        CeCo: result.preview.costCenters.map((cc: any) => ({
          Clave: cc.cost_center_code,
          Descripcion: cc.cost_center_name,
        })),
      };

      setParsedData(previewData);
      setShowPreview(true);
      setError(null);
    } catch (err) {
      setError("Error al procesar el archivo: " + (err instanceof Error ? err.message : "Desconocido"));
      setParsedData(null);
      setShowPreview(false);
    }
  };

  // Handler for successful import, which updates the state to show the summary and any success message
  const handleImportSuccess = (result: ImportResponse) => {
    setShowPreview(false);
    setParsedData(null);
    setImportData(result);
    setShowSummary(true);
    setError(null);
    setSuccess("Datos importados exitosamente");
  };

  return (
    <div className="space-y-4">
      {error && <Reminder type="warning" text={error} />}
      {success && <Reminder type="success" text={success} />}
      {/* File Input */}
      <div className="relative flex p-2 border-2 border-dashed border-border rounded-lg cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          accept=".json"
          onChange={handleFile}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="p-4 w-full h-full flex flex-col items-center">
          <Icon name="upload" className="text-text-secondary" />
          <span className="text-text-secondary pointer-events-none">
            Selecciona un archivo JSON o arrastralo aquí
          </span>
          <p className="text-text-secondary text-sm">
            {fileName? `${fileName}` : "Ningún archivo seleccionado"}
          </p>
        </div>
      </div>
      {/* Import Preview */}
      {showPreview && parsedData && (
        <ImportPreview
          data={parsedData}
          endpoint={endpoint}
          token={token}
          onClose={() => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFileName(null);
            setShowPreview(false);
            setParsedData(null);
          }}
          onImportSuccess={handleImportSuccess}
        />
      )}
      {/* Import Summary */}
      {showSummary && importData && importData.summary && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resumen de Importación</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
            </SummaryCard>
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