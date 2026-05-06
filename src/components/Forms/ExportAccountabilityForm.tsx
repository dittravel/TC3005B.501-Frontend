/**
 * ExportAccountabilityForm to handle the request for exporting accountability data
 */

import React, { useState } from "react";
import Button from "@/components/Buttons/Button";
import Reminder from "@/components/Utils/Reminder";
import { apiRequest } from "@utils/apiClient";

interface Props {
  token: string;
}

export default function AccountingExportForm({ token }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setResult(null);

    if (!token) {
      setErrorMessage(
        "Token no disponible. Por favor inicia sesión nuevamente.",
      );
      setLoading(false);
      return;
    }

    try {
      let url = "/accounting/export/";
      const headers = { Authorization: `Bearer ${token}` };

      const response = await apiRequest(url, {
        method: "GET",
        headers,
      });

      setResult(response);

      if (!response || (Array.isArray(response) && response.length === 0)) {
        setErrorMessage(
          "La consulta se realizó correctamente, pero no se encontraron datos.",
        );
      }
    } catch (error: any) {
      const detail = error?.detail || error?.response || error;
      const status = detail?.status || error?.status || 500;

      const backendError =
        detail?.response?.error ||
        detail?.error ||
        detail?.response?.data?.error ||
        detail?.message;

      let userMessage = "Error al consultar los datos";

      if (status === 400) {
        userMessage = "Información no disponible";
      } else if (status === 404) {
        userMessage = "No se encontró información. Intenta con otros datos.";
      } else if (backendError) {
        userMessage = backendError;
      }

      setErrorMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setErrorMessage("");
  };

  const handleDownload = () => {
    if (!result) return;

    const fecha = new Date().toISOString().split("T")[0];
    const nombreArchivo = `exportacion-${fecha}.json`;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="card-title">
        <h2>Exportar Pólizas</h2>
        <p>Haz clic en el botón para exportar todas las pólizas en formato JSON</p>
      </div>

      <Button
        type="button"
        variant="filled"
        color="secondary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Exportando..." : "Exportar pólizas"}
      </Button>

      {/* Error message */}
      {errorMessage && (
        <Reminder 
          text={errorMessage}
          type="warning"
        />
      )}

      {/* Resultado JSON */}
      {result && (
        <div>
          <div className="flex justify-between items-center mt-4 mb-4">
            <h3 className="text-2xl font-semibold">Resultado</h3>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                color="secondary"
                variant="link"
                onClick={handleClear}
              >
                Limpiar
              </Button>
              <Button
                type="button"
                color="secondary"
                onClick={handleDownload}
              >
                Descargar JSON
              </Button>
            </div>
          </div>
          <div className="bg-background text-text-primary p-6 rounded-md overflow-auto max-h-[650px] font-mono text-sm border border-border">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
