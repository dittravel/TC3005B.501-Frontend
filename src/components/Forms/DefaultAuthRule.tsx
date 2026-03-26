/**
* Default Authorization Rule Component
* 
* Displays the default authorization rule that applies to all requests 
* that do not match any specific rules defined in the system.
*/

import { useState } from "react";
import Input from "@/components/Utils/Input";
import Button from "@/components/Buttons/Button";
import Select from "@/components/Utils/Select";
import Checkbox from "@/components/Utils/Checkbox";

export default function DefaultAuthRule() {
  const [niveles, setNiveles] = useState(0);
  const [automatico, setAutomatico] = useState(false);
  const [autorizadores, setAutorizadores] = useState<string[]>([]);

  // Handle changes to the niveles input
  function handleNivelesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setNiveles(value);

    // If the new value is less than the current number of autorizadores, trim the array
    if (value < autorizadores.length) {
      setAutorizadores(autorizadores.slice(0, value));
    }
  }

  // Handle changes to the autorizadores select inputs
  function handleAuthSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const newAutorizadores = [...autorizadores];
    newAutorizadores[index] = e.target.value;
    setAutorizadores(newAutorizadores);
  }

  // Reset to default values
  function resetToDefault() {
    setNiveles(0);
    setAutomatico(false);
    setAutorizadores([]);
  }

  return (
    <div className="card">
      <div className="card-title">
        <h2>Regla por Defecto</h2>
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
          <div className="flex flex-col gap-4 md:w-1/2">
            <h2 className="font-semibold text-text-primary">
              Autorizadores por nivel
            </h2>
            <div className="flex flex-col gap-1">
              <Checkbox
                label="Automático"
                name="automatico"
                value="automatico"
                checked={automatico}
                onChange={(e) => setAutomatico(e.target.checked)}
              />
              <p className="text-sm text-text-secondary">
                Si seleccionas esta opción, el sistema asignará automáticamente a los 
                autorizadores correspondientes según la jerarquía organizacional.
              </p>
            </div>
            {!automatico && (
              <div>
                {[...Array(niveles)].map((_, index) => (
                  <Select
                    key={index}
                    label={`Autorización ${index + 1}`}
                    name={`nivel_${index + 1}`}
                    value={autorizadores[index] || ""}
                    onChange={(e) => {handleAuthSelect(index, e)}}
                  >
                    <option value="">Selecciona un autorizador</option>
                    <option value="jefe_directo">Jefe Directo</option>
                    <option value="jefe_departamento">Jefe de Departamento</option>
                    <option value="director">Usuario Especifico (Especificar)</option>
                  </Select>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="border"
          color="primary"
          onClick={resetToDefault}
        >
          Valores por defecto
        </Button>
        <Button
          variant="filled"
          color="secondary"
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}