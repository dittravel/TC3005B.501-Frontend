/**
 * Date formatting utilities
 * Provides helper functions for formatting dates across the application
 */

/**
 * Formats a date string to YYYY-MM-DD format
 * Removes time and timezone information
 * 
 * @param {string | Date} date - The date to format
 * @returns {string} Formatted date in YYYY-MM-DD format, or empty string if invalid
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date with time
 * 
 * @param {string | Date} date - The date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return '';
  }
};
