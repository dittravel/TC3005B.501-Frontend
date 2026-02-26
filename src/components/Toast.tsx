/**
 * Toast Component
 * 
 * Displays a notification toast message that automatically disappears after a specified duration.
 * Supports different types (success, error, info, warning) with corresponding styling.
 * Includes smooth slide-in/slide-out animations.
 */

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

/**
 * Toast Component
 * Renders a dismissible toast notification with auto-hide functionality.
 * @param {Props} props - Toast properties including message, type, and duration
 * @param {string} props.message - The message text to display
 * @param {string} props.type - The toast type (success, error, info, warning)
 * @param {number} props.duration - How long to show the toast in milliseconds (default: 4000)
 * @returns {JSX.Element | null} Rendered toast or null if not visible
 */
export default function Toast({ message, type, duration = 4000 }: Props) {
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  /**
   * Sets up the auto-hide timer and animation sequence for the toast.
   * Triggers the exit animation after the specified duration.
   */
  useEffect(() => {
    // Trigger entrance animation
    setAnimate(true);

    // Set up timer for exit animation
    const timer = setTimeout(() => {
      setAnimate(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setVisible(false), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // Don't render if not visible
  if (!visible) return null;

  // Base styles for toast positioning and animation
  const baseStyle = `
    fixed top-25 right-0 z-50 w-[320px] max-w-full
    transition-transform duration-300 ease-in-out
    ${animate ? 'translate-x-0' : 'translate-x-full'}
  `;

  // Type-specific styles for different toast notifications
  const typeStyle = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  };

  return (
    <div className={`${baseStyle}`}>
      <div className={`border-l-4 p-4 rounded shadow-md relative ${typeStyle[type]}`}>
        <div className="font-medium">{message}</div>
      </div>
    </div>
  );
}
