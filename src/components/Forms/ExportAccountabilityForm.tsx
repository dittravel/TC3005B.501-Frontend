/**
 * ExportAccountabilityForm to handle the request for exporting accountability data
 */

import React, { useState } from "react";
import Button from "@/components/Buttons/Button";
import { apiRequest } from "@utils/apiClient";
import Input from "@/components/Utils/Input";

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

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Exportar Pólizas</h2>
          <p className="text-muted-foreground mt-2">
            Haz clic en el botón para exportar todas las pólizas en formato JSON
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="filled"
            color="secondary"
            onClick={handleSubmit}
            disabled={loading}
            className="px-12 py-3 text-lg" // tamaño cómodo pero no exagerado
          >
            {loading ? "Exportando..." : "Exportar pólizas"}
          </Button>
        </div>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Resultado JSON */}
        {result && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Resultado:</h3>
              <Button
                type="button"
                color="secondary"
                size="small"
                onClick={handleClear}
              >
                Limpiar resultado
              </Button>
            </div>

            <div className="bg-zinc-950 text-zinc-100 p-6 rounded-2xl overflow-auto max-h-[650px] font-mono text-sm border border-border">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
