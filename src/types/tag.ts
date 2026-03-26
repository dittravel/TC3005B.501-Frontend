/**
* Tag Props
* 
* Defines the properties for the Tag component, which is used to display categorized labels with different styles and sizes.
*/

export interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'alert' | 'special';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}