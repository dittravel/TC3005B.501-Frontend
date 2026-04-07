/**
 * CreateAuthRuleForm
 *
 * Form for creating or editing an authorization rule.
 * Supports two modes: 'create' and 'edit'.
 */

import { useState, useEffect } from "react";
import Input from "@/components/Utils/Input";
import Select from "@/components/Utils/Select";
import Button from "@/components/Buttons/Button";
import Checkbox from "@/components/Utils/Checkbox";
import { apiRequest } from "@/utils/apiClient";

interface Props {
  token: string;
  mode: "create" | "edit";
  data?: any; // Data for pre-filling the form in edit mode
}

export default function CreateAuthRuleForm({ token, mode, data }: Props) {
  const [ruleName, setRuleName] = useState("");
  const [niveles, setNiveles] = useState(1);
  const [automatico, setAutomatico] = useState(false);
  const [autorizadores, setAutorizadores] = useState<string[]>([]);
  const [isSuperiorSelected, setIsSuperiorSelected] = useState<boolean[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<(string | null)[]>([]);

  const [tipoViaje, setTipoViaje] = useState("");
  const [diasMin, setDiasMin] = useState("");
  const [diasMax, setDiasMax] = useState("");
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");

  // Pre-fill form fields in edit mode
  useEffect(() => {
    if (mode === "edit" && data) {
      setRuleName(data.rule_name || "");
      setNiveles(data.num_levels || 1);
      setAutomatico(data.automatic || false);
      setAutorizadores(data.levels?.map((n: any) => n.level_type) || []);
      setIsSuperiorSelected(
        data.levels?.map((n: any) => n.superior_level_number !== null) || []
      );
      setSelectedLevels(
        data.levels?.map((n: any) => n.superior_level_number || null) || []
      );
      setTipoViaje(data.travel_type || "");
      setDiasMin(data.min_duration?.toString() || "");
      setDiasMax(data.max_duration?.toString() || "");
      setMontoMin(data.min_amount?.toString() || "");
      setMontoMax(data.max_amount?.toString() || "");
    }
  }, [mode, data]);

  function handleNivelesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setNiveles(value);

    if (value < autorizadores.length) {
      setAutorizadores(autorizadores.slice(0, value));
    }

    setIsSuperiorSelected((prev) => {
      const next = [...prev];
      if (value < next.length) return next.slice(0, value);
      while (next.length < value) next.push(false);
      return next;
    });

    setSelectedLevels((prev) => {
      const next = [...prev];
      if (value < next.length) return next.slice(0, value);
      while (next.length < value) next.push("");
      return next;
    });
  }

  function handleTypeSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    setIsSuperiorSelected((prev) => {
      const next = [...prev];
      next[index] = value === "Nivel Superior";
      return next;
    });

    if (value !== "Nivel Superior") {
      setSelectedLevels((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
    }
  }

  function handleUserSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const superiorLevelNumber = e.target.value;
    setSelectedLevels((prev) => {
      const next = [...prev];
      next[index] = superiorLevelNumber || null;
      return next;
    });
  }

  function handleAuthSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const newAutorizadores = [...autorizadores];
    newAutorizadores[index] = e.target.value;
    setAutorizadores(newAutorizadores);
  }

  async function handleSubmit() {
    const payload = {
      rule_name: ruleName,
      is_default: false,
      num_levels: niveles,
      automatic: automatico,
      travel_type: tipoViaje,
      min_duration: Number(diasMin),
      max_duration: Number(diasMax),
      min_amount: Number(montoMin),
      max_amount: Number(montoMax),
      niveles: autorizadores.map((type, index) => ({
        level_number: index + 1,
        level_type: type,
        superior_level_number: isSuperiorSelected[index] ? selectedLevels[index] : null,
      })),
    };

    try {
      const response = await apiRequest(
        mode === "create" ? "/admin/create-auth-rule" : `/admin/update-auth-rule/${data.rule_id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          data: payload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.success) {
        alert(`Regla ${mode === "create" ? "creada" : "actualizada"} exitosamente`);
        window.location.href = "/reglas-autorizacion";
      } else {
        alert(`Error al ${mode === "create" ? "crear" : "actualizar"} la regla`);
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} auth rule:`, error);
      alert(`Error al ${mode === "create" ? "crear" : "actualizar"} la regla`);
    }
  }

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
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Authorization Levels */}
      <div className="card">
        <div className="card-title">
          <h2>2. Niveles de Autorización</h2>
        </div>
        <div className="md:w-1/2">
          <Input
            label="Numero de niveles de autorización"
            name="niveles_autorizacion"
            type="number"
            placeholder="Número"
            altText="Ingresa un valor entre 1 y 10"
            min={1}
            max={10}
            required
            value={niveles}
            onChange={handleNivelesChange}
          />
        </div>
        {niveles > 0 && niveles < 11 && (
          <div className="flex flex-col card-secondary mt-4">
            <div className="flex flex-col gap-4 md:w-1/2">
              <h3 className="font-semibold text-text-primary">Autorizadores por nivel</h3>
              <div className="flex flex-col gap-1">
                <Checkbox
                  label="Automático"
                  name="automatico"
                  value="automatico"
                  checked={automatico}
                  onChange={(e) => setAutomatico(e.target.checked)}
                />
                <p className="text-sm text-text-secondary">
                  Si seleccionas esta opción, el sistema asignará automáticamente
                  los autorizadores según la jerarquía organizacional.
                </p>
              </div>
              {!automatico && (
                <div>
                  {[...Array(niveles)].map((_, index) => (
                    <div
                      key={index}
                      className={
                        isSuperiorSelected[index]
                          ? "grid grid-cols-2 gap-2 mb-4"
                          : "grid grid-cols-1 mb-4"
                      }
                    >
                      <Select
                        label={`Autorización nivel ${index + 1}`}
                        name={`nivel_${index + 1}`}
                        value={autorizadores[index] || ""}
                        onChange={(e) => {
                          handleAuthSelect(index, e);
                          handleTypeSelect(index, e);
                        }}
                      >
                        <option value="">Selecciona un autorizador</option>
                        <option value="Jefe">Jefe Directo</option>
                        <option value="Aleatorio">Autorizador Aleatorio</option>
                        <option value="Nivel Superior">Nivel Superior</option>
                      </Select>
                      {isSuperiorSelected[index] && (
                        <Select
                          label="Nivel"
                          name={`usuario_${index + 1}`}
                          value={selectedLevels[index] || ""}
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
            name="tipo_viaje"
            value={tipoViaje}
            required
            onChange={(e) => setTipoViaje(e.target.value)}
          >
            <option value=""> Selecciona una opción</option>
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
            name="dias_min"
            type="number"
            placeholder="0"
            min={0}
            required
            value={diasMin}
            onChange={(e) => setDiasMin(e.target.value)}
          />
          <Input
            label="Días máximos"
            name="dias_max"
            type="number"
            placeholder="0"
            min={0}
            required
            value={diasMax}
            onChange={(e) => setDiasMax(e.target.value)}
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
            name="monto_min"
            type="number"
            placeholder="0.00"
            min={0}
            required
            value={montoMin}
            onChange={(e) => setMontoMin(e.target.value)}
          />
          <Input
            label="Monto máximo"
            name="monto_max"
            type="number"
            placeholder="0.00"
            min={0}
            required
            value={montoMax}
            onChange={(e) => setMontoMax(e.target.value)}
          />
        </div>
      </div>
      {/* Submit buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="filled" color="primary" href="/reglas-autorizacion">
          Cancelar
        </Button>
        <Button variant="filled" color="secondary" onClick={handleSubmit}>
          {mode === "create" ? "Guardar regla" : "Actualizar regla"}
        </Button>
      </div>
    </div>
  );
}