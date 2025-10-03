import type { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';

export interface SidebarItemProps {
  id: string;
  children: ReactNode;
  className?: string;
  data?: Record<string, unknown>;
  daisyui?: boolean;
}

export function SidebarItem({ id, children, className, data, daisyui = false }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type: 'sidebar-item',
      itemId: id,
      ...data,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.6 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(className, {
        'cursor-grab select-none outline-none': !daisyui,
        'opacity-60': isDragging,
        'btn btn-primary btn-soft gap-2 rounded-lg': daisyui,
      })}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
