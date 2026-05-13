/**
 * Request Stepper
 * 
 * Displays the progress of a travel request through its various stages, from draft to completion.
 * It dynamically adjusts the steps based on whether an agency is required and highlights the current status.
 */

import React from 'react';
import Icon from '@/components/Utils/Icon';

interface Step {
  label: string;
  key: string;
}

interface Props {
  currentStatus: string;
  requiresAgency: boolean;
  authorizationLevel?: number;
  authorizationLevelsTotal?: number | null;
}

/**
 * Generates the list of steps for the request process
 * @param {boolean} requiresAgency - Indicates if the request requires an agency step
 * @returns {Step[]} Array of steps to display in the stepper
 */
const getSteps = (requiresAgency: boolean): Step[] => {
  // Base steps for all requests
  const baseSteps: Step[] = [
    { label: 'Borrador', key: 'draft' },
    { label: 'Solicitud', key: 'submitted' },
    { label: 'Revisión', key: 'review' },
    { label: 'Cotización', key: 'quotation' },
    { label: 'Subir comprobantes', key: 'upload_receipts' },
    { label: 'Validar comprobantes', key: 'validate_receipts' },
    { label: 'Fin', key: 'completed' },
  ];

  // If no agency is required, return the base steps
  if (!requiresAgency) {
    return baseSteps;
  }

  // Insert the agency step if any request requires it
  const completeSteps = [
    ...baseSteps.slice(0, 3), // From Borrador to Revisión
    { label: 'Agencia de viajes', key: 'agency' },
    ...baseSteps.slice(3), // From Cotización to Fin
  ];

  return completeSteps;
};

/**
 * Determines the active step of the request
 * @param {string} status - Current status of the request
 * @param {boolean} requiresAgency - Indicates if the request requires an agency step
 * @returns {{ index: number; isError: boolean }} Object containing the active step index and error state
 */
const getActiveIndex = (
  status: string,
  requiresAgency: boolean
): { index: number; isError: boolean } => {
  // Define statuses that indicate an error state
  const isError =
    status === 'Rechazado' ||
    status === 'Cancelado' ||
    status === 'Rechazada' ||
    status === 'Cancelada';

  // Map each status to its corresponding step index
  const statusMap = {
    'Borrador': 0,
    'Revisión': 2,
    'Primera Revisión': 2,
    'Segunda Revisión': 2,
    'Atención Agencia de Viajes': requiresAgency ? 3 : -1,
    'Cotización del Viaje': requiresAgency ? 4 : 3,
    'Comprobación gastos del viaje': requiresAgency ? 5 : 4,
    'Validación de comprobantes': requiresAgency ? 6 : 5,
    'Finalizado': -2,
    'Completado': -2,
    'Aprobado': -2,
  };

  // If the status indicates an error, return the error state with a default index
  if (isError) {
    return { index: 2, isError: true };
  }

  // Get the index from the status map, defaulting to 0 if not found
  const index = statusMap[status as keyof typeof statusMap] ?? 0;

  if (index === -2) {
    // If the status indicates completion, set the index to the last step
    return { index: getSteps(requiresAgency).length - 1, isError: false };
  }

  // Ensure the index is not negative in case of unrecognized status
  // and return it with the error state
  return { index: Math.max(0, index), isError: false };
};

/**
 * Get the status of a step based on its index and the active index
 * @param {number} stepIndex - Index of the step being evaluated
 * @param {number} activeIndex - Index of the currently active step
 * @param {boolean} isCompleted - Indicates if the request is completed
 * @returns {'completed' | 'active' | 'pending'} Status of the step for styling purposes
 */
const getStepStatus = (
  stepIndex: number,
  activeIndex: number,
  isCompleted: boolean
): "completed" | "active" | "pending" => {
  if (isCompleted) {
    return "completed";
  }

  if (stepIndex === activeIndex) {
    return "active";
  }

  if (stepIndex < activeIndex) {
    return "completed";
  }

  return 'pending';
};

/**
 * Request Stepper Component
 * Displays the progress of a travel request through its various stages
 * @param {string} currentStatus - Current status of the request
 * @param {boolean} requiresAgency - Indicates if the request requires an agency step
 * @param {number} authorizationLevel - Current authorization level (if applicable)
 * @param {number | null} authorizationLevelsTotal - Total number of authorization levels (if applicable)
 * @returns {JSX.Element} The rendered stepper component
 */
export const RequestStepper: React.FC<Props> = ({
  currentStatus,
  requiresAgency,
  authorizationLevel,
  authorizationLevelsTotal,
}) => {
  // Get the steps and active index based on the current status and agency requirement
  const steps = getSteps(requiresAgency);
  const { index: activeIndex, isError } = getActiveIndex(
    currentStatus,
    requiresAgency
  );

  // Check if the request is in a completed state
  const isCompleted = currentStatus === 'Finalizado' || currentStatus === 'Completado' || currentStatus === 'Aprobado';

  // Get the label for a step, adding authorization level info if it's the review step
  const getStepLabel = (step: Step): string => {
    if (step.key === 'review' && authorizationLevel !== undefined) {
      if (authorizationLevelsTotal) {
        return `${step.label} ${authorizationLevel + 1}/${authorizationLevelsTotal}`;
      }
      return `${step.label} #${authorizationLevel + 1}`;
    }
    return step.label;
  };

  return (
    <div>
      {steps.map((step, idx) => {
        const status = getStepStatus(idx, activeIndex, isCompleted);
        const isLast = idx === steps.length - 1;

        // Base classes for circles and labels
        let circleClasses = "w-8 h-8 rounded-full flex items-center justify-center font-semibold";
        let labelClasses = 'text-sm font-medium';

        // Assign colors based on status
        if (status === 'completed') {
          circleClasses += " bg-green-500 text-white";
          labelClasses += " text-text-primary";
        } else if (status === 'active') {
          if (isError) {
            circleClasses += " bg-red-400 text-white";
            labelClasses += " text-red-400 font-semibold";
          } else {
            circleClasses += " bg-secondary text-white";
            labelClasses += " text-text-primary font-semibold";
          }
        } else {
          circleClasses += " text-text-secondary border border-border";
          labelClasses += " text-text-secondary";
        }

        return (
          <div key={step.key} className="flex items-stretch">
            {/* Circles and connecting lines */}
            <div className="flex flex-col items-center mr-2">
              {/* Circle with number or checkmark */}
              <div className={circleClasses}>
                {status === 'completed' ? (
                  <Icon name="done" style={{ fontSize: '1.5rem' }} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              {/* Connecting line below (except for last item) */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 my-1 ${
                    status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-border'
                  }`}
                  style={{ minHeight: '1rem' }}
                />
              )}
            </div>

            {/* Label and state */}
            <div className="flex flex-col justify-start mt-2">
              <span className={labelClasses}>{getStepLabel(step)}</span>
              {status === 'active' && !isError && (
                <span className="text-xs text-secodary">En proceso</span>
              )}
              {status === 'active' && isError && (
                <span className="text-xs text-red-400">Rechazado</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RequestStepper;
