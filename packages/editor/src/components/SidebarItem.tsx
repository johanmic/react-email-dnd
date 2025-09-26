import type { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';

export interface SidebarItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function SidebarItem({ id, children, className }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx('email-dnd-sidebar-item', className)}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
