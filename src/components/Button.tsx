/**
 * Button component for the application.
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'border' | 'empty' | 'link';
  size?: 'small' | 'medium' | 'big' | 'custom';
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  customSizeClass?: string;
  href?: string;
}


const getClasses = ({
  variant,
  size,
  color,
  customSizeClass = "",
}: Required<Pick<ButtonProps, 'variant' | 'size' | 'color' | 'customSizeClass'>>) => {
  const base = "block rounded font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
  const variantMap = {
    filled: "border-none",
    border: "border-2 border-current bg-transparent",
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
    primary: "bg-primary-300 hover:bg-primary-300/80 text-white",
    secondary: "bg-secondary hover:bg-secondary/80 text-white",
    success: "bg-success-500 hover:bg-success-500/80 text-white",
    warning: "bg-warning-300 hover:bg-warning-300/80 text-white",
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

  const sizeClass = sizeMap[size];
  return `${base} ${sizeClass} ${customSizeClass} ${colorMap[color]}`.trim();
};


export default function Button({
  children,
  customSizeClass = "",
  variant = "filled",
  size = "medium",
  color = "primary",
  href,
  ...props
}: ButtonProps) {
  const className = getClasses({ variant, size, color, customSizeClass });

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
