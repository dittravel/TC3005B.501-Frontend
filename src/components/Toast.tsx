/**
 * Toast component for displaying temporary notification messages.
 */

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default function Toast({ message, type, duration = 4000 }: Props) {
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);

    const timer = setTimeout(() => {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const baseStyle = `
    fixed top-25 right-0 z-50 w-[320px] max-w-full
    transition-transform duration-300 ease-in-out
    ${animate ? 'translate-x-0' : 'translate-x-full'}
  `;

  const typeStyle = {
    success: 'bg-success-50 border-success-500 text-success-400',
    error: 'bg-warning-50 border-warning-500 text-warning-500',
    info: 'bg-primary-50 border-primary-500 text-primary-500',
    warning: 'bg-alert-50 border-alert-400 text-alert-400',
  };

  return (
    <div className={`${baseStyle}`}>
      <div className={`border-l-4 p-4 rounded shadow-md relative ${typeStyle[type]}`}>
        <div className="font-medium">{message}</div>
      </div>
    </div>
  );
}
