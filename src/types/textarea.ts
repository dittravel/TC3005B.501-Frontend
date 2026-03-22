/**
* Textarea
* 
* Defines the structure and props for textarea components
* used in forms across the application.
*/

export interface TextareaProps {
  label?: string;
  name: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}
