/**
* Auth Rule Form Component
* 
* Form component used for creating and editing authorization rules. 
* It allows users to define the conditions and levels of authorization 
* for travel requests in the system.
*/

import { useState } from "react";
import { apiRequest } from "@/utils/apiClient";
import Button from "@/components/Buttons/Button";

type Mode = "create" | "edit";

interface Props {
  mode: Mode;
  data?: any; // Optional data for edit mode
  token: string;
}

export default function AuthRuleForm({ mode, data, token }: Props) {
  // Form state
  const [niveles, setNiveles] = useState(0);
  const [automatico, setAutomatico] = useState(false);
  const [autorizadores, setAutorizadores] = useState<string[]>([]);
  
  // Track if "Usuario Especifico" is selected for each level
  const [isUserSelected, setIsUserSelected] = useState<boolean[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<(string | null)[]>([]);
  const [dias, setDias] = useState(5);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare data for backend
    const payload = {
      niveles_autorizacion: niveles,
      automatico,
      days_to_validate: dias,
      niveles: Array.from({ length: niveles }, (_, i) => ({
        tipo: autorizadores[i],
        userId: isUserSelected[i] ? selectedUsers[i] : null,
      })),
    };
    
    try {
      if (mode === "create") {
        // Create new auth rule
        await apiRequest("/auth-rules/create", {
          method: "POST",
          data: payload,
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Regla de autorización creada exitosamente");
      } else if (mode === "edit" && data) {
        // Update existing auth rule
        await apiRequest(`/auth-rules/update/${data.id}`, {
          method: "PUT",
          data: payload,
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Regla de autorización actualizada exitosamente");
      }
    } catch (error) {
      console.error("Error al guardar la regla de autorización:", error);
      alert("Ocurrió un error al guardar la regla de autorización");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">
            1. Niveles de autorización
          </h2>
        </div>
      </div>
      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">
            2. Tipo de viaje
          </h2>
        </div>
      </div>
      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">
            3. Duración
          </h2>
        </div>
      </div>
      <div className="card">
        <div className="card-title">
          <h2 className="text-lg font-semibold text-text-primary">
            4. Monto Solicitado
          </h2>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button
          variant="filled"
          color="primary"
          href="reglas-autorizacion"
        >
          Cancelar
        </Button>
        <Button type="submit" variant="filled" color="secondary">
          {mode === "create" ? "Crear Regla" : "Actualizar Regla"}
        </Button>
      </div>
    </form>
  );
}