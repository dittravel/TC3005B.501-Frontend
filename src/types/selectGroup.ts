/**
 * SelectGroup
 * 
 * Defines the structure and props for SelectGroup components
 * used for rendering groups of checkboxes in forms.
 */

export interface SelectGroupItem {
  id: string | number;
  label: string;
  value?: string | number;
  disabled?: boolean;
}

export interface SelectGroupProps {
  name: string;
  label?: string;
  items: SelectGroupItem[];
  selectedValues: Set<string | number>;
  onChange: (values: Set<string | number>) => void;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}
