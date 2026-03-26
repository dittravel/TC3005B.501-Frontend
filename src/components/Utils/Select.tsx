/**
  * Input Component
  * 
  * Reusable select component for form inputs
  * 
  */

import type { SelectProps } from '@/types/select';

/**
 * Select Component
 * @param {SelectProps} props - The properties for the select component
 * @returns {JSX.Element} The rendered select component
 */
export default function Input(props: SelectProps) {
  // Default props for the component
  const {
    label,
    value,
    disabled = false,
    error,
    name,
    required,
    onChange,
    children,
    className = '',
  } = props;
  
  // Styles
  const base = `
    w-full border border-border rounded-md px-3 py-2
    text-text-primary placeholder:text-text-secondary
    bg-card focus:outline-none focus:border-secondary
    focus:ring-1 focus:ring-secondary
  `;
  const classes = `
    ${base}
    ${error ? 'border-warning-500' : 'border-border'}
    ${disabled ? 'text-text-secondary cursor-not-allowed' : ''}
    ${className}
  `.trim();
  const errorId = name ? `${name}-error` : undefined;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-primary mb-1">
          {label} {required && <span className="text-warning-300">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={classes}
        disabled={disabled}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="pl-2 text-xs text-warning-500 mt-1">
        {error}
        </p>
      )}
    </div>
  );
}

