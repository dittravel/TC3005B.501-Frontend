/**
* Default Authorization Rule Component
* 
* Displays the default authorization rule that applies to all requests 
* that do not match any specific rules defined in the system.
*/

import { useState, useEffect } from "react";
import Input from "@/components/Utils/Input";
import Button from "@/components/Buttons/Button";
import Select from "@/components/Utils/Select";
import Checkbox from "@/components/Utils/Checkbox";
import { apiRequest } from "@/utils/apiClient";

interface Props {
  defaultRule?: any;
  token: string;
}

export default function DefaultAuthRule({ defaultRule, token }: Props) {
  const [niveles, setNiveles] = useState(1);
  const [automatico, setAutomatico] = useState(false);
  const [autorizadores, setAutorizadores] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Track if "Nivel Superior" is selected for each level
  const [isSuperiorSelected, setIsSuperiorSelected] = useState<boolean[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<(string | null)[]>([]);

  const [dias, setDias] = useState(5);

  // Load default rule data
  useEffect(() => {
    if (!defaultRule) return;

    // Initialize form state from defaultRule properties
    const numLevels = defaultRule.num_levels || 0;
    setNiveles(numLevels);
    setDias(defaultRule.days_to_validate || 5);
    setAutomatico(defaultRule.automatic || false);

    // Load levels data
    const levels = defaultRule.levels || [];

    // Initialize authorizers array based on levels data
    setAutorizadores(levels.map((n: any) => n.level_type) || []);
    setIsSuperiorSelected(
      defaultRule.levels?.map((n: any) => n.level_type === "Nivel_Superior") || []
    );
    setSelectedLevels(
      defaultRule.levels?.map((n: any) => n.superior_level_number || null) || []
    );
  }, [defaultRule]);

  // Handle changes to the niveles input
  function handleNivelesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setNiveles(value);
    

    // If the new value is less than the current number of autorizadores, trim the array
    if (value < autorizadores.length) {
      setAutorizadores(autorizadores.slice(0, value));
    }

    // update user selection tracking
    setIsSuperiorSelected(prev => {
      const next = [...prev];
      if (value < next.length) return next.slice(0, value);
      while (next.length < value) next.push(false);
      return next;
    });

    setSelectedLevels(prev => {
      const next = [...prev];
      if (value < next.length) return next.slice(0, value);
      while (next.length < value) next.push("");
      return next;
    });
  }

  function handleDiasChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setDias(value);
  }

  // Handle type selection for each level
  function handleTypeSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    setIsSuperiorSelected(prev => {
      const next = [...prev];
      next[index] = value === "Nivel_Superior";
      return next;
    });

    // If changing away from "Nivel Superior", clear the selection for that level
    if (value !== "Nivel_Superior") {
      setSelectedLevels(prev => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
    }
  }

  // Handle changes to the user select inputs when "Nivel Superior" is selected
  function handleUserSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const superiorLevelNumber = e.target.value;
    setSelectedLevels(prev => {
      const next = [...prev];
      next[index] = superiorLevelNumber || null;
      return next;
    });
  }

  // Handle changes to the autorizadores select inputs
  function handleAuthSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const newAutorizadores = [...autorizadores];
    newAutorizadores[index] = e.target.value;
    setAutorizadores(newAutorizadores);
  }

  // Handle automatic checkbox change
  function handleAutomaticChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutomatico(e.target.checked);
    // Clear selections
    setAutorizadores([]);
    setIsSuperiorSelected([]);
    setSelectedLevels([]);
  }

  // Handle save changes
  async function handleSave() {
    // Create data to send to backend
    const data = {
      rule_name: "Regla por Defecto",
      is_default: true,
      num_levels: niveles,
      days_to_validate: dias,
      automatic: automatico,
      levels: autorizadores.map((type, index) => ({
        level_number: index + 1,
        level_type: type,
        superior_level_number: isSuperiorSelected[index] ? selectedLevels[index] : null
      })),
    };

    if (!defaultRule || !defaultRule.rule_id) {
      alert("No se encontró la regla por defecto para actualizar");
      return;
    }

    // Send data to backend
    try {
      const response = await apiRequest(`/admin/update-auth-rule/${defaultRule.rule_id}`, {
        method: 'PUT',
        data: data,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.success) {
        alert("Regla por defecto actualizada exitosamente");
        window.location.reload();
      } else {
        alert("Error al actualizar la regla por defecto");
      }
    } catch (error) {
      console.error("Error saving default auth rule:", error);
      alert("Error al actualizar la regla por defecto");
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <h2>Regla por Defecto</h2>
        <p>
          Esta regla se aplica a todas las solicitudes que no coincidan con ninguna regla definida.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Niveles de autorización"
          name="niveles_autorizacion"
          type="number"
          placeholder="Número"
          altText="Ingresa un valor entre 1 y 10"
          min={1}
          max={10}
          required
          value={niveles}
          onChange={(e) => handleNivelesChange(e)}
        />
        <Input
          label="Días de comprobación"
          name="dias"
          type="number"
          placeholder="Número"
          altText="Ingresa un valor entre 5 y 30"
          min={5}
          max={30}
          required
          value={dias}
          onChange={(e) => handleDiasChange(e)}
        />
      </div>
      {niveles > 0 && niveles < 11 && (
        <div className="flex flex-col card-secondary">
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-text-primary">
              Autorizadores por nivel
            </h2>
            <div className="flex flex-col gap-1">
              <Checkbox
                label="Automático"
                name="automatico"
                value="automatico"
                checked={automatico}
                onChange={(e) => handleAutomaticChange(e)}
              />
              <p className="text-sm text-text-secondary">
                Si seleccionas esta opción, el sistema asignará automáticamente a los 
                autorizadores correspondientes según la jerarquía organizacional.
              </p>
            </div>
            {!automatico && (
              <div className="">
                <div>
                  {[...Array(niveles)].map((_, index) => (
                    <div key={index} className={isSuperiorSelected[index] ? "grid grid-cols-2 gap-2 mb-4" : "grid grid-cols-1 mb-4"}>
                      {/* Select type of authorizer for this level */}
                      <Select
                        key={index}
                        label={`Autorización ${index + 1}`}
                        name={`nivel_${index + 1}`}
                        value={autorizadores[index] || ""}
                        required
                        onChange={(e) => {
                          handleAuthSelect(index, e);
                          handleTypeSelect(index, e);
                        }}
                      >
                        <option value="">Selecciona un autorizador</option>
                        <option value="Jefe">Jefe Directo</option>
                        <option value="Aleatorio">Autorizador Aleatorio</option>
                        <option value="Nivel_Superior">Nivel Superior</option>
                      </Select>
                      {/* If "Superior level" is selected, show level select */}
                      {isSuperiorSelected[index] && (
                        <Select
                          label="Nivel"
                          name={`usuario_${index + 1}`}
                          value={selectedLevels[index] || ""}
                          required
                          onChange={(e) => handleUserSelect(index, e)}
                        >
                          <option value="">Selecciona el nivel que debe aprobar</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="border"
          color="primary"
          onClick={() => {window.location.reload()}}
        >
          Reestablecer
        </Button>
        <Button
          variant="filled"
          color="secondary"
          onClick={handleSave}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}