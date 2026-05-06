/**
 * Icon component that renders Material Symbols icons
 * 
 * Material Symbols was chosen because it loads way faster than
 * Material Icons (previously used).
 * 
 * This is because Atro uses server-side rendering, and importing
 * icons from the Material Icons library caused a significant performance hit.
 */
interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'outlined' | 'filled' | 'rounded' | 'sharp' | 'two-tone';
  onClick?: () => void;
}

/**
 * Icon Component
 * Renders a Material Symbol icon based on the provided name and variant.
 * Supports click events and custom styling.
 * @param {string} name - The name of the Material Symbol to render
 * @param {string} [className] - Additional CSS classes for styling
 * @param {React.CSSProperties} [style] - Inline styles to apply to the icon
 * @param {'outlined' | 'filled' | 'rounded' | 'sharp' | 'two-tone'} [variant='outlined'] - The style variant of the icon
 * @param {function} [onClick] - Optional click handler for the icon
 * @returns {JSX.Element} A span element containing the Material Symbol icon
 */
export default function Icon({
  name,
  className = '',
  style,
  variant = 'outlined',
  onClick
}: IconProps) {
  const symbolClass = `material-symbols-${variant}`;

  return (
    <span
      className={`${symbolClass} ${className}`}
      style={{
        ...style
      }}
      onClick={onClick}
    >
      {name}
    </span>
  );
}
