/**
* Generic Card Component
* 
* Simple, flexible card with:
* - Header: tag (left) and status (right)
* - Content: flexible grid
*/

import Tag from '@/components/Utils/Tag';
import type { CardProps } from '@/types/card';

export default function Card({
  tag,
  status,
  href,
  children,
  className = '',
}: CardProps) {
  
  const cardInner = (
    <>
      {/* Header */}
      {(tag || status) && (
        <div className="flex justify-between items-start gap-2 mb-4 pb-3 border-b border-border">
          {tag && <Tag text={tag.text} type={tag.type} size="small" />}
          {status && <Tag text={status.text} type={status.type} size="small" />}
        </div>
      )}
      
      {/* Content */}
      {children}
    </>
  );
  
  if (href) {
    return (
      <a href={href}>
        <div className={`content-wrapper mb-4 ${className}`}>
          {cardInner}
        </div>
      </a>
    );
  }
  
  return (
    <div className={`card mb-4 ${className}`}>
      {cardInner}
    </div>
  );
}
