/**
 * Auth Rule Form Component
 * 
 * Form for creating or editing an authorization rule.
 * Supports two modes: 'create' and 'edit'.
 */

import { useState, useEffect } from "react";
import Input from "@/components/Utils/Input";
import Select from "@/components/Utils/Select";
import Button from "@/components/Buttons/Button";
import Checkbox from "@/components/Utils/Checkbox";
import Toast from "@/components/Utils/Toast";
import { apiRequest } from "@/utils/apiClient";
import { useAuthRuleForm } from "@/hooks/useAuthRuleForm";

interface Props {
  token: string;
  mode: "create" | "edit";
  data?: any; // Data for pre-filling the form in edit mode
}

/**
 * Create or Edit Auth Rule Form
 * Renders a form to create/edit an authorization rule
 * @param {token} - Authentication token for API requests
 * @param {mode} - Determines if the form is in 'create' or 'edit' mode
 * @param {data} - Existing rule data for pre-filling the form in edit mode
 * @returns JSX Element representing the auth rule form
 */
export default function AuthRuleForm({ token, mode, data }: Props) {
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
  } = useAuthRuleForm(false);

  // Pre-fill form fields in edit mode
  useEffect(() => {
    if (mode === "edit" && data) {
      initializeFormData(data);
    }
  }, [mode, data]);

  // Clear toast after 3 seconds
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
    const dataToSend = formData.automatic
      ? { ...formData, levels: [] }
      : formData;

    // Send data to backend
    try {
      const endpoint = mode === "create"
        ? "/admin/create-auth-rule"
        : `/admin/update-auth-rule/${data.rule_id}`;

      const response = await apiRequest(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        data: dataToSend,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.success) {
        setToast({
          message: `Regla ${mode === "create" ? "creada" : "actualizada"} exitosamente`,
          type: "success",
        });
        setTimeout(() => {
          window.location.href = "/reglas-autorizacion";
        }, 2000);
      } else {
        setToast({
          message: response.message || `Error al ${mode === "create" ? "crear" : "actualizar"} la regla`,
          type: "error",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Ocurrió un error";
      setToast({
        message: errorMessage,
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* 1. Rule Name */}
      <div className="card">
        <div className="card-title">
          <h2>1. Nombre de la Regla</h2>
        </div>
        <div className="md:w-1/2">
          <Input
            label="Nombre de la regla"
            name="rule_name"
            type="text"
            placeholder="Ingresa el nombre de la regla"
            required
            value={formData.rule_name}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 2. Authorization Levels */}
      <div className="card">
        <div className="card-title">
          <h2>2. Niveles de Autorización</h2>
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
          <div className="flex flex-col card-secondary mt-4">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-text-primary">Autorizadores por nivel</h3>
              <div className="flex flex-col gap-1">
                <Checkbox
                  label="Automático"
                  name="automatic"
                  value="automatico"
                  checked={formData.automatic}
                  onChange={handleChange}
                />
                <p className="text-sm text-text-secondary">
                  Si seleccionas esta opción, el sistema asignará automáticamente
                  los autorizadores según la jerarquía organizacional.
                </p>
              </div>
              {!formData.automatic && (
                <div>
                  {formData.levels.map((level, index) => {
                    const isSuperiorSelected = level.level_type === "Nivel_Superior";
                    return (
                      <div
                        key={index}
                        className={
                          isSuperiorSelected
                            ? "grid grid-cols-2 gap-2 mb-4"
                            : "grid grid-cols-1 mb-4"
                        }
                      >
                        <Select
                          label={`Autorización nivel ${index + 1}`}
                          name={`nivel_${index + 1}`}
                          value={level.level_type || ""}
                          onChange={(e) => handleLevelTypeChange(index, e.target.value)}
                        >
                          <option value="">Selecciona un autorizador</option>
                          <option value="Jefe">Jefe Directo</option>
                          <option value="Aleatorio">Autorizador Aleatorio</option>
                          <option value="Nivel_Superior">Nivel Superior</option>
                        </Select>
                        {isSuperiorSelected && (
                          <Select
                            label="Nivel"
                            name={`usuario_${index + 1}`}
                            value={level.superior_level_number || ""}
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
      </div>

      {/* 3. Trip type */}
      <div className="card">
        <div className="card-title">
          <h2>3. Tipo de Viaje</h2>
        </div>
        <div className="md:w-1/2">
          <Select
            label="Tipo de viajes"
            name="travel_type"
            value={formData.travel_type || ""}
            required
            onChange={handleChange}
          >
            <option value="">Selecciona una opción</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
            <option value="Ambos">Ambos</option>
          </Select>
        </div>
      </div>

      {/* 4. Trip duration */}
      <div className="card">
        <div className="card-title">
          <h2>4. Rango de duración del viaje</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:w-1/2">
          <Input
            label="Días mínimos"
            name="min_duration"
            type="number"
            placeholder="0"
            min={0}
            required
            value={formData.min_duration}
            onChange={handleChange}
          />
          <Input
            label="Días máximos"
            name="max_duration"
            type="number"
            placeholder="0"
            min={0}
            required
            value={formData.max_duration}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 5. Request amount range */}
      <div className="card">
        <div className="card-title">
          <h2>5. Rango de importe solicitado (MXN)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:w-1/2">
          <Input
            label="Monto mínimo"
            name="min_amount"
            type="number"
            placeholder="0.00"
            min={0}
            required
            value={formData.min_amount}
            onChange={handleChange}
          />
          <Input
            label="Monto máximo"
            name="max_amount"
            type="number"
            placeholder="0.00"
            min={0}
            required
            value={formData.max_amount}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Submit buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="filled" 
          color="primary" 
          href="/reglas-autorizacion"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          variant="filled" 
          color="secondary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : mode === "create" ? "Guardar regla" : "Actualizar regla"}
        </Button>
      </div>
    </div>
  );
}