import type { ReactNode } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
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

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `sidebar-drop-${id}`,
    data: {
      type: 'sidebar-drop',
      originalId: id,
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
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={clsx(className, {
        'cursor-grab select-none outline-none': !daisyui,
        'opacity-60': isDragging,
        'btn btn-primary btn-soft text-xs text-start rounded-box': daisyui,
        'ring-2 ring-blue-500 ring-opacity-50': isOver && !isDragging,
      })}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
