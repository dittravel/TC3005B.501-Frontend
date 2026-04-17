/**
* Input Types and Patterns
* 
* Defines the structure and validation patterns for various input
* types used in forms across the application.
*/

export interface BaseInputProps {
  label?: string;
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
}

export type InputTypes =
| 'text'
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
  email: '^[^ @]+@[^ @]+\\.[^ @]+$',
  tel: '^\\+?[0-9 \\-]{7,15}$',
  url: 'https?://.+',
  password: undefined,
  number: '^\\d+$',
  date: '^\\d{4}-\\d{2}-\\d{2}$',
  time: undefined,
  file: undefined,
};  