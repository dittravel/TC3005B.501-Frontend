/**
 * Button Component
 * 
 * Reusable button component with configurable variants, sizes, and colors.
 * Supports different button styles and automatically applies appropriate styling
 * based on the provided props.
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'border' | 'empty' | 'link';
  size?: 'small' | 'medium' | 'big' | 'custom';
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  customSizeClass?: string;
  href?: string;
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
  const base = `
    block rounded font-medium cursor-pointer
    disabled:opacity-30 disabled:cursor-not-allowed
  `;
  const variantMap = {
    filled: "border border-text-primary/20",
    border: "border",
    empty: "border-none bg-transparent",
    link: "border-none bg-transparent hover:underline",
  };
  const sizeMap = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2 text-base",
    big: "px-6 py-3 text-lg",
    custom: customSizeClass,
  };
  const colorMap = {
    primary: "border border-text-primary/20 bg-gray-600 text-white hover:opacity-80",
    secondary: "border border-text-primary/20 bg-secondary text-white hover:opacity-80",
    success: "border border-text-primary/20 bg-success-500 text-white hover:opacity-80",
    warning: "border border-text-primary/20 bg-warning-300 text-white hover:opacity-80",
  };

  // Special handling for link variant
  if (variant === "link") {
    const linkColorMap = {
      primary: "text-primary hover:text-primary/80",
      secondary: "text-secondary",
      success: "text-success-500",
      warning: "text-warning-500",
    };
    return `${base} ${sizeMap[size]} ${variantMap[variant]} ${linkColorMap[color]}`.trim();
  }

  // Special handling for border variant
  if (variant === "border") {
    const borderColorMap = {
      primary: "border-text-primary/60 text-text-primary/60 hover:opacity-70",
      secondary: "border-secondary text-secondary hover:opacity-70",
      success: "border-success-500 text-success-500 hover:opacity-70",
      warning: "border-warning-500 text-warning-500 hover:opacity-70",
    };
    return `${base} ${sizeMap[size]} ${variantMap[variant]} ${borderColorMap[color]}`.trim();
  }

  const sizeClass = sizeMap[size];
  return `${base} ${sizeClass} ${customSizeClass} ${colorMap[color]}`.trim();
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
  href,
  className: customClassName = "",
  ...props
}: ButtonProps) {
  const baseClassName = getClasses({ variant, size, color, customSizeClass });
  const className = `${baseClassName} ${customClassName}`.trim();

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
}
