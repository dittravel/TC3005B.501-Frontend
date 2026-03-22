/**
* Tag component for displaying labels, statuses, categories, etc.
* Supports different types, variants, and sizes for flexible styling.
*/

export interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'alert' | 'special';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}