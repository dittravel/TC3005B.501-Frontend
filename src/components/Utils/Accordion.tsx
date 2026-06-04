/**
 * Accordion component for collapsible content sections
 * 
 * This component shows a header that can be clicked to expand or collapse the content below it.
 */

import { useState } from 'react';
import Icon from '@/components/Utils/Icon';
import Tag from '@/components/Utils/Tag';

interface AccordionProps {
  title: string;
  icon?: string;
  tag?: string;
  children: React.ReactNode;
}

/**
 * Accordion Component
 * Provides a collapsible section with a header that can include an icon and a tag
 * @param {string} title - The title to display in the header of the accordion
 * @param {string} icon - Optional name of the icon to display next to the title
 * @param {string} tag - Optional text to display as a tag on the right side of the header
 * @param {React.ReactNode} children - The content to show when the accordion is expanded
 * @returns {JSX.Element} An accordion component that can be expanded or collapsed by clicking the header
 */
export default function Accordion({ title, icon, tag, children }: AccordionProps) {
  // Open/closed state of the accordion
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className={`
          flex justify-between items-center px-4 py-2 w-full
          border rounded-md cursor-pointer
          hover:border-secondary hover:bg-secondary/10
          transition-colors duration-100
          ${isOpen ? 'border-secondary bg-secondary/10' : 'border-border bg-card-hover'}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && <Icon name={icon} style={{ fontSize: '1.25rem' }} />}
          <p className="text-text-primary font-medium">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {tag && <Tag text={tag} type="secondary" size="small" />}
          <Icon name={isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} />
        </div>
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
}