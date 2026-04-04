/**
* CreateAuthRuleForm
* 
* Form for creating a new authorization rule.
* 4 Sections:
* 1. Authorization levels and approvers per level
* 2. Trip type (national, international, or both)
* 3. Trip duration range (days)
* 4. Request amount range (mxn)
*/

import { useState } from "react";
import Input from "@/components/Utils/Input";
import Select from "@/components/Utils/Select";
import Button from "@/components/Buttons/Button";
import Checkbox from "@/components/Utils/Checkbox";

export default function CreateAuthRuleForm() {
  // Section 1: Authorization levels
  const [niveles, setNiveles] = useState(0);
  const [automatico, setAutomatico] = useState(false);
  const [autorizadores, setAutorizadores] = useState<string[]>([]);
  
  // Section 2: Trip Type
  const [tipoViaje, setTipoViaje] = useState("");
  
  // Section 3: Duration range
  const [diasMin, setDiasMin] = useState("");
  const [diasMax, setDiasMax] = useState("");
  
  // Section 4: Amount range
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");
  
  function handleNivelesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setNiveles(value);
    if (value < autorizadores.length) {
      setAutorizadores(autorizadores.slice(0, value));
    } 
  }
  
  function handleAuthSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const newAutorizadores = [...autorizadores];
    newAutorizadores[index] = e.target.value;
    setAutorizadores(newAutorizadores);
  }
  
  async function handleSubmit() {
    // TO-DO: REEPLACE WITH REAL API CALL
    const payload = {
      niveles,
      automatico,
      autorizadores,
      tipoViaje,
      diasMin: Number(diasMin),
      diasMax: Number(diasMax),
      montoMin: Number(montoMin),
      montoMax: Number(montoMax),
    };
    // HERE YOU WOULD SEND payload TO THE BACKEND TO CREATE THE AUTH RULE
  }
  
  return (
    <div className="space-y-6 mt-6">
      {/* 1. Auth levels */}
      <div className="card">
        <div className="card-title">
          <h2>1. Niveles de Autorización</h2>
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
                  {[...Array(niveles)].map((_, index) =>(
                    <Select
                      key={index}
                      label={`Autorización nivel ${index + 1}`}
                      name={`nivel_${index + 1}`}
                      value={autorizadores[index] || ""}
                      onChange={e => handleAuthSelect(index, e)}
                    >
                      <option value="">Selecciona un autorizador</option>
                      <option value="jefe_directo">Jefe Directo</option>
                      <option value="jefe_departamento">Jefe de Departamento</option>
                      <option value="director">Usuario Específico</option>
                    </Select>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 2. Trip type */}
      <div className="card">
        <div className="card-title">
          <h2>2. Tipo de Viaje</h2>
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
            <option value="nacional">Nacional</option>
            <option value="internacional">Internacional</option>
            <option value="ambos">Ambos</option>
          </Select>
        </div>
      </div>
      
      {/* Sección 3: Rango de duración */}
      <div className="card">
        <div className="card-title">
          <h2>3. Rango de duración del viaje</h2>
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
      
      {/* 4. Amount range */}
      <div className="card">
        <div className="card-title">
          <h2>4. Rango de importe solicitado (MXN)</h2>
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
      
      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="filled" color="primary" href="/reglas-autorizacion">
          Cancelar
        </Button>
        <Button variant="filled" color="secondary" onClick={handleSubmit}>
          Guardar regla
        </Button>
      </div>
    </div>
  );
}