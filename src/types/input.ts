/**
* Input Types and Patterns
* 
* Defines the structure and validation patterns for various input
* types used in forms across the application.
*/

export interface BaseInputProps {
  label?: string;
  checked?: boolean; 
  name: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  pattern?: string;
  type?: InputTypes;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  altText?: string;
  accept?: string;
  onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void;
}

export type InputTypes =
| 'text'
| 'checkbox'
| 'email'
| 'tel'
| 'url'
| 'password'
| 'number'
| 'date'
| 'time'
| 'file'

export const InputPatterns: Record<InputTypes, string | undefined> = {
  text: undefined,
  checkbox: undefined,
  email: String.raw`^[^ @]+@[^ @]+\.[^ @]+$`,
  tel: String.raw`^\+?[0-9 \-]{7,15}$`,
  url: 'https?://.+',
  password: undefined,
  number: String.raw`^\d+$`,
  date: String.raw`^\d{4}-\d{2}-\d{2}$`,
  time: undefined,
  file: undefined,
};  