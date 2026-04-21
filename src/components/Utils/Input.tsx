/**
 * Input Component
 * 
 * Reusable input component for form inputs
 * 
 */

import type { BaseInputProps } from '@type/input.ts';
import { InputPatterns } from '@type/input.ts';

/**
 * Input Component
 * @param {BaseInputProps} props - The properties for the input component
 * @returns {JSX.Element} The rendered input component
 */
export default function Input(props: BaseInputProps) {
  // Default props for the input component
	const {
		label,
		name,
		placeholder = '',
		value,
		defaultValue,
		required = false,
		error = '',
		disabled = false,
		type = 'text',
		pattern,
		onChange,
		className = '',
		autoComplete = 'on',
		min,
		max,
		altText,
		accept,
	} = props;

	const finalPattern = pattern ?? InputPatterns[type as keyof typeof InputPatterns];

  // Styles for the input component
	const base = `
    w-full rounded-md px-3 py-2
    text-text-primary placeholder:text-text-secondary
    bg-card focus:outline-none
    ${type === 'file'
      ? 'border-2 border-dashed border-border focus:border-secondary focus:ring-0 cursor-pointer hover:border-secondary/70'
      : 'border border-border focus:border-secondary focus:ring-1 focus:ring-secondary'
    }
  `;
	const classes = `
    ${base}
    ${error ? 'border-warning-500' : ''}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}
  `.trim();
	const errorId = name ? `${name}-error` : undefined;

	return (
		<div>
			{label && (
				<label htmlFor={name} className="block text-sm font-medium text-text-primary mb-1">
					{label} {required && <span className="text-warning-300">*</span>}
				</label>
			)}
			<input
				id={name}
				name={name}
				type={type}
				placeholder={placeholder}
				className={classes}
				required={required}
				disabled={disabled}
				pattern={finalPattern}
				value={value}
				defaultValue={defaultValue}
				onChange={onChange}
				autoComplete={autoComplete}
				min={min}
				max={max}
				accept={accept}
			/>
			{altText && (
				<p className="text-xs text-text-secondary mt-1">
					{altText}
				</p>
			)}
			{error && (
				<p id={errorId} className="pl-2 text-xs text-warning-500 mt-1">
					{error}
				</p>
			)}
		</div>
	);
}

