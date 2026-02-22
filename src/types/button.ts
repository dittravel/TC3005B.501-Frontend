/**
 * Button configuration utilities
 * 
 * Defines valid button types, sizes, colors.
 * Used for consistent and scalable button rendering across the application.
 */

export const allowedVariants = ['filled', 'border', 'empty'] as const;
export const allowedColors = ['primary', 'secondary', 'success', 'warning'] as const;
export const allowedSizes = ['small', 'medium', 'big', 'custom'] as const;

export type ButtonVariant = (typeof allowedVariants)[number];
export type ButtonColor = (typeof allowedColors)[number];
export type ButtonSize = (typeof allowedSizes)[number];

// Props for getButtonClasses function, defining the expected parameters for button styling
export interface ButtonClassesProps {
  variant: ButtonVariant;
  disabled?: boolean;
  color?: ButtonColor;
  size?: ButtonSize;
  customSizeClass?: string;
  extraClass?: string;
}

// Predefined size classes for standard button sizes
const sizeClasses = {
  small: 'px-2 py-1 text-xs',
  medium: 'px-4 py-2 text-sm',
  big: 'px-6 py-3 text-base',
};

// Color configuration for each button
const colorMap = {
  primary: {
    bg: 'bg-[var(--color-primary-300)]',
    hover: 'hover:bg-[var(--color-primary-400)]',
    active: 'active:bg-[var(--color-primary-500)]',
    baseText: 'text-white',
    text: 'text-[var(--color-primary-200)]',
    border: 'border-[var(--color-primary-200)]',
    hoverBorder: 'hover:border-[var(--color-primary-100)]',
    activeBorder: 'active:border-[var(--color-primary-300)]',
    hoverText: 'hover:text-[var(--color-primary-100)]',
    activeText: 'active:text-[var(--color-primary-300)]',
    ring: 'focus:ring-[var(--color-primary-100)]',
  },
  secondary: {
    bg: 'bg-[var(--color-secondary-400)]',
    hover: 'hover:bg-[var(--color-secondary-500)]',
    active: 'active:bg-[var(--color-secondary-500)]',
    baseText: 'text-white',
    text: 'text-[var(--color-secondary-200)]',
    border: 'border-[var(--color-secondary-200)]',
    hoverBorder: 'hover:border-[var(--color-secondary-100)]',
    activeBorder: 'active:border-[var(--color-secondary-300)]',
    hoverText: 'hover:text-[var(--color-secondary-100)]',
    activeText: 'active:text-[var(--color-secondary-300)]',
    ring: 'focus:ring-[var(--color-secondary-100)]',
  },
  success: {
    bg: 'bg-[var(--color-success-200)]',
    hover: 'hover:bg-[var(--color-success-100)]',
    active: 'active:bg-[var(--color-success-300)]',
    baseText: 'text-white',
    text: 'text-[var(--color-success-200)]',
    border: 'border-[var(--color-success-200)]',
    hoverBorder: 'hover:border-[var(--color-success-100)]',
    activeBorder: 'active:border-[var(--color-success-300)]',
    hoverText: 'hover:text-[var(--color-success-100)]',
    activeText: 'active:text-[var(--color-success-300)]',
    ring: 'focus:ring-[var(--color-success-100)]',
  },
  warning: {
    bg: 'bg-[var(--color-warning-200)]',
    hover: 'hover:bg-[var(--color-warning-100)]',
    active: 'active:bg-[var(--color-warning-300)]',
    baseText: 'text-white',
    text: 'text-[var(--color-warning-200)]',
    border: 'border-[var(--color-warning-200)]',
    hoverBorder: 'hover:border-[var(--color-warning-100)]',
    activeBorder: 'active:border-[var(--color-warning-300)]',
    hoverText: 'hover:text-[var(--color-warning-100)]',
    activeText: 'active:text-[var(--color-warning-300)]',
    ring: 'focus:ring-[var(--color-warning-100)]',
  },
};

/**
 * Generates the appropriate CSS classes for a button based on its variant, color, size, and state (disabled or not).
 * @param variant - The style variant of the button (filled, border, empty).
 * @param disabled - Whether the button is disabled, affecting its appearance and cursor.
 * @param color - The color theme of the button (primary, secondary, success, warning).
 * @param size - The size of the button (small, medium, big, custom).
 * @param customSizeClass - Custom CSS classes for sizing when size is set to 'custom'.
 * @param extraClass - Additional CSS classes to be added to the button for further customization.
 * @returns A string of concatenated CSS classes to be applied to the button element.
 */
export function getButtonClasses({
  variant,
  disabled = false,
  color = 'primary',
  size = 'medium',
  customSizeClass = '',
  extraClass = '',
}: ButtonClassesProps): string {
  const safeColor = colorMap[color] ?? colorMap.primary;
  const sizeClass = size === 'custom' ? customSizeClass : sizeClasses[size] ?? sizeClasses.medium;

  const base = `rounded-md font-medium transition-all duration-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${safeColor.ring}`;

  const variants = {
    filled: disabled
      ? 'bg-[var(--color-neutral-300)] text-text-secondary'
      : `${safeColor.bg} ${safeColor.baseText} ${safeColor.hover} ${safeColor.active}`,

    border: disabled
      ? 'border border-[var(--color-neutral-400)] text-[var(--color-neutral-400)] bg-transparent'
      : `border bg-transparent ${safeColor.text} ${safeColor.border} ${safeColor.hoverBorder} ${safeColor.hoverText} ${safeColor.activeBorder} ${safeColor.activeText}`,

    empty: disabled
      ? 'text-[var(--color-neutral-400)] bg-transparent'
      : `bg-transparent ${safeColor.text} ${safeColor.hoverText} ${safeColor.activeText}`,
  };

  return `${sizeClass} ${base} ${variants[variant]} ${extraClass}`.trim();
}