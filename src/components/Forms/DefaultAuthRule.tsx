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
  users: any[];
  defaultRule?: any;
  token: string;
}

export default function DefaultAuthRule({ users, defaultRule, token }: Props) {
  const [niveles, setNiveles] = useState(0);
  const [automatico, setAutomatico] = useState(false);
  const [autorizadores, setAutorizadores] = useState<string[]>([]);

  // Track if "Usuario Especifico" is selected for each level
  const [isUserSelected, setIsUserSelected] = useState<boolean[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<(string | null)[]>([]);

  // Load default rule data
  useEffect(() => {
    if (!defaultRule) return;

    // Levels of authorization
    const nivelesFromRule = defaultRule.num_levels ?? 0;
    setNiveles(nivelesFromRule);
    setAutomatico(defaultRule.automatic);

    // Initialize arrays to track type of authorizer and users
    const nextAutorizadores: string[] = [];
    const nextIsUserSelected: boolean[] = [];
    const nextSelectedUsers: (string | null)[] = [];

    // For each level, determine type and/or user
    for (let i = 0; i < nivelesFromRule; i++) {
      // Find config for this level in the default rule data
      const nivelConfig = defaultRule.levels?.find((n: any) => n.level === i + 1);

      // If there is a config for this level, set array values
      if (nivelConfig) {
        nextAutorizadores[i] = nivelConfig.type || "";
        const isUsuario = nivelConfig.type === "Usuario";
        nextIsUserSelected[i] = isUsuario;
        nextSelectedUsers[i] = isUsuario ? (nivelConfig.user_id || "") : "";
      } else {
        // If no config for this level, set defaults
        nextAutorizadores[i] = "";
        nextIsUserSelected[i] = false;
        nextSelectedUsers[i] = "";
      }
    }

    setAutorizadores(nextAutorizadores);
    setIsUserSelected(nextIsUserSelected);
    setSelectedUsers(nextSelectedUsers);
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
    setIsUserSelected(prev => {
      const next = [...prev];
      if (value < next.length) return next.slice(0, value);
      while (next.length < value) next.push(false);
      return next;
    });

    setSelectedUsers(prev => {
      const next = [...prev];
      if (value < next.length) return next.slice(0, value);
      while (next.length < value) next.push("");
      return next;
    });
  }

  // Handle type selection for each level to track if "Usuario Especifico" is selected
  function handleTypeSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    setIsUserSelected(prev => {
      const next = [...prev];
      next[index] = value === "Usuario";
      return next;
    });

    // If changing away from "Usuario Especifico", clear the user selection for that level
    if (value !== "Usuario") {
      setSelectedUsers(prev => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
    }
  }

  // Handle changes to the user select inputs when "Usuario Especifico" is selected
  function handleUserSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const userId = e.target.value;
    setSelectedUsers(prev => {
      const next = [...prev];
      next[index] = userId || null;
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
    setIsUserSelected([]);
    setSelectedUsers([]);
  }

  // Handle save changes
  async function handleSave() {
    // Create data to send to backend
    const data = {
      name: "Regla por Defecto",
      is_default: true,
      num_levels: niveles,
      automatic: automatico,
      niveles: autorizadores.map((type, index) => ({
        level: index + 1,
        type,
        user_id: isUserSelected[index] ? selectedUsers[index] : null,
      })),
    };

    if (!defaultRule || !defaultRule.id) {
      alert("No se encontró la regla por defecto para actualizar");
      return;
    }

    // Send data to backend
    try {
      const response = await apiRequest(`/admin/update-auth-rule/${defaultRule.id}`, {
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
      <div className="md:w-1/2">
        <Input
          label="Niveles de autorización"
          name="niveles_autorizacion"
          type="number"
          placeholder="Número"
          altText="Ingresa un valor entre 0 y 10"
          min={0}
          max={10}
          required
          value={niveles}
          onChange={(e) => handleNivelesChange(e)}
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
                    <div key={index} className={isUserSelected[index] ? "grid grid-cols-2 gap-2 mb-4" : "grid grid-cols-1 mb-4"}>
                      {/* Select type of authorizer for this level */}
                      <Select
                        key={index}
                        label={`Autorización ${index + 1}`}
                        name={`nivel_${index + 1}`}
                        value={autorizadores[index] || ""}
                        onChange={(e) => {
                          handleAuthSelect(index, e);
                          handleTypeSelect(index, e);
                        }}
                      >
                        <option value="">Selecciona un autorizador</option>
                        <option value="Jefe">Jefe Directo</option>
                        <option value="Departamento">Jefe de Departamento</option>
                        <option value="Usuario">Usuario (Especificar)</option>
                      </Select>
                      {/* If "Usuario Especifico" is selected, show user select */}
                      {isUserSelected[index] && (
                        <Select
                          label="Usuario"
                          name={`usuario_${index + 1}`}
                          value={selectedUsers[index] || ""}
                          onChange={(e) => handleUserSelect(index, e)}
                        >
                          <option value="">Selecciona un usuario</option>
                          {users.map((user: any) => (
                            <option key={user.user_id} value={user.user_id}>
                              {user.user_name}
                            </option>
                          ))}
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