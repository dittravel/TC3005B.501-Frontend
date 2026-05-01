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
import Toast from "@/components/Utils/Toast";
import { apiRequest } from "@/utils/apiClient";
import { useAuthRuleForm } from "@/hooks/useAuthRuleForm";
import { init } from "astro/virtual-modules/prefetch.js";

interface Props {
  defaultRule?: any;
  token: string;
}

/**
 * Default Auth Rule
 * Displays and allows editing of the default authorization rule for the system.
 * @param {defaultRule} - The default rule data to populate the form with
 * @param {token} - Authentication token for API requests
 * @returns JSX Element representing the default auth rule form
 */
export default function DefaultAuthRule({ defaultRule, token }: Props) {
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Use custom hook to manage form state and logic
  const {
    formData,
    handleChange,
    handleLevelTypeChange,
    handleSuperiorLevelChange,
    validateForm,
    initializeFormData
  } = useAuthRuleForm(true);

  // Load default rule data
  useEffect(() => {
    // If no default rule is provided, dont populate the form
    if (!defaultRule) return;
    initializeFormData(defaultRule);
  }, [defaultRule]);
  
  // Clear toast after 3 seconds ( o lo que quieran idk)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle submit of the form
  const handleSubmit = async () => {
    if (!defaultRule || !defaultRule.rule_id) {
      setToast({ 
        message: "No se encontró la regla por defecto",
        type: "error"
      });
      return;
    }

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setToast({ 
        message: validation.error || "Por favor corrige los errores en el formulario",
        type: "error"
      });
      return;
    }

    setLoading(true);

    // Prepare data (remove levels if automatic is selected)
    const data = formData.automatic
      ? { ...formData, levels: [] }
      : formData;

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
        setToast({ 
          message: "Regla por defecto actualizada exitosamente",
          type: "success"
        });
      } else {
        setToast({ 
          message: response.message || "Error al actualizar la regla por defecto",
          type: "error"
        });
      }
    } catch (error) {
      setToast({ 
        message: "Error al guardar la regla por defecto",
        type: "error"
      });
      console.error("Error saving default auth rule:", error);
    } finally {
      setLoading(false);
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
          name="num_levels"
          type="number"
          placeholder="Número"
          altText="Ingresa un valor entre 1 y 10"
          min={1}
          max={10}
          required
          value={formData.num_levels}
          onChange={handleChange}
        />
      </div>
      {formData.num_levels > 0 && formData.num_levels < 11 && (
        <div className="flex flex-col card-secondary">
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-text-primary">
              Autorizadores por nivel
            </h2>
            <div className="flex flex-col gap-1">
              <Checkbox
                label="Automático"
                name="automatic"
                value="automatico"
                checked={formData.automatic}
                onChange={handleChange}
              />
              <p className="text-sm text-text-secondary">
                Si seleccionas esta opción, el sistema asignará automáticamente a los 
                autorizadores correspondientes según la jerarquía organizacional.
              </p>
            </div>
            {!formData.automatic && (
              <div>
                {formData.levels.map((level, index) => {
                  const isSuperiorSelected = level.level_type === "Nivel_Superior";
                  return (
                    <div 
                      key={index} 
                      className={isSuperiorSelected ? "grid grid-cols-2 gap-2 mb-4" : "grid grid-cols-1 mb-4"}
                    >
                      {/* Select type of authorizer for this level */}
                      <Select
                        label={`Autorización ${index + 1}`}
                        name={`nivel_${index + 1}`}
                        value={level.level_type || ""}
                        required
                        onChange={(e) => handleLevelTypeChange(index, e.target.value)}
                      >
                        <option value="">Selecciona un autorizador</option>
                        <option value="Jefe">Jefe Directo</option>
                        <option value="Aleatorio">Autorizador Aleatorio</option>
                        <option value="Nivel_Superior">Nivel Superior</option>
                      </Select>
                      {/* If "Nivel_Superior" is selected, show level select */}
                      {isSuperiorSelected && (
                        <Select
                          label="Nivel"
                          name={`usuario_${index + 1}`}
                          value={level.superior_level_number || ""}
                          required
                          onChange={(e) => handleSuperiorLevelChange(index, e.target.value)}
                        >
                          <option value="">Selecciona el nivel que debe aprobar</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {toast && (<Toast message={toast.message} type={toast.type} />)}
      <div className="flex justify-end gap-2">
        <Button
          variant="border"
          color="primary"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          Recargar
        </Button>
        <Button
          variant="filled"
          color="secondary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}