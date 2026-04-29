/**
* Tag Component
* 
* A reusable tag/badge component with different types and styles.
* Used to display labels, statuses, categories, etc.
*/

import type { TagProps } from '@/types/tag';

/**
 * Returns the appropriate CSS classes based on the tag type.
 * Maps each tag type to a specific background and text color combination.
 * @param {string} type - The type of the tag (e.g., 'primary', 'secondary', etc.)
 * @returns {string} A string of Tailwind CSS classes for styling the tag.
 */
const getTypeClasses = (type: TagProps['type']) => {
  switch (type) {
    case 'primary':
      return 'bg-primary-100 text-text-primary';
    case 'secondary':
      return 'bg-secondary/20 text-text-primary';
    case 'success':
      return 'bg-success-100/20 text-text-primary';
    case 'warning':
      return 'bg-warning-100/20 text-text-primary';
    case 'alert':
      return 'bg-alert-300/40 text-text-primary';
    case 'special':
      return 'bg-purple-500/20 text-text-primary';
    default:
      return 'bg-primary-100 text-text-primary';
  }
};

/**
 * Returns the appropriate CSS classes based on the tag size.
 * Maps each size to specific padding and font size.
 * @param {string} size - The size of the tag ('small', 'medium', 'large')
 * @returns {string} A string of Tailwind CSS classes for sizing the tag.
 */
const getSizeClasses = (size: TagProps['size']) => {
  switch (size) {
    case 'small':
      return 'px-2 py-0.5 text-xs';
    case 'medium':
      return 'px-3 py-1 text-sm';
    case 'large':
      return 'px-4 py-2 text-lg';
    default:
      return 'px-2 py-0.5 text-sm';
  }
};

/**
 * A reusable tag/badge component with different types and styles.
 * @param {string} text - The text to display inside the tag.
 * @param {'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'alert'} type - The type of the tag to determine its color scheme (default: 'default').
 * @param {'small' | 'medium' | 'large'} size - The size of the tag (default: 'small').
 * @param {string} className - Additional CSS classes to apply to the tag for custom styling.
 * @returns {JSX.Element} A styled tag component with the specified text and type.
 */
export default function Tag({
  text,
  type = 'default',
  size = 'small',
  className = '',
}: TagProps) {
  const typeClasses = getTypeClasses(type);
  const sizeClasses = getSizeClasses(size);
  return (
    <span className={`inline-block border border-text-primary/20 font-medium rounded-full ${typeClasses} ${sizeClasses} ${className}`}>
      {text}
    </span>
  );
}