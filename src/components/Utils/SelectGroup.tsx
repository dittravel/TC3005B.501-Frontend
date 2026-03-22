/**
 * SelectGroup Component
 * 
 * Reusable component for rendering a group of checkboxes.
 * Manages multiple checkbox selections and provides a Set-based API.
 */

import Checkbox from '@/components/Utils/Checkbox';
import type { SelectGroupProps } from '@/types/selectGroup';

export default function SelectGroup({
  name,
  label,
  items,
  selectedValues,
  onChange,
  disabled = false,
  className = '',
  helpText,
}: SelectGroupProps) {
  const handleCheckboxChange = (itemId: string | number) => {
    const newSet = new Set(selectedValues);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    onChange(newSet);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {items.map((item) => (
          <Checkbox
            key={item.id}
            name={`${name}-${item.id}`}
            label={item.label}
            value={item.value ?? item.id}
            checked={selectedValues.has(item.id)}
            disabled={disabled || item.disabled}
            onChange={() => handleCheckboxChange(item.id)}
          />
        ))}
      </div>

      {helpText && (
        <p className="text-xs text-text-secondary">
          {helpText}
        </p>
      )}
    </div>
  );
}
