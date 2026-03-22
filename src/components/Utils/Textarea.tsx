/**
 * Textarea Component
 * 
 * Reusable textarea component for form inputs
 * 
 */

import type { TextareaProps } from '@/types/textarea';

export default function Textarea(props: TextareaProps) {
  // Default props for the component
  const {
    label,
    name,
    placeholder = '',
    value,
    required = false,
    error = '',
    disabled = false,
    rows = 4,
    onChange,
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
    ${disabled ? 'bg-neutral-50 cursor-not-allowed' : ''}
    ${className}`.trim();
  const errorId = name ? `${name}-error` : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-primary mb-1">
          {label} {required && <span className="text-warning-300">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        className={classes}
        required={required}
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={onChange}
      />
      {error && (
        <p id={errorId} className="pl-2 text-xs text-warning-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
