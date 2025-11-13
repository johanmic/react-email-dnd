'use client';

import { useState, useEffect, useRef, type CSSProperties, Fragment } from 'react';
import { useDroppable, useDraggable, useDndContext } from '@dnd-kit/core';
import { DotsSixVerticalIcon, Trash, Lock, LockOpen, Eye, EyeSlash } from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react';
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
import type {
  CanvasColumn,
  CanvasContentBlock,
  CanvasRow,
  CanvasSection,
  CustomBlockDefinition,
  CustomBlockProps,
  BlockDefinition,
  StructurePaletteItem,
} from '@react-email-dnd/shared';
import { Plus } from '@phosphor-icons/react';
import { Button } from './button';
import { Divider } from './divider';
import { Heading } from './heading';
import { Image } from './image';
import { Text } from './text';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { getBlockPaletteKey } from '../utils/block-library';
import { ConfirmModal } from './ConfirmModal';
import { removeColumn, removeRow, removeSection, type ActiveDragData } from '../utils/drag-drop';
import {
  resolvePaddingClasses,
  resolvePaddingStyle,
  resolveMarginClasses,
  resolveMarginStyle,
} from '../utils/padding';

type ColorMode = 'hierarchy' | 'primary' | 'none' | 'output';

export interface CanvasProps {
  sections: CanvasSection[];
  daisyui?: boolean;
  colorMode?: ColorMode;
  colorModeDepth?: number | null;
  unlockable?: boolean;
  showHidden?: boolean;
  customBlockRegistry?: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
  inlineInsertionMode?: boolean;
  inlineInsertionVariant?: 'icon-only' | 'icon-with-label';
  onAddSection?: () => void;
  onAddRow?: (sectionId: string, columnCount?: number, index?: number) => void;
  onAddColumn?: (rowId: string, columnCount?: number, index?: number) => void;
  onAddBlock?: (columnId: string, blockKey: string, index?: number) => void;
  contentBlocks?: BlockDefinition<CanvasContentBlock>[];
  structureItems?: StructurePaletteItem[];
}

// Helper component for element type tabs
function ElementTab({
  type,
  daisyui,
  colorMode = 'hierarchy',
}: {
  type: 'Section' | 'Row' | 'Column';
  daisyui?: boolean;
  colorMode?: ColorMode;
}) {
  // Don't show tab when colorMode is 'none' or 'output'
  if (colorMode === 'none' || colorMode === 'output') {
    return null;
  }

  const getTabColors = () => {
    if (colorMode === 'primary') {
      const palette = daisyui
        ? {
            Section: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
            Row: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
            Column: { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/10' },
          }
        : {
            Section: { bg: 'bg-blue-500/20', text: 'text-blue-700', border: 'border-blue-500/30' },
            Row: { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20' },
            Column: { bg: 'bg-blue-500/5', text: 'text-blue-700', border: 'border-blue-500/10' },
          };
      return palette[type];
    }

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

type ContainerAlignment = 'left' | 'center' | 'right' | 'justify' | undefined;

function alignmentClassName(align: ContainerAlignment): string | undefined {
  if (!align) {
    return undefined;
  }
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
    case 'left':
    default:
      return 'text-left';
  }
}

function alignmentStyle(align: ContainerAlignment): CSSProperties | undefined {
  if (!align) {
    return undefined;
  }
  return { textAlign: align };
}

function renderBlock(
  block: CanvasContentBlock,
  options: {
    daisyui?: boolean;
    customBlocks: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
    variables?: Record<string, unknown>;
  },
) {
  const { daisyui, customBlocks, variables } = options;
  switch (block.type) {
    case 'button':
      return <Button {...block.props} daisyui={daisyui} editorMode blockId={block.id} />;
    case 'text':
      return <Text {...block.props} daisyui={daisyui} />;
    case 'heading':
      return <Heading {...block.props} daisyui={daisyui} />;
    case 'divider':
      return <Divider {...block.props} daisyui={daisyui} />;
    case 'image':
      return <Image {...block.props} daisyui={daisyui} />;
    case 'custom':
      const customProps = block.props as CustomBlockProps;
      const definition = customBlocks[customProps.componentName];
      if (definition) {
        const Component = definition.component;
        // Merge variables into custom block props, with variables taking precedence
        return (
          <Component
            {...{ ...(customProps.props as Record<string, unknown>), ...(variables ?? {}) }}
          />
        );
      }
      return (
        <div
          className={clsx('text-sm capitalize', {
            'text-slate-900': !daisyui,
            'bg-primary/50 text-base-content': daisyui,
          })}
          data-component={customProps.componentName}
        >
          {customProps.componentName}
        </div>
      );
    default:
      return null;
  }
}

function BlockDropZone({
  columnId,
  index,
  isDisabled,
  daisyui,
  colorMode = 'hierarchy',
}: {
  columnId: string;
  index: number;
  isDisabled: boolean;
  daisyui?: boolean;
  colorMode?: ColorMode;
}) {
  const { active } = useDndContext();
  const activeId = active ? String(active.id) : '';
  const activeData = active?.data?.current as ActiveDragData | undefined;
  const isSidebarBlock = activeId.startsWith('block-');
  const isCanvasBlock = activeData?.type === 'canvas-block';
  const isDraggingBlock = isSidebarBlock || isCanvasBlock;
  const canAcceptDrop = isDraggingBlock && !isDisabled;

  const { isOver, setNodeRef } = useDroppable({
    id: `column-${columnId}-slot-${index}`,
    data: {
      type: 'canvas-block-dropzone',
      columnId,
      index,
    },
    disabled: !isDraggingBlock || isDisabled || colorMode === 'none' || colorMode === 'output',
  });

  // Don't show dropzone when colorMode is 'none' or 'output'
  if (colorMode === 'none' || colorMode === 'output') {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative transition-all duration-150 ease-in-out',
        canAcceptDrop ? 'h-3 my-1' : 'h-0 my-0',
      )}
      style={{ pointerEvents: canAcceptDrop ? 'auto' : 'none' }}
      aria-hidden={!canAcceptDrop}
    >
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150 ease-in-out',
          canAcceptDrop ? (isOver ? 'opacity-100' : 'opacity-80') : 'opacity-0',
        )}
      >
        <div
          className={clsx('w-full h-1 rounded-full border border-dashed', {
            ...(colorMode === 'primary'
              ? {
                  'border-blue-500 bg-blue-500/80': isOver && !daisyui,
                  'border-primary bg-primary/80': isOver && daisyui,
                  'border-blue-400 bg-blue-200/50': !isOver && !daisyui,
                  'border-primary/40 bg-primary/10': !isOver && daisyui,
                }
              : {
                  'border-blue-500 bg-blue-500/80': isOver && !daisyui,
                  'border-primary bg-primary/80': isOver && daisyui,
                  'border-blue-300 bg-blue-200/60': !isOver && !daisyui,
                  'border-base-300/50 bg-base-200/20': !isOver && daisyui,
                }),
          })}
        />
      </div>
    </div>
  );
}

function RowDropZone({
  sectionId,
  index,
  isDisabled,
  daisyui,
  colorMode = 'hierarchy',
}: {
  sectionId: string;
  index: number;
  isDisabled: boolean;
  daisyui?: boolean;
  colorMode?: ColorMode;
}) {
  const { active } = useDndContext();
  const activeId = active ? String(active.id) : '';
  const activeData = active?.data?.current as ActiveDragData | undefined;
  const isRowDrag = activeData?.type === 'canvas-row-item';
  const isStructureRow = activeId === 'structure-row' || activeId.startsWith('structure-columns-');
  const canAcceptDrop = !isDisabled && (isRowDrag || isStructureRow);

  const { isOver, setNodeRef } = useDroppable({
    id: `section-${sectionId}-row-slot-${index}`,
    data: {
      type: 'canvas-row-dropzone',
      sectionId,
      index,
    },
    disabled: !canAcceptDrop || colorMode === 'none' || colorMode === 'output',
  });

  // Don't show dropzone when colorMode is 'none' or 'output'
  if (colorMode === 'none' || colorMode === 'output') {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative transition-all duration-150 ease-in-out',
        canAcceptDrop ? 'my-2 h-6' : 'my-0 h-0',
      )}
      style={{ pointerEvents: canAcceptDrop ? 'auto' : 'none' }}
      aria-hidden={!canAcceptDrop}
    >
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150 ease-in-out',
          canAcceptDrop ? (isOver ? 'opacity-100' : 'opacity-80') : 'opacity-0',
        )}
      >
        <div
          className={clsx('w-full h-1.5 rounded-full border border-dashed', {
            ...(colorMode === 'primary'
              ? {
                  'border-blue-500 bg-blue-500/80': isOver && !daisyui,
                  'border-primary bg-primary/80': isOver && daisyui,
                  'border-blue-400 bg-blue-200/50': !isOver && !daisyui,
                  'border-primary/40 bg-primary/10': !isOver && daisyui,
                }
              : {
                  'border-green-500 bg-green-500/80': isOver && !daisyui,
                  'border-secondary bg-secondary/80': isOver && daisyui,
                  'border-green-300 bg-green-200/60': !isOver && !daisyui,
                  'border-base-300/50 bg-base-200/20': !isOver && daisyui,
                }),
          })}
        />
      </div>
    </div>
  );
}

// Lock and Delete button components
function ColumnLockButton({
  columnId,
  locked,
  daisyui,
  unlockable,
  compact = false,
}: {
  columnId: string;
  locked: boolean;
  daisyui?: boolean;
  unlockable?: boolean;
  compact?: boolean;
}) {
  const { document, setDocument } = useCanvasStore();

  // Don't render if not unlockable
  if (!unlockable) {
    return null;
  }

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLockedState = !locked;

    // Cascading lock: lock/unlock all children (blocks)
    const nextSections = document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          if (col.id !== columnId) return col;

          return {
            ...col,
            locked: newLockedState,
            blocks: col.blocks.map((block) => ({
              ...block,
              locked: newLockedState,
            })),
          };
        }),
      })),
    }));
    setDocument({ ...document, sections: nextSections });
  };

  return (
    <button
      type="button"
      aria-label={locked ? 'Unlock column' : 'Lock column'}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition',
        compact ? 'w-5 h-5' : 'w-6 h-6 mt-0.5',
        {
          'bg-amber-50 text-amber-600 hover:bg-amber-100': !daisyui && locked,
          'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !locked,
          'bg-warning/10 text-warning hover:bg-warning/20': daisyui && locked,
          'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !locked,
        },
      )}
      onClick={toggleLock}
    >
      {locked ? (
        <Lock size={compact ? 14 : 16} weight="bold" />
      ) : (
        <LockOpen size={compact ? 14 : 16} weight="bold" />
      )}
    </button>
  );
}

function ColumnDeleteButton({
  columnId,
  daisyui,
  compact = false,
}: {
  columnId: string;
  daisyui?: boolean;
  compact?: boolean;
}) {
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
          'inline-flex items-center justify-center rounded-lg transition',
          compact ? 'w-5 h-5' : 'w-6 h-6 mt-0.5',
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
        <Trash size={compact ? 14 : 16} weight="bold" />
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

function RowLockButton({
  rowId,
  locked,
  daisyui,
  unlockable,
}: {
  rowId: string;
  locked: boolean;
  daisyui?: boolean;
  unlockable?: boolean;
}) {
  const { document, setDocument } = useCanvasStore();

  // Don't render if not unlockable
  if (!unlockable) {
    return null;
  }

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLockedState = !locked;

    // Cascading lock: lock/unlock all children (columns, blocks)
    const nextSections = document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          locked: newLockedState,
          columns: row.columns.map((col) => ({
            ...col,
            locked: newLockedState,
            blocks: col.blocks.map((block) => ({
              ...block,
              locked: newLockedState,
            })),
          })),
        };
      }),
    }));
    setDocument({ ...document, sections: nextSections });
  };

  return (
    <button
      type="button"
      aria-label={locked ? 'Unlock row' : 'Lock row'}
      className={clsx(
        'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
        {
          'bg-amber-50 text-amber-600 hover:bg-amber-100': !daisyui && locked,
          'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !locked,
          'bg-warning/10 text-warning hover:bg-warning/20': daisyui && locked,
          'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !locked,
        },
      )}
      onClick={toggleLock}
    >
      {locked ? <Lock size={16} weight="bold" /> : <LockOpen size={16} weight="bold" />}
    </button>
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

function SectionLockButton({
  sectionId,
  locked,
  daisyui,
  unlockable,
}: {
  sectionId: string;
  locked: boolean;
  daisyui?: boolean;
  unlockable?: boolean;
}) {
  const { document, setDocument } = useCanvasStore();

  // Don't render if not unlockable
  if (!unlockable) {
    return null;
  }

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLockedState = !locked;

    // Cascading lock: lock/unlock all children (rows, columns, blocks)
    const nextSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        locked: newLockedState,
        rows: section.rows.map((row) => ({
          ...row,
          locked: newLockedState,
          columns: row.columns.map((col) => ({
            ...col,
            locked: newLockedState,
            blocks: col.blocks.map((block) => ({
              ...block,
              locked: newLockedState,
            })),
          })),
        })),
      };
    });
    setDocument({ ...document, sections: nextSections });
  };

  return (
    <button
      type="button"
      aria-label={locked ? 'Unlock section' : 'Lock section'}
      className={clsx(
        'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
        {
          'bg-amber-50 text-amber-600 hover:bg-amber-100': !daisyui && locked,
          'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !locked,
          'bg-warning/10 text-warning hover:bg-warning/20': daisyui && locked,
          'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !locked,
        },
      )}
      onClick={toggleLock}
    >
      {locked ? <Lock size={16} weight="bold" /> : <LockOpen size={16} weight="bold" />}
    </button>
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

// Hidden toggle button components
function ColumnHiddenButton({
  columnId,
  hidden,
  daisyui,
  compact = false,
}: {
  columnId: string;
  hidden: boolean;
  daisyui?: boolean;
  compact?: boolean;
}) {
  const { document, setDocument } = useCanvasStore();

  const toggleHidden = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newHiddenState = !hidden;

    // Cascading hidden: hide/show all children (blocks)
    const nextSections = document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          if (col.id !== columnId) return col;

          return {
            ...col,
            hidden: newHiddenState,
            blocks: col.blocks.map((block) => ({
              ...block,
              hidden: newHiddenState,
            })),
          };
        }),
      })),
    }));
    setDocument({ ...document, sections: nextSections });
  };

  return (
    <button
      type="button"
      aria-label={hidden ? 'Show column' : 'Hide column'}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition',
        compact ? 'w-5 h-5' : 'w-6 h-6 mt-0.5',
        {
          'bg-blue-50 text-blue-600 hover:bg-blue-100': !daisyui && hidden,
          'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !hidden,
          'bg-info/10 text-info hover:bg-info/20': daisyui && hidden,
          'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !hidden,
        },
      )}
      onClick={toggleHidden}
    >
      {hidden ? (
        <EyeSlash size={compact ? 14 : 16} weight="bold" />
      ) : (
        <Eye size={compact ? 14 : 16} weight="bold" />
      )}
    </button>
  );
}

function RowHiddenButton({
  rowId,
  hidden,
  daisyui,
}: {
  rowId: string;
  hidden: boolean;
  daisyui?: boolean;
}) {
  const { document, setDocument } = useCanvasStore();

  const toggleHidden = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newHiddenState = !hidden;

    // Cascading hidden: hide/show all children (columns, blocks)
    const nextSections = document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          hidden: newHiddenState,
          columns: row.columns.map((col) => ({
            ...col,
            hidden: newHiddenState,
            blocks: col.blocks.map((block) => ({
              ...block,
              hidden: newHiddenState,
            })),
          })),
        };
      }),
    }));
    setDocument({ ...document, sections: nextSections });
  };

  return (
    <button
      type="button"
      aria-label={hidden ? 'Show row' : 'Hide row'}
      className={clsx(
        'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
        {
          'bg-blue-50 text-blue-600 hover:bg-blue-100': !daisyui && hidden,
          'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !hidden,
          'bg-info/10 text-info hover:bg-info/20': daisyui && hidden,
          'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !hidden,
        },
      )}
      onClick={toggleHidden}
    >
      {hidden ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
    </button>
  );
}

function SectionHiddenButton({
  sectionId,
  hidden,
  daisyui,
}: {
  sectionId: string;
  hidden: boolean;
  daisyui?: boolean;
}) {
  const { document, setDocument } = useCanvasStore();

  const toggleHidden = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newHiddenState = !hidden;

    // Cascading hidden: hide/show all children (rows, columns, blocks)
    const nextSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        hidden: newHiddenState,
        rows: section.rows.map((row) => ({
          ...row,
          hidden: newHiddenState,
          columns: row.columns.map((col) => ({
            ...col,
            hidden: newHiddenState,
            blocks: col.blocks.map((block) => ({
              ...block,
              hidden: newHiddenState,
            })),
          })),
        })),
      };
    });
    setDocument({ ...document, sections: nextSections });
  };

  return (
    <button
      type="button"
      aria-label={hidden ? 'Show section' : 'Hide section'}
      className={clsx(
        'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition',
        {
          'bg-blue-50 text-blue-600 hover:bg-blue-100': !daisyui && hidden,
          'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !hidden,
          'bg-info/10 text-info hover:bg-info/20': daisyui && hidden,
          'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !hidden,
        },
      )}
      onClick={toggleHidden}
    >
      {hidden ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
    </button>
  );
}

function CanvasBlockView({
  block,
  columnId,
  daisyui,
  colorMode = 'hierarchy',
  isParentLocked = false,
  showHidden = false,
  customBlockRegistry,
  isCompactLayout = false,
}: {
  block: CanvasContentBlock;
  columnId: string;
  daisyui?: boolean;
  colorMode?: ColorMode;
  isParentLocked?: boolean;
  showHidden?: boolean;
  customBlockRegistry: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
  isCompactLayout?: boolean;
}) {
  const { selectBlock, selectedBlockId, variables, isMobileExperience } = useCanvasStore();
  const { document, setDocument } = useCanvasStore();

  // Block is disabled if it's locked, or if any parent container is locked
  const isDisabled = !!(block.locked || isParentLocked);

  const handleToggleHidden = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newHiddenState = !block.hidden;
    const nextSections = document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          blocks: col.blocks.map((b) => (b.id === block.id ? { ...b, hidden: newHiddenState } : b)),
        })),
      })),
    }));
    setDocument({ ...document, sections: nextSections });
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-block-${block.id}`,
    data: {
      type: 'canvas-block',
      blockId: block.id,
      columnId,
    },
    disabled: isDisabled,
  });

  // Make each block a droppable target to support block-to-block reordering
  const { isOver: isBlockOver, setNodeRef: setBlockDroppableRef } = useDroppable({
    id: `canvas-block-${block.id}`,
    data: {
      type: 'canvas-block',
      blockId: block.id,
      columnId,
    },
    disabled: isDisabled,
  });

  const isSelected = selectedBlockId === block.id;

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : undefined,
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    // Don't select if we're dragging
    if (isDragging) {
      return;
    }
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
        'relative transition',
        colorMode !== 'none' && colorMode !== 'output' && 'border rounded-xl shadow-sm',
        isMobileExperience && colorMode !== 'output'
          ? 'flex flex-col p-2 mb-2'
          : isCompactLayout && colorMode !== 'output'
            ? 'flex flex-col p-2 mb-2'
            : colorMode === 'output'
              ? 'flex items-start'
              : 'flex items-start gap-3 p-3 mb-3',
        {
          'border-slate-300/20 bg-white/80':
            !daisyui && colorMode !== 'none' && colorMode !== 'output',
          'border-base-300/50 bg-base-200/20':
            daisyui && colorMode !== 'none' && colorMode !== 'output',
          'shadow-xl border-base-200/30':
            isDragging && !daisyui && colorMode !== 'none' && colorMode !== 'output',
          'shadow-xl border-primary/30':
            isDragging && daisyui && colorMode !== 'none' && colorMode !== 'output',
          'outline outline-base-200/60 outline-offset-2':
            isSelected && !daisyui && colorMode !== 'none' && colorMode !== 'output',
          'outline outline-primary/60 outline-offset-2':
            isSelected && daisyui && colorMode !== 'none' && colorMode !== 'output',
          'opacity-70': isDisabled,
          'ring-2 ring-blue-400/80':
            isBlockOver &&
            !daisyui &&
            !isDisabled &&
            colorMode !== 'none' &&
            colorMode !== 'output',
          'ring-2 ring-primary/70':
            isBlockOver && daisyui && !isDisabled && colorMode !== 'none' && colorMode !== 'output',
        },
      )}
      onClick={handleBlockClick}
    >
      {colorMode !== 'output' && (isCompactLayout || isMobileExperience) ? (
        // Compact layout: controls on top (used for 3+ columns or mobile)
        <div className="flex justify-end items-center gap-1 mb-2">
          {showHidden && (
            <button
              type="button"
              aria-label={block.hidden ? 'Show block' : 'Hide block'}
              className={clsx(
                'inline-flex items-center justify-center rounded cursor-pointer transition',
                isMobileExperience ? 'min-w-[44px] min-h-[44px] p-2' : 'w-5 h-5',
                {
                  'bg-blue-50 text-blue-600 hover:bg-blue-100': !daisyui && block.hidden,
                  'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !block.hidden,
                  'bg-info/10 text-info hover:bg-info/20': daisyui && block.hidden,
                  'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !block.hidden,
                },
              )}
              onClick={handleToggleHidden}
            >
              {block.hidden ? (
                <EyeSlash size={isMobileExperience ? 20 : 14} weight="bold" />
              ) : (
                <Eye size={isMobileExperience ? 20 : 14} weight="bold" />
              )}
            </button>
          )}
          {!isDisabled && (
            <button
              type="button"
              className={clsx(
                'inline-flex items-center justify-center border-0 rounded cursor-grab transition touch-none',
                isMobileExperience ? 'min-w-[44px] min-h-[44px] p-2' : 'w-5 h-5',
                {
                  'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
                    !daisyui,
                  'bg-base-200 border text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
                    daisyui,
                },
              )}
              style={{ touchAction: 'none' }}
              aria-label="Drag to reorder"
              {...listeners}
              {...attributes}
              onMouseDown={(e) => {
                e.stopPropagation();
                console.log('🟩 Block drag handle clicked:', block.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              <DotsSixVerticalIcon size={isMobileExperience ? 20 : 14} weight="bold" />
            </button>
          )}
        </div>
      ) : colorMode !== 'output' && !isMobileExperience ? (
        // Regular layout: controls on the side (desktop only)
        <div className="flex gap-1">
          {showHidden && (
            <button
              type="button"
              aria-label={block.hidden ? 'Show block' : 'Hide block'}
              className={clsx(
                'inline-flex items-center justify-center w-6 h-6 mt-0.5 rounded-lg transition cursor-pointer',
                {
                  'bg-blue-50 text-blue-600 hover:bg-blue-100': !daisyui && block.hidden,
                  'bg-slate-100 text-slate-500 hover:bg-slate-200': !daisyui && !block.hidden,
                  'bg-info/10 text-info hover:bg-info/20': daisyui && block.hidden,
                  'bg-base-200 text-base-content/60 hover:bg-base-300': daisyui && !block.hidden,
                },
              )}
              onClick={handleToggleHidden}
            >
              {block.hidden ? (
                <EyeSlash size={16} weight="bold" />
              ) : (
                <Eye size={16} weight="bold" />
              )}
            </button>
          )}
          {!isDisabled && (
            <button
              type="button"
              className={clsx(
                'inline-flex items-center justify-center mt-0.5 border-0 rounded-lg cursor-grab transition touch-none',
                isMobileExperience ? 'min-w-[44px] min-h-[44px] p-2' : 'w-6 h-6',
                {
                  'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
                    !daisyui,
                  'bg-base-200 border text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
                    daisyui,
                },
              )}
              style={{ touchAction: 'none' }}
              aria-label="Drag to reorder"
              {...listeners}
              {...attributes}
              onMouseDown={(e) => {
                e.stopPropagation();
                console.log('🟩 Block drag handle clicked:', block.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              <DotsSixVerticalIcon size={isMobileExperience ? 20 : 16} weight="bold" />
            </button>
          )}
        </div>
      ) : null}
      <div
        className={
          (isCompactLayout || isMobileExperience) && colorMode !== 'output'
            ? 'w-full'
            : colorMode === 'output'
              ? 'w-full'
              : 'flex-1'
        }
      >
        {renderBlock(block, {
          daisyui,
          customBlocks: customBlockRegistry,
          variables,
        })}
      </div>
    </div>
  );
}

function CanvasColumnView({
  column,
  rowId,
  sectionId,
  daisyui,
  colorMode = 'hierarchy',
  colorModeDepth,
  row,
  section,
  unlockable = true,
  showHidden = false,
  customBlockRegistry,
  inlineInsertionMode = false,
  inlineInsertionVariant = 'icon-with-label',
  onAddBlock,
  contentBlocks = [],
}: {
  column: CanvasColumn;
  rowId: string;
  sectionId: string;
  daisyui?: boolean;
  colorMode?: ColorMode;
  colorModeDepth?: number | null;
  row: CanvasRow;
  section: CanvasSection;
  unlockable?: boolean;
  showHidden?: boolean;
  customBlockRegistry: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
  inlineInsertionMode?: boolean;
  inlineInsertionVariant?: 'icon-only' | 'icon-with-label';
  onAddBlock?: (columnId: string, blockKey: string, index?: number) => void;
  contentBlocks?: BlockDefinition<CanvasContentBlock>[];
}) {
  // Determine if we should use compact layout (controls on top)
  const isCompactLayout = row.columns.length >= 3;
  // Column is disabled if it's locked, or if its parent row or section is locked
  const isDisabled = !!(column.locked || row.locked || section.locked);

  // Determine if column level highlighting should be shown
  const showColumnHighlight =
    colorMode !== 'none' &&
    colorMode !== 'output' &&
    (colorModeDepth == null || colorModeDepth >= 3);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-column-${column.id}`,
    data: {
      type: 'canvas-column-item',
      columnId: column.id,
      rowId,
      sectionId,
    },
    disabled: isDisabled,
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
    disabled: isDisabled,
  });

  const sortableStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.75 : undefined,
  };

  const sortableItems = column.blocks.map((block) => `canvas-block-${block.id}`);

  // Inline styles from the JSON input should take precedence
  const columnPaddingStyle = resolvePaddingStyle(column.padding);
  const columnPaddingClasses = resolvePaddingClasses(column.padding);
  const hasCustomPadding = columnPaddingClasses.length > 0 || columnPaddingStyle != null;
  const columnMarginStyle = resolveMarginStyle(column.margin);
  const columnMarginClasses = resolveMarginClasses(column.margin);
  const columnAlignmentClass = alignmentClassName(column.align);
  const columnAlignmentStyle = alignmentStyle(column.align);
  const columnHasBackgroundClass = Boolean(column.backgroundClassName);

  const columnInlineStyle: CSSProperties = {
    ...(!columnHasBackgroundClass && column.backgroundColor
      ? { background: column.backgroundColor }
      : {}),
    ...(columnPaddingStyle ? { padding: columnPaddingStyle } : {}),
    ...(columnMarginStyle ? { margin: columnMarginStyle } : {}),
    ...(columnAlignmentStyle ?? {}),
  };

  const visibleBlocks = column.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => showHidden || !block.hidden);

  const shouldRenderTerminalDropZone =
    column.blocks.length > 0 &&
    visibleBlocks.length > 0 &&
    visibleBlocks[visibleBlocks.length - 1].index !== column.blocks.length - 1;

  const { selectContainer } = useCanvasStore();

  const onContainerClick = (e: React.MouseEvent) => {
    // Don't handle clicks during drag operations
    if ((e.nativeEvent as MouseEvent).buttons !== 0) {
      return;
    }
    e.stopPropagation();
    selectContainer({ kind: 'column', id: column.id });
  };

  const columnBaseClasses = !showColumnHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/20 bg-primary/5'
        : 'border-blue-500/20 bg-blue-500/5'
      : daisyui
        ? 'border-accent/50 bg-accent/10'
        : 'border-purple-300/30 bg-purple-50/40';

  const columnDraggingClasses = !showColumnHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'bg-primary/10 shadow-lg'
        : 'bg-blue-500/20 shadow-lg'
      : daisyui
        ? 'bg-base-300/60 shadow-lg'
        : 'bg-purple-200/60 shadow-lg';

  const columnInnerBaseClasses = !showColumnHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/20 bg-base-200/20'
        : 'border-blue-400/20 bg-blue-500/5'
      : daisyui
        ? 'border-base-300/20 bg-base-200/20'
        : 'border-slate-300/20 bg-white';

  const columnInnerOverClasses = !showColumnHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/40 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'
        : 'border-blue-500/40 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'
      : 'border-green-500/60 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]';

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className={clsx(
        'relative flex flex-col gap-1 transition',
        colorMode !== 'output' && 'rounded-[0.85rem] cursor-pointer',
        showColumnHighlight && 'p-1 border border-dashed',
        columnBaseClasses,
        {
          [columnDraggingClasses]: isDragging && showColumnHighlight,
          'opacity-70': isDisabled,
          '!border-red-600 !bg-red-100/40 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]':
            isOver && isDisabled && showColumnHighlight,
        },
      )}
      onClick={onContainerClick}
    >
      <ElementTab type="Column" daisyui={daisyui} colorMode={colorMode} />

      {colorMode !== 'output' && isCompactLayout ? (
        // Compact layout: controls on top in a horizontal row
        <div className="flex justify-end items-center gap-1 mb-1">
          <div className="flex gap-1">
            {showHidden && (
              <ColumnHiddenButton
                columnId={column.id}
                hidden={!!column.hidden}
                daisyui={daisyui}
                compact={isCompactLayout}
              />
            )}
            {!showHidden && (
              <div className="w-5 h-5 flex items-center justify-center text-xs text-gray-400">
                <Eye size={14} weight="bold" />
              </div>
            )}
            <ColumnLockButton
              columnId={column.id}
              locked={!!column.locked}
              daisyui={daisyui}
              unlockable={unlockable}
              compact={isCompactLayout}
            />
          </div>
          {!isDisabled && (
            <div className="flex gap-1">
              <button
                type="button"
                className={clsx(
                  'inline-flex items-center justify-center w-5 h-5 border-0 rounded cursor-grab transition',
                  {
                    'bg-slate-200/60 text-slate-500 hover:bg-slate-200/90 hover:text-slate-800 active:cursor-grabbing focus-visible:outline focus-visible:outline-blue-500/55':
                      !daisyui,
                    'bg-base-200 text-base-content/60 hover:bg-base-200/90 hover:text-base-content active:cursor-grabbing focus-visible:outline focus-visible:outline-primary/55':
                      daisyui,
                  },
                )}
                aria-label="Drag column"
                onMouseDown={() => console.log('🟪 Column drag handle clicked:', column.id)}
                {...attributes}
                {...listeners}
              >
                <DotsSixVerticalIcon size={14} weight="bold" />
              </button>
              <ColumnDeleteButton
                columnId={column.id}
                daisyui={daisyui}
                compact={isCompactLayout}
              />
            </div>
          )}
        </div>
      ) : colorMode !== 'output' ? (
        // Regular layout: controls on the right side
        <div className="flex justify-end gap-2 shrink-0 mb-1" style={{ pointerEvents: 'auto' }}>
          {showHidden && (
            <ColumnHiddenButton
              columnId={column.id}
              hidden={!!column.hidden}
              daisyui={daisyui}
              compact={isCompactLayout}
            />
          )}
          {!showHidden && (
            <div className="w-6 h-6 mt-0.5 flex items-center justify-center text-xs text-gray-400 pointer-events-none">
              <Eye size={16} weight="bold" />
            </div>
          )}
          <ColumnLockButton
            columnId={column.id}
            locked={!!column.locked}
            daisyui={daisyui}
            unlockable={unlockable}
            compact={isCompactLayout}
          />
          {!isDisabled && (
            <>
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
                {...attributes}
                {...listeners}
              >
                <DotsSixVerticalIcon size={16} weight="bold" />
              </button>
              <ColumnDeleteButton
                columnId={column.id}
                daisyui={daisyui}
                compact={isCompactLayout}
              />
            </>
          )}
        </div>
      ) : null}
      <SortableContext
        id={`column-${column.id}`}
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setDroppableNodeRef}
          className={clsx(
            'min-h-[140px] w-full transition flex flex-col items-stretch',
            colorMode !== 'output' && 'rounded-xl',
            showColumnHighlight && 'border border-dashed',
            { 'p-4': !hasCustomPadding && colorMode !== 'output' },
            columnInnerBaseClasses,
            {
              [columnInnerOverClasses]: isOver && !isDisabled && showColumnHighlight,
              '!border-error/80 !bg-error/10 shadow-[0_0_0_3px_rgba(220,38,38,0.15)]':
                isOver && isDisabled && showColumnHighlight && daisyui,
              '!border-red-600/80 !bg-red-100/30 shadow-[0_0_0_3px_rgba(220,38,38,0.15)]':
                isOver && isDisabled && showColumnHighlight && !daisyui,
            },
            column.backgroundClassName,
            column.className,
            columnPaddingClasses,
            columnMarginClasses,
            columnAlignmentClass,
          )}
          style={{ ...columnInlineStyle, pointerEvents: 'auto', width: '100%' }}
          onClick={(e) => {
            // Prevent column container click from firing when clicking droppable area
            e.stopPropagation();
          }}
        >
          {column.blocks.length === 0 && colorMode !== 'output' && (
            <div
              className={clsx(
                'flex items-center justify-center min-h-[88px] text-sm rounded-xl',
                colorMode === 'primary'
                  ? daisyui
                    ? 'text-primary/70 bg-base-200/20 border border-dashed border-primary/30'
                    : 'text-blue-600'
                  : !daisyui
                    ? 'text-slate-400'
                    : 'text-base-content/60 bg-base-200/20 border border-dashed border-base-300/50',
              )}
            >
              Drop content blocks here
            </div>
          )}

          {showColumnHighlight && (
            <BlockDropZone
              columnId={column.id}
              index={0}
              isDisabled={isDisabled}
              daisyui={daisyui}
              colorMode={colorMode}
            />
          )}

          {visibleBlocks.map(({ block, index }) => (
            <Fragment key={block.id}>
              <CanvasBlockView
                block={block}
                columnId={column.id}
                daisyui={daisyui}
                colorMode={colorMode}
                isParentLocked={isDisabled}
                showHidden={showHidden}
                customBlockRegistry={customBlockRegistry}
                isCompactLayout={isCompactLayout}
              />
              {showColumnHighlight && (
                <BlockDropZone
                  columnId={column.id}
                  index={index + 1}
                  isDisabled={isDisabled}
                  daisyui={daisyui}
                  colorMode={colorMode}
                />
              )}
            </Fragment>
          ))}

          {shouldRenderTerminalDropZone && showColumnHighlight && (
            <BlockDropZone
              columnId={column.id}
              index={column.blocks.length}
              isDisabled={isDisabled}
              daisyui={daisyui}
              colorMode={colorMode}
            />
          )}
          {inlineInsertionMode && onAddBlock && (
            <InlineInsertionButton
              label="Add Block"
              variant={inlineInsertionVariant}
              daisyui={daisyui}
              items={contentBlocks.map((block) => ({
                id: getBlockPaletteKey(block),
                label: block.label,
                icon: block.icon,
              }))}
              onSelect={(blockKey) => {
                const block = contentBlocks.find((b) => getBlockPaletteKey(b) === blockKey);
                if (block) {
                  onAddBlock(column.id, blockKey, column.blocks.length);
                }
              }}
            />
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
  colorMode = 'hierarchy',
  colorModeDepth,
  section,
  unlockable = true,
  showHidden = false,
  customBlockRegistry,
  inlineInsertionMode = false,
  inlineInsertionVariant = 'icon-with-label',
  onAddColumn,
  onAddBlock,
  contentBlocks = [],
  structureItems = [],
}: {
  row: CanvasRow;
  sectionId: string;
  daisyui?: boolean;
  colorMode?: ColorMode;
  colorModeDepth?: number | null;
  section: CanvasSection;
  unlockable?: boolean;
  showHidden?: boolean;
  customBlockRegistry: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
  inlineInsertionMode?: boolean;
  inlineInsertionVariant?: 'icon-only' | 'icon-with-label';
  onAddColumn?: (rowId: string, columnCount?: number, index?: number) => void;
  onAddBlock?: (columnId: string, blockKey: string, index?: number) => void;
  contentBlocks?: BlockDefinition<CanvasContentBlock>[];
  structureItems?: StructurePaletteItem[];
}) {
  const { previewMode, selectContainer } = useCanvasStore();

  // Row is disabled if it's locked, or if its parent section is locked
  const isDisabled = !!(row.locked || section.locked);

  // Determine if row level highlighting should be shown
  const showRowHighlight =
    colorMode !== 'none' &&
    colorMode !== 'output' &&
    (colorModeDepth == null || colorModeDepth >= 2);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-row-${row.id}`,
    data: {
      type: 'canvas-row-item',
      rowId: row.id,
      sectionId,
    },
    disabled: isDisabled,
  });

  const { isOver, setNodeRef: setRowDroppableRef } = useDroppable({
    id: `row-${row.id}`,
    data: {
      type: 'canvas-row-container',
      rowId: row.id,
      sectionId,
      columnCount: row.columns.length,
    },
    disabled: isDisabled,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : undefined,
  };

  const isMobile = previewMode === 'mobile';
  const rowPaddingStyle = resolvePaddingStyle(row.padding);
  const rowPaddingClasses = resolvePaddingClasses(row.padding);
  const rowMarginStyle = resolveMarginStyle(row.margin);
  const rowMarginClasses = resolveMarginClasses(row.margin);
  const rowAlignmentClass = alignmentClassName(row.align);
  const rowAlignmentStyle = alignmentStyle(row.align);
  const rowHasBackgroundClass = Boolean(row.backgroundClassName);

  const gridStyle: CSSProperties = {
    gap: row.gutter ?? 8,
    gridTemplateColumns: isMobile
      ? 'repeat(1, minmax(0, 1fr))'
      : `repeat(${Math.max(row.columns.length, 1)}, minmax(0, 1fr))`,
    alignItems: 'start',
    justifyItems: 'stretch',
    ...(!rowHasBackgroundClass && row.backgroundColor ? { background: row.backgroundColor } : {}),
    ...(rowPaddingStyle ? { padding: rowPaddingStyle } : {}),
    ...(rowMarginStyle ? { margin: rowMarginStyle } : {}),
    ...(rowAlignmentStyle ?? {}),
  };

  const sortableColumnItems = row.columns.map((column) => `canvas-column-${column.id}`);

  const onContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectContainer({ kind: 'row', id: row.id });
  };

  const rowBaseClasses = !showRowHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/30 bg-primary/10'
        : 'border-blue-500/30 bg-blue-500/10'
      : daisyui
        ? 'border-secondary/30 bg-secondary/10'
        : 'border-green-300/30 bg-green-50/40';

  const rowDraggingClasses = !showRowHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'bg-primary/20 shadow-lg'
        : 'bg-blue-500/20 shadow-lg'
      : daisyui
        ? 'bg-base-200/60 shadow-lg'
        : 'bg-green-100/60 shadow-lg';

  const rowOverAvailableClasses = !showRowHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/50 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'
        : 'border-blue-500/50 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'
      : 'border-green-500/60 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative flex flex-col gap-1 transition',
        colorMode !== 'output' && 'rounded-[0.85rem]',
        showRowHighlight && 'p-1 border border-dashed',
        rowBaseClasses,
        {
          [rowDraggingClasses]: isDragging && showRowHighlight,
          [rowOverAvailableClasses]: isOver && !isDisabled && showRowHighlight,
          'opacity-70': isDisabled,
          '!border-red-600 !bg-red-100/40 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]':
            isOver && isDisabled && showRowHighlight,
        },
      )}
    >
      <ElementTab type="Row" daisyui={daisyui} colorMode={colorMode} />
      {colorMode !== 'output' && (
        <div className="flex justify-end gap-2">
          {showHidden && <RowHiddenButton rowId={row.id} hidden={!!row.hidden} daisyui={daisyui} />}
          {!showHidden && (
            <div className="w-6 h-6 mt-0.5 flex items-center justify-center text-xs text-gray-400">
              <Eye size={16} weight="bold" />
            </div>
          )}
          <RowLockButton
            rowId={row.id}
            locked={!!row.locked}
            daisyui={daisyui}
            unlockable={unlockable}
          />
          {!isDisabled && (
            <>
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
                {...attributes}
                {...listeners}
              >
                <DotsSixVerticalIcon size={16} weight="bold" />
              </button>
              <RowDeleteButton rowId={row.id} daisyui={daisyui} />
            </>
          )}
        </div>
      )}
      <SortableContext
        id={`row-${row.id}`}
        items={sortableColumnItems}
        strategy={horizontalListSortingStrategy}
      >
        <div
          ref={setRowDroppableRef}
          className={clsx(
            'grid w-full',
            row.backgroundClassName,
            row.className,
            rowPaddingClasses,
            rowMarginClasses,
            rowAlignmentClass,
          )}
          style={gridStyle}
          onClick={onContainerClick}
        >
          {row.columns.length === 0 && colorMode !== 'output' ? (
            <div
              className={clsx(
                'flex items-center justify-center min-h-[88px] rounded-xl border border-dashed text-sm',
                colorMode === 'primary'
                  ? daisyui
                    ? 'border-primary/30 text-primary/70 bg-base-200/20'
                    : 'border-blue-500/30 text-blue-600 bg-blue-500/10'
                  : !daisyui
                    ? 'border-slate-300/30 text-slate-400 bg-slate-50/50'
                    : 'border-base-300/50 text-base-content/60 bg-base-200/20',
              )}
            >
              Drop columns here
            </div>
          ) : (
            row.columns
              .filter((column) => showHidden || !column.hidden)
              .map((column) => (
                <CanvasColumnView
                  key={column.id}
                  column={column}
                  rowId={row.id}
                  sectionId={sectionId}
                  daisyui={daisyui}
                  colorMode={colorMode}
                  colorModeDepth={colorModeDepth}
                  row={row}
                  section={section}
                  unlockable={unlockable}
                  showHidden={showHidden}
                  customBlockRegistry={customBlockRegistry}
                  inlineInsertionMode={inlineInsertionMode}
                  inlineInsertionVariant={inlineInsertionVariant}
                  onAddBlock={onAddBlock}
                  contentBlocks={contentBlocks}
                />
              ))
          )}
          {inlineInsertionMode && onAddColumn && (
            <InlineInsertionButton
              label="Add Column"
              variant={inlineInsertionVariant}
              daisyui={daisyui}
              items={[
                {
                  id: '1',
                  label: '1 Column',
                  icon: structureItems.find((item) => item.id === 'structure-columns-1')?.icon,
                },
                {
                  id: '2',
                  label: '2 Columns',
                  icon: structureItems.find((item) => item.id === 'structure-columns-2')?.icon,
                },
                {
                  id: '3',
                  label: '3 Columns',
                  icon: structureItems.find((item) => item.id === 'structure-columns-3')?.icon,
                },
              ]}
              onSelect={(id) => {
                const columnCount = parseInt(id, 10);
                onAddColumn(row.id, columnCount, row.columns.length);
              }}
            />
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasSectionView({
  section,
  daisyui,
  colorMode = 'hierarchy',
  colorModeDepth,
  unlockable = true,
  showHidden = false,
  customBlockRegistry,
  inlineInsertionMode = false,
  inlineInsertionVariant = 'icon-with-label',
  onAddRow,
  onAddColumn,
  onAddBlock,
  contentBlocks = [],
  structureItems = [],
}: {
  section: CanvasSection;
  daisyui?: boolean;
  colorMode?: ColorMode;
  colorModeDepth?: number | null;
  unlockable?: boolean;
  showHidden?: boolean;
  customBlockRegistry: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
  inlineInsertionMode?: boolean;
  inlineInsertionVariant?: 'icon-only' | 'icon-with-label';
  onAddRow?: (sectionId: string, columnCount?: number, index?: number) => void;
  onAddColumn?: (rowId: string, columnCount?: number, index?: number) => void;
  onAddBlock?: (columnId: string, blockKey: string, index?: number) => void;
  contentBlocks?: BlockDefinition<CanvasContentBlock>[];
  structureItems?: StructurePaletteItem[];
}) {
  const { selectContainer } = useCanvasStore();
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
    disabled: section.locked,
  });

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `section-${section.id}`,
    data: {
      type: 'canvas-section',
      sectionId: section.id,
      rowCount: section.rows.length,
    },
    disabled: section.locked,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : undefined,
  };

  const sortableRowItems = section.rows.map((row) => `canvas-row-${row.id}`);

  const visibleRows = section.rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => showHidden || !row.hidden);

  const shouldRenderTerminalRowDropZone =
    section.rows.length > 0 &&
    (visibleRows.length === 0 ||
      visibleRows[visibleRows.length - 1].index !== section.rows.length - 1);

  const sectionPaddingStyle = resolvePaddingStyle(section.padding);
  const sectionPaddingClasses = resolvePaddingClasses(section.padding);
  // Replace p-6 with p-2 if present, otherwise use p-2 as default if no padding is specified
  const effectiveSectionPaddingClasses =
    sectionPaddingClasses.length > 0
      ? sectionPaddingClasses.map((cls) => (cls === 'p-6' ? 'p-2' : cls))
      : ['p-2'];
  const hasSectionPadding = sectionPaddingClasses.length > 0 || sectionPaddingStyle != null;
  const sectionMarginStyle = resolveMarginStyle(section.margin);
  const sectionMarginClasses = resolveMarginClasses(section.margin);
  const sectionAlignmentClass = alignmentClassName(section.align);
  const sectionAlignmentStyle = alignmentStyle(section.align);
  const sectionHasBackgroundClass = Boolean(section.backgroundClassName);

  // Inline styles from the JSON input should always take precedence over theme classes
  const sectionInlineStyle: CSSProperties = {
    // Using background instead of backgroundColor to reset any background-image from theme gradients
    ...(!sectionHasBackgroundClass && section.backgroundColor
      ? { background: section.backgroundColor }
      : {}),
    ...(sectionPaddingStyle ? { padding: sectionPaddingStyle } : {}),
    ...(sectionMarginStyle ? { margin: sectionMarginStyle } : {}),
    ...(sectionAlignmentStyle ?? {}),
  };

  // Determine if section level highlighting should be shown
  const showSectionHighlight =
    colorMode !== 'none' &&
    colorMode !== 'output' &&
    (colorModeDepth == null || colorModeDepth >= 1);

  const sectionBaseClasses = !showSectionHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/40 bg-base-200/20'
        : 'border-blue-500/40 bg-blue-500/20'
      : daisyui
        ? 'border-base-300/50 bg-base-200/20'
        : 'border-blue-300/30 bg-white';

  const sectionOverAvailableClasses = !showSectionHighlight
    ? ''
    : colorMode === 'primary'
      ? daisyui
        ? 'border-primary/60 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]'
        : 'border-blue-500/60 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'
      : 'border-green-500/60 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]';

  return (
    <div
      ref={setDraggableNodeRef}
      style={style}
      className={clsx('relative flex flex-col gap-3 mb-4 w-full max-w-full transition', {
        'shadow-2xl': isDragging && showSectionHighlight,
        'bg-base-100': daisyui && !showSectionHighlight,
        'opacity-70': section.locked || (isDragging && showSectionHighlight),
      })}
      onMouseDown={() =>
        !section.locked &&
        colorMode !== 'output' &&
        console.log('🟦 Section drag handle clicked:', section.id)
      }
    >
      <ElementTab type="Section" daisyui={daisyui} colorMode={colorMode} />
      {colorMode !== 'output' && (
        <div className="flex justify-end gap-2">
          {showHidden && (
            <SectionHiddenButton
              sectionId={section.id}
              hidden={!!section.hidden}
              daisyui={daisyui}
            />
          )}
          {!showHidden && (
            <div className="w-6 h-6 mt-0.5 flex items-center justify-center text-xs text-gray-400">
              <Eye size={16} weight="bold" />
            </div>
          )}
          <SectionLockButton
            sectionId={section.id}
            locked={!!section.locked}
            daisyui={daisyui}
            unlockable={unlockable}
          />
          {!section.locked && (
            <>
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
                {...attributes}
                {...listeners}
              >
                <DotsSixVerticalIcon size={16} weight="bold" />
              </button>
              <SectionDeleteButton sectionId={section.id} daisyui={daisyui} />
            </>
          )}
        </div>
      )}
      <section
        ref={setDroppableNodeRef}
        className={clsx(
          'flex flex-col gap-2 transition w-full max-w-full box-border',
          colorMode !== 'output' && 'rounded-[0.9rem]',
          showSectionHighlight && 'border',
          // Only apply default padding class when no explicit padding is provided and not in output mode
          { 'p-2 md:p-4': !hasSectionPadding && colorMode !== 'output' },
          // Add minimal border and padding for output mode, and bg-base-200/20 for daisyui
          colorMode === 'output' &&
            (daisyui ? 'border border-base-300/50' : 'border border-gray-300'),
          colorMode === 'output' && 'p-2',
          colorMode === 'output' && daisyui && 'bg-base-200/20',
          sectionBaseClasses,
          {
            [sectionOverAvailableClasses]: isOver && !section.locked && showSectionHighlight,
            '!border-error/80 !bg-error/10 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]':
              isOver && section.locked && showSectionHighlight && daisyui,
            '!border-red-600 !bg-red-100/40 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]':
              isOver && section.locked && showSectionHighlight && !daisyui,
          },
          section.backgroundClassName,
          section.className,
          effectiveSectionPaddingClasses,
          sectionMarginClasses,
          sectionAlignmentClass,
        )}
        onClick={(e) => {
          e.stopPropagation();
          selectContainer({ kind: 'section', id: section.id });
        }}
      >
        <SortableContext
          id={`section-${section.id}`}
          items={sortableRowItems}
          strategy={verticalListSortingStrategy}
        >
          {showSectionHighlight && (
            <RowDropZone
              sectionId={section.id}
              index={0}
              isDisabled={!!section.locked}
              daisyui={daisyui}
              colorMode={colorMode}
            />
          )}

          {section.rows.length === 0 && colorMode !== 'output' ? (
            <div
              className={clsx(
                'flex items-center justify-center min-h-40 rounded-xl text-sm border border-dashed text-[0.85rem]',
                colorMode === 'primary'
                  ? daisyui
                    ? 'border-primary/30 bg-base-200/20 text-primary/70'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-600'
                  : !daisyui
                    ? 'border-slate-300/40 bg-slate-100/40 text-slate-500'
                    : 'border-base-300/50 bg-base-200/20 text-base-content/70',
              )}
            >
              Drop rows or column layouts here
            </div>
          ) : (
            visibleRows.map(({ row, index }) => (
              <Fragment key={row.id}>
                <CanvasRowView
                  row={row}
                  sectionId={section.id}
                  daisyui={daisyui}
                  colorMode={colorMode}
                  colorModeDepth={colorModeDepth}
                  section={section}
                  unlockable={unlockable}
                  showHidden={showHidden}
                  customBlockRegistry={customBlockRegistry}
                  inlineInsertionMode={inlineInsertionMode}
                  inlineInsertionVariant={inlineInsertionVariant}
                  onAddColumn={onAddColumn}
                  onAddBlock={onAddBlock}
                  contentBlocks={contentBlocks}
                  structureItems={structureItems}
                />
                {showSectionHighlight && (
                  <RowDropZone
                    sectionId={section.id}
                    index={index + 1}
                    isDisabled={!!section.locked}
                    daisyui={daisyui}
                    colorMode={colorMode}
                  />
                )}
              </Fragment>
            ))
          )}

          {shouldRenderTerminalRowDropZone && showSectionHighlight && (
            <RowDropZone
              sectionId={section.id}
              index={section.rows.length}
              isDisabled={!!section.locked}
              daisyui={daisyui}
              colorMode={colorMode}
            />
          )}
          {inlineInsertionMode && onAddRow && (
            <InlineInsertionButton
              label="Add Row"
              variant={inlineInsertionVariant}
              daisyui={daisyui}
              items={[
                {
                  id: 'row-1',
                  label: '1 Column',
                  icon: structureItems.find((item) => item.id === 'structure-columns-1')?.icon,
                },
                {
                  id: 'row-2',
                  label: '2 Columns',
                  icon: structureItems.find((item) => item.id === 'structure-columns-2')?.icon,
                },
                {
                  id: 'row-3',
                  label: '3 Columns',
                  icon: structureItems.find((item) => item.id === 'structure-columns-3')?.icon,
                },
                {
                  id: 'row',
                  label: 'Row',
                  icon: structureItems.find((item) => item.id === 'structure-row')?.icon,
                },
              ]}
              onSelect={(id) => {
                const columnCount = id === 'row' ? 1 : parseInt(id.replace('row-', ''), 10);
                onAddRow(section.id, columnCount, section.rows.length);
              }}
            />
          )}
        </SortableContext>
      </section>
    </div>
  );
}

// Inline Insertion Menu Component
function InlineInsertionMenu({
  items,
  onSelect,
  daisyui,
  onClose,
}: {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<IconProps>;
  }>;
  onSelect: (id: string) => void;
  daisyui?: boolean;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={clsx('absolute z-50 mt-2 w-56 rounded-lg shadow-lg border', {
        'bg-white border-slate-200': !daisyui,
        'bg-base-100 border-base-300': daisyui,
      })}
      style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)' }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={clsx('w-full flex items-center gap-3 px-4 py-2 text-sm transition', {
                'text-slate-700 hover:bg-slate-100': !daisyui,
                'text-base-content hover:bg-base-200': daisyui,
              })}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
                onClose();
              }}
            >
              {Icon && <Icon size={18} weight="duotone" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Inline Insertion Button Component
function InlineInsertionButton({
  label,
  variant = 'icon-with-label',
  daisyui,
  items,
  onSelect,
  disabled,
}: {
  label: string;
  variant?: 'icon-only' | 'icon-with-label';
  daisyui?: boolean;
  items: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<IconProps>;
  }>;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (disabled) {
    return null;
  }

  return (
    <div className="relative flex justify-center my-2">
      <button
        ref={buttonRef}
        type="button"
        className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg transition min-h-[44px]', {
          'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200': !daisyui,
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20': daisyui,
        })}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Add ${label}`}
      >
        <Plus size={20} weight="bold" />
        {variant === 'icon-with-label' && <span className="text-sm font-medium">{label}</span>}
      </button>
      {isOpen && (
        <InlineInsertionMenu
          items={items}
          onSelect={onSelect}
          daisyui={daisyui}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export function Canvas({
  sections,
  daisyui = false,
  colorMode = 'hierarchy',
  colorModeDepth = null,
  unlockable = true,
  showHidden = false,
  customBlockRegistry = {},
  inlineInsertionMode = false,
  inlineInsertionVariant = 'icon-with-label',
  onAddSection,
  onAddRow,
  onAddColumn,
  onAddBlock,
  contentBlocks = [],
  structureItems = [],
}: CanvasProps) {
  const { selectBlock, selectContainer, document } = useCanvasStore();
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
  });

  // Load fonts dynamically for canvas preview
  useEffect(() => {
    if (!document.theme?.fonts) return;

    // Create style element with @font-face rules
    const styleId = 'email-editor-fonts';
    let styleEl = globalThis.document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = globalThis.document.createElement('style');
      styleEl.id = styleId;
      globalThis.document.head.appendChild(styleEl);
    }

    const fontFaceRules = document.theme.fonts
      .filter((font) => font.webFont)
      .map(
        (font) => `
        @font-face {
          font-family: "${font.fontFamily}";
          src: url("${font.webFont!.url}") format("${font.webFont!.format}");
          font-weight: ${font.fontWeight ?? 400};
          font-style: ${font.fontStyle ?? 'normal'};
        }
      `,
      )
      .join('\n');

    styleEl.textContent = fontFaceRules;

    return () => {
      // Cleanup on unmount
      styleEl.remove();
    };
  }, [document.theme?.fonts]);

  const canvasStyles: CSSProperties = {
    minHeight: 400,
    padding: '0.25rem',
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on child elements
    if (e.target === e.currentTarget) {
      selectBlock(null);
      selectContainer(null);
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
      className={clsx('w-full transition flex flex-col gap-2 rounded-xl', {
        'border-dashed border-2 border-primary/30 bg-primary/5': isOver && daisyui,
        'border-dashed border-2': isOver && !daisyui,
        'bg-base-100': !isOver && daisyui,
      })}
      onClick={handleCanvasClick}
    >
      {sections.length === 0 ? (
        <div
          className={clsx(
            'flex items-center justify-center min-h-[220px] rounded-xl border-2 border-dashed text-sm',
            {
              'border-slate-300/40 text-slate-500 bg-slate-100/60': !daisyui,
              'border-base-300/50 text-base-content/70 bg-base-200/20': daisyui,
            },
          )}
        >
          Drag a section to get started
        </div>
      ) : (
        sections
          .filter((section) => showHidden || !section.hidden)
          .map((section, index) => (
            <Fragment key={section.id}>
              <CanvasSectionView
                section={section}
                daisyui={daisyui}
                colorMode={colorMode}
                colorModeDepth={colorModeDepth}
                unlockable={unlockable}
                showHidden={showHidden}
                customBlockRegistry={customBlockRegistry}
                inlineInsertionMode={inlineInsertionMode}
                inlineInsertionVariant={inlineInsertionVariant}
                onAddRow={onAddRow}
                onAddColumn={onAddColumn}
                onAddBlock={onAddBlock}
                contentBlocks={contentBlocks}
                structureItems={structureItems}
              />
              {inlineInsertionMode && index < sections.length - 1 && onAddSection && (
                <InlineInsertionButton
                  label="Add Section"
                  variant={inlineInsertionVariant}
                  daisyui={daisyui}
                  items={[
                    {
                      id: 'section',
                      label: 'Section',
                      icon: structureItems.find((item) => item.id === 'structure-section')?.icon,
                    },
                  ]}
                  onSelect={() => onAddSection()}
                />
              )}
            </Fragment>
          ))
      )}
    </div>
  );
}
