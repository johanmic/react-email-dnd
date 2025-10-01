import { useState, type CSSProperties } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { DotsSixVerticalIcon, Trash } from '@phosphor-icons/react';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
// Note: React Email components are used for final email rendering,
// but we use HTML elements for the drag-and-drop interface
// import * as ReactEmailComponents from '@react-email/components';
import type { CanvasColumn, CanvasContentBlock, CanvasRow, CanvasSection } from '../types/schema';
import { Button } from './button';
import { Divider } from './divider';
import { Heading } from './heading';
import { Image } from './image';
import { Text } from './text';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { ConfirmModal } from './ConfirmModal';
import { removeColumn, removeRow, removeSection } from '../utils/drag-drop';

export interface CanvasProps {
  sections: CanvasSection[];
  daisyui?: boolean;
}

// Helper component for element type tabs
function ElementTab({ type, daisyui }: { type: 'Section' | 'Row' | 'Column'; daisyui?: boolean }) {
  const getTabColors = () => {
    switch (type) {
      case 'Section':
        return {
          bg: daisyui ? 'bg-primary/20' : 'bg-blue-500/20',
          text: daisyui ? 'text-primary' : 'text-blue-600',
          border: daisyui ? 'border-primary/10' : 'border-blue-500/30',
        };
      case 'Row':
        return {
          bg: daisyui ? 'bg-secondary/20' : 'bg-green-500/20',
          text: daisyui ? 'text-secondary' : 'text-green-600',
          border: daisyui ? 'border-secondary/10' : 'border-green-500/30',
        };
      case 'Column':
        return {
          bg: daisyui ? 'bg-accent/20' : 'bg-purple-500/20',
          text: daisyui ? 'text-accent' : 'text-purple-600',
          border: daisyui ? 'border-accent/10' : 'border-purple-500/30',
        };
      default:
        return {
          bg: daisyui ? 'bg-orange-500' : 'bg-gray-500/20',
          text: daisyui ? 'text-base-content' : 'text-gray-600',
          border: daisyui ? 'border-base-content/10' : 'border-gray-500/30',
        };
    }
  };

  const colors = getTabColors();

  return (
    <div
      className={clsx(
        'absolute -top-2 left-3 px-2 py-1 text-xs font-medium rounded-md border backdrop-blur-sm',
        colors.bg,
        colors.text,
        colors.border,
        'z-10',
      )}
    >
      {type}
    </div>
  );
}

function renderBlock(block: CanvasContentBlock, daisyui?: boolean) {
  switch (block.type) {
    case 'button':
      return <Button {...block.props} daisyui={daisyui} />;
    case 'text':
      return <Text {...block.props} daisyui={daisyui} />;
    case 'heading':
      return <Heading {...block.props} daisyui={daisyui} />;
    case 'divider':
      return <Divider {...block.props} daisyui={daisyui} />;
    case 'image':
      return <Image {...block.props} daisyui={daisyui} />;
    case 'custom':
      return (
        <div
          className={clsx('text-sm capitalize', {
            'text-slate-900': !daisyui,
            'bg-primary/50 text-base-content': daisyui,
          })}
          data-component={block.props.componentName}
        >
          {block.props.componentName}
        </div>
      );
    default:
      return null;
  }
}

function CanvasBlockView({
  block,
  columnId,
  daisyui,
}: {
  block: CanvasContentBlock;
  columnId: string;
  daisyui?: boolean;
}) {
  const { selectBlock, selectedBlockId } = useCanvasStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-block-${block.id}`,
    data: {
      type: 'canvas-block',
      blockId: block.id,
      columnId,
    },
  });

  // Make each block a droppable target to support block-to-block reordering
  const { setNodeRef: setBlockDroppableRef } = useDroppable({
    id: `canvas-block-${block.id}`,
    data: {
      type: 'canvas-block',
      blockId: block.id,
      columnId,
    },
  });

  const isSelected = selectedBlockId === block.id;

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : undefined,
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setBlockDroppableRef(node);
      }}
      style={style}
      className={clsx(
        'relative flex items-start gap-3 border rounded-lg p-3 mb-3 shadow-sm transition',
        {
          'border-slate-300/20 bg-white/80': !daisyui,
          'border-primary/10 bg-base-200/50': daisyui,
          'shadow-xl border-base-200/30': isDragging && !daisyui,
          'shadow-xl border-primary/30': isDragging && daisyui,
          'outline outline-base-200/60 outline-offset-2': isSelected && !daisyui,
          'outline outline-primary/60 outline-offset-2': isSelected && daisyui,
        },
      )}
      onClick={handleBlockClick}
    >
      <button
        type="button"
        className={clsx(
          'inline-flex items-center justify-center w-6 h-6 mt-0.5 border-0 rounded-lg cursor-grab transition',
          {
            'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
              !daisyui,
            'bg-base-200 border text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
              daisyui,
          },
        )}
        aria-label="Drag to reorder"
        {...listeners}
        {...attributes}
        onMouseDown={() => console.log('🟩 Block drag handle clicked:', block.id)}
      >
        <DotsSixVerticalIcon size={16} weight="bold" />
      </button>
      <div className="flex-1">{renderBlock(block, daisyui)}</div>
    </div>
  );
}

function CanvasColumnView({
  column,
  rowId,
  sectionId,
  daisyui,
}: {
  column: CanvasColumn;
  rowId: string;
  sectionId: string;
  daisyui?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-column-${column.id}`,
    data: {
      type: 'canvas-column-item',
      columnId: column.id,
      rowId,
      sectionId,
    },
  });

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'canvas-column',
      columnId: column.id,
      rowId,
      sectionId,
      blockCount: column.blocks.length,
    },
  });

  const sortableStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.75 : undefined,
  };

  const sortableItems = column.blocks.map((block) => `canvas-block-${block.id}`);

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className={clsx(
        'relative flex flex-col gap-3 p-3 rounded-[0.85rem] border border-dashed transition',
        {
          'border-purple-300/30 bg-purple-50/40': !daisyui,
          'border-secondary/50': daisyui,
          'bg-purple-100/60 shadow-lg': isDragging && !daisyui,
          'bg-base-300/60 shadow-lg': isDragging && daisyui,
        },
      )}
    >
      <ElementTab type="Column" daisyui={daisyui} />
      <div className="flex justify-end gap-2" {...attributes} {...listeners}>
        <button
          type="button"
          className={clsx(
            'inline-flex items-center justify-center w-6 h-6 mt-0.5 border-0 rounded-lg cursor-grab transition',
            {
              'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
                !daisyui,
              'bg-base-200 text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
                daisyui,
            },
          )}
          aria-label="Drag column"
          onMouseDown={() => console.log('🟪 Column drag handle clicked:', column.id)}
        >
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>
        <ColumnDeleteButton columnId={column.id} daisyui={daisyui} />
      </div>
      <SortableContext
        id={`column-${column.id}`}
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setDroppableNodeRef}
          className={clsx('min-h-[140px] p-4 rounded-lg border border-dashed transition', {
            'border-slate-300/20 bg-white/70': !daisyui,
            'border-base-300/20 bg-base-100/70': daisyui,
            'border-green-500/60 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]': isOver,
          })}
        >
          {column.blocks.length === 0 ? (
            <div
              className={clsx('flex items-center justify-center min-h-[88px] text-sm', {
                'text-slate-400': !daisyui,
                'text-base-content/60': daisyui,
              })}
            >
              Drop content blocks here
            </div>
          ) : (
            column.blocks.map((block) => (
              <CanvasBlockView
                key={block.id}
                block={block}
                columnId={column.id}
                daisyui={daisyui}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasRowView({
  row,
  sectionId,
  daisyui,
}: {
  row: CanvasRow;
  sectionId: string;
  daisyui?: boolean;
}) {
  const { previewMode } = useCanvasStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-row-${row.id}`,
    data: {
      type: 'canvas-row-item',
      rowId: row.id,
      sectionId,
    },
  });

  const { isOver, setNodeRef: setRowDroppableRef } = useDroppable({
    id: `row-${row.id}`,
    data: {
      type: 'canvas-row-container',
      rowId: row.id,
      sectionId,
      columnCount: row.columns.length,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : undefined,
  };

  const isMobile = previewMode === 'mobile';
  const gridStyle: CSSProperties = {
    gap: row.gutter ?? 24,
    gridTemplateColumns: isMobile
      ? 'repeat(1, minmax(0, 1fr))'
      : `repeat(${Math.max(row.columns.length, 1)}, minmax(0, 1fr))`,
  };

  const sortableColumnItems = row.columns.map((column) => `canvas-column-${column.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative flex flex-col gap-3 p-3 rounded-[0.85rem] border border-dashed transition',
        {
          'border-green-300/30 bg-green-50/40': !daisyui,
          'border-secondary/30 bg-base-100/40': daisyui,
          'bg-green-100/60 shadow-lg': isDragging && !daisyui,
          'bg-base-200/60 shadow-lg': isDragging && daisyui,
          'border-green-500/60 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]': isOver,
        },
      )}
    >
      <ElementTab type="Row" daisyui={daisyui} />
      <div className="flex justify-end gap-2" {...attributes} {...listeners}>
        <button
          type="button"
          className={clsx(
            'inline-flex items-center justify-center w-6 h-6 mt-0.5 border-0 rounded-lg cursor-grab transition',
            {
              'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
                !daisyui,
              'bg-base-200 text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
                daisyui,
            },
          )}
          aria-label="Drag row"
          onMouseDown={() => console.log('🟫 Row drag handle clicked:', row.id)}
        >
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>
        <RowDeleteButton rowId={row.id} daisyui={daisyui} />
      </div>
      <SortableContext
        id={`row-${row.id}`}
        items={sortableColumnItems}
        strategy={horizontalListSortingStrategy}
      >
        <div ref={setRowDroppableRef} className={clsx('grid w-full')} style={gridStyle}>
          {row.columns.length === 0 ? (
            <div
              className={clsx(
                'flex items-center justify-center min-h-[88px] rounded-lg border border-dashed text-sm',
                {
                  'border-slate-300/30 text-slate-400 bg-slate-50/50': !daisyui,
                  'border-base-300/30 text-base-content/60 bg-base-200/50': daisyui,
                },
              )}
            >
              Drop columns here
            </div>
          ) : (
            row.columns.map((column) => (
              <CanvasColumnView
                key={column.id}
                column={column}
                rowId={row.id}
                sectionId={sectionId}
                daisyui={daisyui}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasSectionView({ section, daisyui }: { section: CanvasSection; daisyui?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `canvas-section-${section.id}`,
    data: {
      type: 'canvas-section-item',
      sectionId: section.id,
    },
  });

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `section-${section.id}`,
    data: {
      type: 'canvas-section',
      sectionId: section.id,
      rowCount: section.rows.length,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : undefined,
  };

  const sortableRowItems = section.rows.map((row) => `canvas-row-${row.id}`);

  return (
    <div
      ref={setDraggableNodeRef}
      style={style}
      className={clsx('relative flex flex-col gap-3 mb-4 w-full max-w-full', {
        'opacity-70 shadow-2xl': isDragging,
        'bg-base-200 bg-opacity-50': daisyui,
      })}
      {...attributes}
      {...listeners}
      onMouseDown={() => console.log('🟦 Section drag handle clicked:', section.id)}
    >
      <ElementTab type="Section" daisyui={daisyui} />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={clsx(
            'inline-flex items-center justify-center w-6 h-6 mt-0.5 border-0 rounded-lg cursor-grab transition',
            {
              'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
                !daisyui,
              'bg-base-200 text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
                daisyui,
            },
          )}
          aria-label="Drag section"
        >
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>
        <SectionDeleteButton sectionId={section.id} daisyui={daisyui} />
      </div>
      <section
        ref={setDroppableNodeRef}
        className={clsx(
          'flex flex-col gap-4 p-5 rounded-[0.9rem] border transition w-full max-w-full box-border',
          {
            'border-blue-300/30 bg-gradient-to-b from-blue-50/60 to-blue-100/40': !daisyui,
            'border-primary/30 bg-gradient-to-b from-base-100/60 to-base-200/40': daisyui,
            'border-green-500/60 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]': isOver,
          },
        )}
      >
        <SortableContext
          id={`section-${section.id}`}
          items={sortableRowItems}
          strategy={verticalListSortingStrategy}
        >
          {section.rows.length === 0 ? (
            <div
              className={clsx(
                'flex items-center justify-center min-h-40 rounded-lg border border-dashed text-[0.85rem]',
                {
                  'border-slate-300/40 bg-slate-100/40 text-slate-500': !daisyui,
                  'border-base-300/40 bg-base-200/40 text-base-content/70': daisyui,
                },
              )}
            >
              Drop rows or column layouts here
            </div>
          ) : (
            section.rows.map((row) => (
              <CanvasRowView key={row.id} row={row} sectionId={section.id} daisyui={daisyui} />
            ))
          )}
        </SortableContext>
      </section>
    </div>
  );
}

export function Canvas({ sections, daisyui = false }: CanvasProps) {
  const { selectBlock } = useCanvasStore();
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const canvasStyles: CSSProperties = {
    minHeight: 400,
    padding: '0.625rem',
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on child elements
    if (e.target === e.currentTarget) {
      selectBlock(null);
    }
  };

  console.log(
    '🟨 Canvas sections:',
    sections.map((s) => ({ id: s.id, rowCount: s.rows.length })),
  );

  return (
    <div
      ref={setNodeRef}
      style={canvasStyles}
      className={clsx('w-full transition flex flex-col gap-5 rounded-xl', {
        // 'bg-slate-50': !daisyui,
        // 'bg-base-200': daisyui,
        'border-dashed border-2': isOver,
        // '': !isOver && !daisyui,
        'bg-base-200 bg-opacity-50': !isOver && daisyui,
      })}
      onClick={handleCanvasClick}
    >
      {sections.length === 0 ? (
        <div
          className={clsx(
            'flex items-center justify-center min-h-[220px] rounded-lg border-2 border-dashed text-sm',
            {
              'border-slate-300/40 text-slate-500 bg-slate-100/60': !daisyui,
              'border-base-300/40 text-base-content/70 bg-base-100/60': daisyui,
            },
          )}
        >
          Drag a section to get started
        </div>
      ) : (
        sections.map((section) => (
          <CanvasSectionView key={section.id} section={section} daisyui={daisyui} />
        ))
      )}
    </div>
  );
}

function ColumnDeleteButton({ columnId, daisyui }: { columnId: string; daisyui?: boolean }) {
  const { document, setDocument } = useCanvasStore();
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    const next = removeColumn(document.sections, columnId);
    setDocument({ ...document, sections: next });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Delete column"
        className={clsx(
          'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
          {
            'bg-red-50 text-red-600 hover:bg-red-100': !daisyui,
            'bg-error/10 text-error hover:bg-error/20': daisyui,
          },
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash size={16} weight="bold" />
      </button>
      <ConfirmModal
        open={open}
        daisyui={daisyui}
        title="Delete column?"
        description="This will remove the column and all its content blocks."
        confirmLabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}

function RowDeleteButton({ rowId, daisyui }: { rowId: string; daisyui?: boolean }) {
  const { document, setDocument } = useCanvasStore();
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    const next = removeRow(document.sections, rowId);
    setDocument({ ...document, sections: next });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Delete row"
        className={clsx(
          'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
          {
            'bg-red-50 text-red-600 hover:bg-red-100': !daisyui,
            'bg-error/10 text-error hover:bg-error/20': daisyui,
          },
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash size={16} weight="bold" />
      </button>
      <ConfirmModal
        open={open}
        daisyui={daisyui}
        title="Delete row?"
        description="This will remove the row and all its columns and blocks."
        confirmLabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}

function SectionDeleteButton({ sectionId, daisyui }: { sectionId: string; daisyui?: boolean }) {
  const { document, setDocument } = useCanvasStore();
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    const next = removeSection(document.sections, sectionId);
    setDocument({ ...document, sections: next });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Delete section"
        className={clsx(
          'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
          {
            'bg-red-50 text-red-600 hover:bg-red-100': !daisyui,
            'bg-error/10 text-error hover:bg-error/20': daisyui,
          },
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash size={16} weight="bold" />
      </button>
      <ConfirmModal
        open={open}
        daisyui={daisyui}
        title="Delete section?"
        description="This will remove the section and all its rows, columns, and blocks."
        confirmLabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}
