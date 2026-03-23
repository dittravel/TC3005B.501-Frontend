/**
 * Status Mapper Utility
 * 
 * Mapping of request statuses to tag color types.
 * Used to ensure consistent status styling throughout the application.
 */

import type { TagType } from '@/types/card';

/**
 * Maps travel request status strings to Tag color types
 */
export const statusColorMap: Record<string, TagType> = {
  // Completed states
  'Finalizado': 'success',
  'Aprobado': 'success',
  'Completado': 'success',
  
  // Rejected states
  'Rechazado': 'alert',
  'Cancelado': 'warning',
  
  // Draft states
  'Borrador': 'default',
  'Draft': 'default',
  
  // In-progress states
  'Primera Revisión': 'primary',
  'Segunda Revisión': 'alert',
  'Cotización del Viaje': 'warning',
  'Atención Agencia de Viajes': 'primary',
  'Comprobación gastos del viaje': 'secondary',
  'Validación de comprobantes': 'special',
  'Pendiente': 'warning',
  'En revisión': 'primary',
  
  // Default fallback
  'Desconocido': 'secondary',
};

/**
 * Converts a status string to a Tag color type
 * @param status - The status string to convert
 * @returns Tag color type for the status
 */
export function getStatusTagType(status: string | undefined): TagType {
  if (!status) return 'secondary';
  return statusColorMap[status] || statusColorMap['Desconocido'];
}
