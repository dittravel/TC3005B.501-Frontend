/**
* Select
* 
* Defines the structure and validation patterns for various option types
* used in select dropdowns across the application.
*/

export interface SelectProps {
  label: string;
  value: string | number;
  disabled?: boolean;
  error?: string;
  name: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}