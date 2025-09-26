import type { CSSProperties } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
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

export interface CanvasProps {
  sections: CanvasSection[];
}

function renderBlock(block: CanvasContentBlock) {
  switch (block.type) {
    case 'button':
      return <Button {...block.props} />;
    case 'text':
      return <Text {...block.props} />;
    case 'heading':
      return <Heading {...block.props} />;
    case 'divider':
      return <Divider {...block.props} />;
    case 'image':
      return <Image {...block.props} />;
    case 'custom':
      return (
        <div className="email-dnd-custom-block" data-component={block.props.componentName}>
          {block.props.componentName}
        </div>
      );
    default:
      return null;
  }
}

function CanvasBlockView({ block, columnId }: { block: CanvasContentBlock; columnId: string }) {
  const { selectBlock, selectedBlockId } = useCanvasStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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
      ref={setNodeRef}
      style={style}
      className={clsx(
        'email-dnd-canvas-block',
        isDragging && 'email-dnd-canvas-block-dragging',
        isSelected && 'email-dnd-canvas-block-selected',
      )}
      onClick={handleBlockClick}
    >
      <button
        type="button"
        className="email-dnd-block-handle"
        aria-label="Drag to reorder"
        {...listeners}
        {...attributes}
        onMouseDown={() => console.log('🟩 Block drag handle clicked:', block.id)}
      >
        <DotsSixVerticalIcon size={16} weight="bold" />
      </button>
      <div className="email-dnd-block-content">{renderBlock(block)}</div>
    </div>
  );
}

function CanvasColumnView({
  column,
  rowId,
  sectionId,
}: {
  column: CanvasColumn;
  rowId: string;
  sectionId: string;
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
        'email-dnd-column-wrapper',
        isDragging && 'email-dnd-column-wrapper-dragging',
      )}
    >
      <div className="email-dnd-column-toolbar" {...attributes} {...listeners}>
        <button
          type="button"
          className="email-dnd-block-handle"
          aria-label="Drag column"
          onMouseDown={() => console.log('🟪 Column drag handle clicked:', column.id)}
        >
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>
      </div>
      <SortableContext
        id={`column-${column.id}`}
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setDroppableNodeRef}
          className={clsx('email-dnd-column', isOver && 'email-dnd-drop-target')}
        >
          {column.blocks.length === 0 ? (
            <div className="email-dnd-column-empty">Drop content blocks here</div>
          ) : (
            column.blocks.map((block) => (
              <CanvasBlockView key={block.id} block={block} columnId={column.id} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasRowView({ row, sectionId }: { row: CanvasRow; sectionId: string }) {
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

  const gridStyle: CSSProperties = {
    gap: row.gutter ?? 24,
    gridTemplateColumns: `repeat(${Math.max(row.columns.length, 1)}, minmax(0, 1fr))`,
  };

  const sortableColumnItems = row.columns.map((column) => `canvas-column-${column.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'email-dnd-row-wrapper',
        isDragging && 'email-dnd-row-wrapper-dragging',
        isOver && 'email-dnd-drop-target',
      )}
    >
      <div className="email-dnd-row-toolbar" {...attributes} {...listeners}>
        <button
          type="button"
          className="email-dnd-block-handle"
          aria-label="Drag row"
          onMouseDown={() => console.log('🟫 Row drag handle clicked:', row.id)}
        >
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>
      </div>
      <SortableContext
        id={`row-${row.id}`}
        items={sortableColumnItems}
        strategy={horizontalListSortingStrategy}
      >
        <div ref={setRowDroppableRef} className={clsx('email-dnd-row')} style={gridStyle}>
          {row.columns.length === 0 ? (
            <div className="email-dnd-row-empty">Drop columns here</div>
          ) : (
            row.columns.map((column) => (
              <CanvasColumnView
                key={column.id}
                column={column}
                rowId={row.id}
                sectionId={sectionId}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasSectionView({ section }: { section: CanvasSection }) {
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
      className={clsx(
        'email-dnd-section-wrapper',
        isDragging && 'email-dnd-section-wrapper-dragging',
      )}
      {...attributes}
      {...listeners}
      onMouseDown={() => console.log('🟦 Section drag handle clicked:', section.id)}
    >
      <div className="email-dnd-section-toolbar">
        <button type="button" className="email-dnd-block-handle" aria-label="Drag section">
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>
      </div>
      <section
        ref={setDroppableNodeRef}
        className={clsx('email-dnd-section', isOver && 'email-dnd-drop-target')}
      >
        <SortableContext
          id={`section-${section.id}`}
          items={sortableRowItems}
          strategy={verticalListSortingStrategy}
        >
          {section.rows.length === 0 ? (
            <div className="email-dnd-section-empty">Drop rows or column layouts here</div>
          ) : (
            section.rows.map((row) => (
              <CanvasRowView key={row.id} row={row} sectionId={section.id} />
            ))
          )}
        </SortableContext>
      </section>
    </div>
  );
}

export function Canvas({ sections }: CanvasProps) {
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
      className={clsx(
        'w-full border email-dnd-canvas',
        isOver ? 'border-dashed border-2 border-green-500' : 'border-solid border-black',
      )}
      onClick={handleCanvasClick}
    >
      {sections.length === 0 ? (
        <div className="email-dnd-canvas-empty">Drag a section to get started</div>
      ) : (
        sections.map((section) => <CanvasSectionView key={section.id} section={section} />)
      )}
    </div>
  );
}
