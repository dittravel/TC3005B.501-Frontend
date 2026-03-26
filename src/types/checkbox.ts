/**
* Checkbox
* 
* Defines the structure and props for checkbox components
* used in forms across the application.
*/

export interface CheckboxProps {
  label: string;
  name: string;
  value?: string | number;
  checked?: boolean;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
