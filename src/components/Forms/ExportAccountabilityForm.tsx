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
  const [searchType, setSearchType] = useState<"id" | "date">("date");
  const [requestId, setRequestId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
      let url = "/accounting/export";
      const headers = { Authorization: `Bearer ${token}` };

      if (searchType === "id") {
        if (!requestId.trim()) {
          setErrorMessage("Por favor ingresa un ID válido");
          setLoading(false);
          return;
        }
        url = `/accounting/export/${requestId.trim()}`;
      } else {
        const params = new URLSearchParams();
        if (dateFrom) params.append("date_from", dateFrom);
        if (dateTo) params.append("date_to", dateTo);

        if (!dateFrom && !dateTo) {
          setErrorMessage("Debes ingresar al menos una fecha");
          setLoading(false);
          return;
        }
        url += `?${params.toString()}`;
      }

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
    setRequestId("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3 justify-center mb-2">
            <Button
              type="button"
              //variant={searchType === "date" ? "filled" : "outlined"}
              color="secondary"
              onClick={() => setSearchType("date")}
            >
              Por Rango de Fechas
            </Button>
            <Button
              type="button"
              //variant={searchType === "id" ? "filled" : "outlined"}
              color="secondary"
              onClick={() => setSearchType("id")}
            >
              Por ID de Solicitud
            </Button>
          </div>

          {searchType === "id" ? (
            <Input
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value.replace(/\D/g, ""))}
              placeholder="ID de la solicitud (ej: 5)"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                label="Fecha Desde"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                label="Fecha Hasta"
              />
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              variant="filled"
              color="secondary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Consultando..." : "Consultar Datos"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleClear}
            >
              Limpiar
            </Button>
          </div>
        </form>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl text-center font-medium">
            {errorMessage}
          </div>
        )}

        {result && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Resultado:</h3>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  color="primary"
                  className="px-4 py-2"
                  onClick={handleDownload}
                >
                  Descargar JSON
                </Button>

                <Button
                  type="button"
                  variant="empty"
                  className="px-3 py-2"
                  onClick={handleClear}
                >
                  Limpiar
                </Button>
              </div>
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
