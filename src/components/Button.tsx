/**
 * Button Component
 * 
 * Reusable button component with configurable variants, sizes, and colors.
 * Supports different button styles and automatically applies appropriate styling
 * based on the provided props.
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'border' | 'empty';
  size?: 'small' | 'medium' | 'big' | 'custom';
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  customSizeClass?: string;
}

/**
 * Generates CSS classes for the button based on variant, size, and color props.
 * Maps size and color options to their corresponding Tailwind CSS classes.
 * @param {Object} options - Configuration object
 * @param {string} options.variant - Button variant style
 * @param {string} options.size - Button size
 * @param {string} options.color - Button color scheme
 * @param {string} options.customSizeClass - Custom size classes for 'custom' size option
 * @returns {string} Combined Tailwind CSS class string
 */
const getClasses = ({
  variant,
  size,
  color,
  customSizeClass = "",
}: Required<Pick<ButtonProps, 'variant' | 'size' | 'color' | 'customSizeClass'>>) => {
  const base = "rounded font-medium cursor-pointer";
  const sizeMap = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2 text-base",
    big: "px-6 py-3 text-lg",
    custom: customSizeClass,
  };
  const colorMap = {
    primary: "bg-primary-300 hover:bg-primary-400 text-white",
    success: "bg-success-300 hover:bg-success-400 text-white",
    warning: "bg-warning-300 hover:bg-warning-400 text-white",
    secondary: "bg-gray-400 hover:bg-gray-500 text-white",
  };
  return `${base} ${sizeMap[size]} ${colorMap[color]}`;
};

/**
 * Button Component
 * @param {ButtonProps} props - Button properties including variant, size, color, and HTML button attributes
 * @returns {JSX.Element} Rendered button element with applied styles
 */
export default function Button({
  children,
  customSizeClass = "",
  variant = "filled",
  size = "medium",
  color = "primary",
  ...props
}: ButtonProps) {
  const className = getClasses({ variant, size, color, customSizeClass });

  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
}
