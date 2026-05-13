/**
 * Auth Rule Form Hook
 * Manages state and logic for DefaultAuthRule and AuthRule forms
 */

import { useState, useEffect } from 'react';

// Props for auth rules
// This is the data passed to the backend when
// creating or updating an auth rule
interface FormData {
  rule_name: string;
  is_default: boolean;
  num_levels: number;
  automatic: boolean;
  travel_type?: string;
  min_duration?: number;
  max_duration?: number;
  min_amount?: number;
  max_amount?: number;
  levels: Array<{
    level_number: number;
    level_type: string;
    superior_level_number: string | null;
  }>;
}

/**
 * Custom hook to manage auth rule form state and logic
 * @param isDefault - Flag to indicate if this is the default rule form
 * @param isCreateMode - Flag to indicate if form is in create mode (affects initial values)
 * @returns An object containing form data, change handlers, validation function, and initialization function
 */
export const useAuthRuleForm = (isDefault: boolean = false, isCreateMode: boolean = true) => {
  const [formData, setFormData] = useState<FormData>({
    rule_name: isDefault ? "Regla por Defecto" : "",
    is_default: isDefault,
    num_levels: 1,
    automatic: true,
    travel_type: "",
    min_duration: isCreateMode ? undefined : 0,
    max_duration: isCreateMode ? undefined : 0,
    min_amount: isCreateMode ? undefined : 0,
    max_amount: isCreateMode ? undefined : 0,
    levels: []
  });

  /**
   * Handle input changes for text, number, select, and checkbox inputs
   * @param {e} - The change event from the input
   * @returns Updates formData state based on input type and name
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Determine the value to set based on input type
    let inputValue: any = value;

    if (type === "checkbox") {
      inputValue = checked;
    } else if (type === "number") {
      inputValue = parseInt(value);
    }

    // Update formData state with the new value
    setFormData(prev => {
      const updatedData = { ...prev, [name]: inputValue };

      // If num_levels changes, adjust the levels array
      if (name === "num_levels") {
        const newNumLevels = inputValue as number;
        const currentLevels = prev.levels;

        if (newNumLevels > currentLevels.length) {
          // Add new levels if num_levels increased
          const newLevels = [...currentLevels];
          for (let i = currentLevels.length; i < newNumLevels; i++) {
            newLevels.push({
              level_number: i + 1,
              level_type: "",
              superior_level_number: null
            });
          }
          updatedData.levels = newLevels;
        } else {
          // Remove levels if num_levels decreased
          updatedData.levels = currentLevels.slice(0, newNumLevels);
        }
      }

      // Clear levels if automatic is checked
      if (name === "automatic" && inputValue === true) {
        updatedData.levels = updatedData.levels.map(level => ({
          ...level,
          level_type: "",
          superior_level_number: null
        }));
      }

      return updatedData;
    });
  };

  /**
   * Handle level type selection
   * @param index - The index of the level being updated
   * @param levelType - The selected level type
   *                  - Jefe/Aleatorio/Nivel_Superior
   * @returns Updates the level_type and resets superior_level_number if necessary
   */
  const handleLevelTypeChange = (index: number, levelType: string) => {
    setFormData(prev => {
      const updatedLevels = [...prev.levels];

      // Update the level type for the specified level
      updatedLevels[index] = {
        ...updatedLevels[index],
        level_type: levelType,
        superior_level_number: levelType === "Nivel_Superior" 
          ? updatedLevels[index].superior_level_number 
          : null
      };
      return { ...prev, levels: updatedLevels };
    });
  };

  /**
   * Handle superior level selection for "Nivel_Superior" type
   * @param index - The index of the level being updated
   * @param superiorLevel - The selected superior level number
   * @returns Updates the superior_level_number for the specified level
   */
  const handleSuperiorLevelChange = (index: number, superiorLevel: string) => {
    setFormData(prev => {
      const updatedLevels = [...prev.levels];

      // Update the superior level number for the specified level
      updatedLevels[index] = {
        ...updatedLevels[index],
        superior_level_number: superiorLevel || null
      };
      return { ...prev, levels: updatedLevels };
    });
  };

  // Validate form
  const validateForm = () => {
    // Check required fields
    if (!formData.num_levels) {
      return { isValid: false, error: "Por favor completa todos los campos requeridos" };
    }

    // If not default rule, validate additional fields
    if (!formData.is_default) {
      if (!formData.rule_name) {
        return { isValid: false, error: "El nombre de la regla es requerido" };
      }

      if (!formData.travel_type) {
        return { isValid: false, error: "El tipo de viaje es requerido" };
      }

      if (formData.min_duration === undefined
        || formData.min_duration === null
      ) {
        return { isValid: false, error: "Los días mínimos son requeridos" };
      }

      if (formData.max_duration === undefined
        || formData.max_duration === null
      ) {
        return { isValid: false, error: "Los días máximos son requeridos" };
      }

      if (formData.min_amount === undefined
        || formData.min_amount === null
      ) {
        return { isValid: false, error: "El monto mínimo es requerido" };
      }

      if (formData.max_amount === undefined
        || formData.max_amount === null
      ) {
        return { isValid: false, error: "El monto máximo es requerido" };
      }
    }

    // Validate num_levels ranges
    if (formData.num_levels < 1 || formData.num_levels > 10) {
      return { isValid: false, error: "El número de niveles debe ser entre 1 y 10" };
    }

    // If not automatic, validate levels
    if (!formData.automatic) {
      const hasEmptyLevels = formData.levels.some(level => !level.level_type);
      if (hasEmptyLevels) {
        return { isValid: false, error: "Todos los niveles deben tener un tipo de autorización seleccionado" };
      }

      // Validate that if "Nivel_Superior" is selected, a superior level is also selected
      const hasMissingSuperiorLevel = formData.levels.some(
        level => level.level_type === "Nivel_Superior" && !level.superior_level_number
      );
      if (hasMissingSuperiorLevel) {
        return { isValid: false, error: "Cuando seleccionas 'Nivel Superior', debes seleccionar un nivel" };
      }
    }

    return { isValid: true };
  };

  // Initialize form data based on provided data
  const initializeFormData = (data: any) => {
    const levels = data.levels || [];
    const numLevels = data.num_levels || 1;

    let initializedLevels: typeof formData.levels = [];
    
    if (levels.length > 0) {
      // Initialize levels from provided data
      initializedLevels = levels.map((level: any) => ({
        level_number: level.level_number,
        level_type: level.level_type,
        superior_level_number: level.superior_level_number || null
      }));
    } else {
      // If no levels provided, initialize empty levels
      for (let i = 0; i < numLevels; i++) {
        initializedLevels.push({
          level_number: i + 1,
          level_type: "",
          superior_level_number: null
        });
      }
    }

    // Set form data with provided values or defaults
    setFormData(prev => ({
      ...prev,
      rule_name: data.rule_name || prev.rule_name,
      num_levels: numLevels,
      automatic: data.automatic || false,
      travel_type: data.travel_type || "",
      min_duration: data.min_duration || 0,
      max_duration: data.max_duration || 0,
      min_amount: data.min_amount || 0,
      max_amount: data.max_amount || 0,
      levels: initializedLevels
    }));
  };

  // Prepare data for sending (remove levels if automatic)
  const prepareDataForSubmit = () => {
    return formData.automatic 
      ? { ...formData, levels: [] }
      : formData;
  };

  return {
    formData,
    handleChange,
    handleLevelTypeChange,
    handleSuperiorLevelChange,
    validateForm,
    initializeFormData,
    prepareDataForSubmit,
    setFormData
  };
};