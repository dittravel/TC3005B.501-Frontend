/**
 * Accessibility Button
 * 
 * Provides a button to allow users to switch between different font options
 */

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/Utils/Icon';
import Select from '@/components/Utils/Select';

/**
 * Accessibility Button Component
 * Provides a button to allow users to switch between different font options
 * @returns {JSX.Element} A button with a dropdown to select font options for accessibility
 */
export default function AccessibilityButton() {
  const [currentFont, setCurrentFont] = useState<string>('roboto');
  const [currentSize, setCurrentSize] = useState<string>('mediano');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Reference to menu container for click-outside detection
  const menuRef = useRef<HTMLDivElement>(null);

  // Read saved preferences from localStorage and apply them
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const savedFont = localStorage.getItem('fontFamily') || 'roboto';
      const savedSize = localStorage.getItem('textSize') || 'mediano';
      setCurrentFont(savedFont);
      setCurrentSize(savedSize);
      applyFont(savedFont);
      applyTextSize(savedSize);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener for clicks outside the menu
    document.addEventListener("mousedown", handleClickOutside);

    setMounted(true);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply the selected font to the html element and save in localStorage
  const applyFont = (fontId: string) => {
    const html = document.documentElement;
    html.classList.remove('font-roboto', 'font-opendyslexic');
    html.classList.add(`font-${fontId}`);
    localStorage.setItem('fontFamily', fontId);
  };

  // Apply the selected text size to the html element and save in localStorage
  const applyTextSize = (sizeId: string) => {
    const html = document.documentElement;
    html.classList.remove('text-pequeno', 'text-mediano', 'text-grande');
    html.classList.add(`text-${sizeId}`);
    localStorage.setItem('textSize', sizeId);
  };

  // Handle font change from dropdown selection
  const handleFontChange = (fontId: string) => {
    setCurrentFont(fontId);
    applyFont(fontId);
  };

  // Handle text size change from dropdown selection
  const handleSizeChange = (sizeId: string) => {
    setCurrentSize(sizeId);
    applyTextSize(sizeId);
  };

  if (!mounted) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:opacity-80 cursor-pointer"
        title="Accesibilidad"
      >
        <Icon name="accessibility" style={{ fontSize: '1.5rem' }} />
      </button>

      {isOpen && (
        <div className="absolute top-full w-60 left-1/2 -translate-x-1/2 mt-2
          bg-card shadow-xl rounded-lg
          p-4 z-50 border border-border"
        >
          <div className="space-y-4">
            {/* Text size */}
            <Select
              label="Tamaño de Texto"
              name="sizeSelect"
              value={currentSize}
              onChange={(e) => handleSizeChange(e.target.value)}
            >
              <option value="pequeno">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </Select>
            {/* Font family */}
            <Select
              label="Fuente de Texto"
              name="fontSelect"
              value={currentFont}
              onChange={(e) => handleFontChange(e.target.value)}
            >
              <option value="roboto">Regular</option>
              <option value="opendyslexic">Open Dyslexic</option>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
