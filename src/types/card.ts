/**
 * Card Component Types
 * 
 * Types for the generic Card component
 */

export type TagType = 'primary' | 'secondary' | 'success' | 'alert' | 'warning' | 'default' | 'special';

export interface CardTag {
  text: string;
  type?: TagType;
}

export interface CardProps {
  tag?: CardTag;
  status?: CardTag;
  href?: string;
  children: React.ReactNode;
  className?: string;
}
