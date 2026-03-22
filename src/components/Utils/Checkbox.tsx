/**
 * Checkbox Component
 * 
 * Reusable checkbox component for form inputs
 * 
 */

import type { CheckboxProps } from '@/types/checkbox';

export default function Checkbox(props: CheckboxProps) {
  // Default props for the component
  const {
    label,
    name,
    value = '',
    checked = false,
    disabled = false,
    onChange,
    className = '',
  } = props;

  return (
    <label className={`
      flex items-center justify-between gap-3 px-4 py-3 rounded-md border cursor-pointer
      ${checked ? 'bg-secondary/10 border-secondary' : 'bg-card border-border'}
      ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-secondary'}
      ${className}
    `}>
      <span className={`text-sm font-medium ${disabled ? 'text-text-secondary' : 'text-text-primary'}`}>
        {label}
      </span>
      
      <input
        type="checkbox"
        id={name}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="hidden"
      />
      
      {/* Icon Circle */}
      <div className="flex-shrink-0">
        {checked ? (
          <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-border" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" />
          </svg>
        )}
      </div>
    </label>
  );
}
