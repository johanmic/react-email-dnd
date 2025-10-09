import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState, useEffect, useMemo } from 'react';
import { Sidebar, DEFAULT_CONTENT_ITEMS } from './Sidebar';
import { Main } from './Main';
import { Header } from './Header';
import { PropertiesPanel, type ColorOption, type CustomBlockPropEditors } from './PropertiesPanel';
import { useCanvasStore } from '../hooks/useCanvasStore';
import {
  handleSidebarDrop,
  type ActiveDragData,
  type OverDragData,
  findBlockPosition,
  findRowPosition,
  findColumnPosition,
  findSectionPosition,
  moveBlockToColumn,
  moveRowToSection,
  moveColumnToRow,
  moveSectionToPosition,
  createBlockFromSidebar,
  addBlockToColumnAtIndex,
  addRowToSection,
} from '../utils/drag-drop';
import { createEmptySection, documentsAreEqual } from '../utils/document';
import type {
  CanvasSection,
  CanvasDocument,
  CanvasContentBlock,
  BlockDefinition,
  CustomBlockDefinition,
} from '@react-email-dnd/shared';
import clsx from 'clsx';
import { buildBlockDefinitionMap, buildCustomBlockRegistry } from '../utils/block-library';
export interface EmailEditorProps {
  showHeader?: boolean;
  className?: string;
  daisyui?: boolean;
  /** When false, locked items cannot be unlocked and will not accept any drops */
  unlockable?: boolean;
  /** Initial JSON document to load into the editor */
  initialDocument?: CanvasDocument;
  /** Callback fired whenever the document changes (for real-time updates) */
  onDocumentChange?: (document: CanvasDocument) => void;
  /** Callback fired when the user clicks the save button */
  onSave?: (document: CanvasDocument) => void;
  /** Array of predefined colors for color picker */
  colors?: ColorOption[];
  /** Optional palette specifically for text colors; falls back to `colors` when omitted */
  textColors?: ColorOption[];
  /** Optional palette specifically for background colors; falls back to `colors` when omitted */
  bgColors?: ColorOption[];
  /** Custom content blocks that should be available from the sidebar */
  // Using `any` by design to allow heterogeneous custom block props across definitions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlocks?: CustomBlockDefinition<any>[];
  /** Custom properties forms for custom content blocks, keyed by component name */
  customBlockPropEditors?: CustomBlockPropEditors;
}

export function EmailEditor({
  showHeader = true,
  className = '',
  daisyui = false,
  unlockable = true,
  initialDocument,
  onDocumentChange,
  colors,
  textColors,
  bgColors,
  customBlocks = [],
  customBlockPropEditors,
}: EmailEditorProps) {
  const { document, setDocument } = useCanvasStore();
  const sections = document.sections;
  const [activeId, setActiveId] = useState<string | null>(null);

  const contentBlocks = useMemo(() => {
    return [...DEFAULT_CONTENT_ITEMS, ...customBlocks] as BlockDefinition<CanvasContentBlock>[];
  }, [customBlocks]);

  const blockDefinitionMap = useMemo(() => buildBlockDefinitionMap(contentBlocks), [contentBlocks]);

  const customBlockRegistry = useMemo(
    () => buildCustomBlockRegistry(contentBlocks),
    [contentBlocks],
  );

  const getPointerCenter = (
    event: DragEndEvent,
    fallback?: { top: number; left: number; width: number; height: number },
  ) => {
    const current = event.active.rect.current;
    const rect = current.translated || current.initial;
    if (
      rect &&
      rect.left != null &&
      rect.top != null &&
      rect.width != null &&
      rect.height != null
    ) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return { x, y };
    }
    if (fallback) {
      return { x: fallback.left + fallback.width / 2, y: fallback.top + fallback.height / 2 };
    }
    return { x: 0, y: 0 };
  };

  // Helper functions to check if containers are locked
  const isColumnLocked = (columnId: string): boolean => {
    for (const section of sections) {
      for (const row of section.rows) {
        const column = row.columns.find((col) => col.id === columnId);
        if (column) {
          // Check if column OR any parent container is locked
          return !!(column.locked || row.locked || section.locked);
        }
      }
    }
    return false;
  };

  const isRowLocked = (rowId: string): boolean => {
    for (const section of sections) {
      const row = section.rows.find((r) => r.id === rowId);
      if (row) {
        // Check if row OR parent section is locked
        return !!(row.locked || section.locked);
      }
    }
    return false;
  };

  const isSectionLocked = (sectionId: string): boolean => {
    const section = sections.find((s) => s.id === sectionId);
    return !!section?.locked;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Handle initial document
  useEffect(() => {
    if (!initialDocument) {
      return;
    }

    if (documentsAreEqual(document, initialDocument)) {
      return;
    }

    setDocument(initialDocument, { replaceHistory: true, markAsSaved: true });
  }, [initialDocument, setDocument, document]);

  const commitSections = (updater: (sections: CanvasSection[]) => CanvasSection[]) => {
    const nextSections = updater(sections);

    if (nextSections === sections) {
      return;
    }

    const nextDocument = {
      ...document,
      sections: nextSections,
    };

    setDocument(nextDocument);

    // Notify parent component of document changes
    onDocumentChange?.(nextDocument);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    console.log('🟢 DRAG START:', {
      activeId: String(event.active.id),
      activeData: event.active.data.current,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    if (!event.over) {
      return;
    }

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const activeData = event.active.data.current as ActiveDragData | undefined;
    const overData = event.over.data.current as OverDragData | undefined;

    console.log('🔴 DRAG END:', {
      activeId,
      overId,
      activeType: activeData?.type,
      overType: overData?.type,
      activeData,
      overData,
    });

    // Handle sidebar item drops (structure and content blocks)
    if (activeId.startsWith('structure-')) {
      const result = handleSidebarDrop(activeId, overId, sections, blockDefinitionMap);
      if (result) {
        commitSections(() => result);
      } else {
        console.log('🚫 Drop not allowed:', { activeId, overId });
      }
      return;
    }

    if (activeId.startsWith('block-')) {
      const block = createBlockFromSidebar(activeId, blockDefinitionMap);
      if (!block) {
        console.warn('Unsupported block dragged from sidebar:', activeId);
        return;
      }

      if (overData?.type === 'canvas-block') {
        const targetPosition = findBlockPosition(sections, overData.blockId);
        if (!targetPosition) {
          return;
        }
        // Check if target column is locked
        if (isColumnLocked(targetPosition.columnId)) {
          console.log('🚫 Cannot drop into locked column');
          return;
        }
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        const insertAfter = overRect ? pointer.y > overRect.top + overRect.height / 2 : false;
        const targetIndex = targetPosition.blockIndex + (insertAfter ? 1 : 0);
        commitSections((previous) =>
          addBlockToColumnAtIndex(previous, targetPosition.columnId, block, targetIndex),
        );
        return;
      }

      if (overData?.type === 'canvas-column') {
        // Check if target column is locked
        if (isColumnLocked(overData.columnId)) {
          console.log('🚫 Cannot drop into locked column');
          return;
        }
        const targetPosition = findColumnPosition(sections, overData.columnId);
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        let targetIndex = targetPosition
          ? targetPosition.column.blocks.length
          : overData.blockCount;
        if (overRect && targetPosition) {
          const isTopHalf = pointer.y < overRect.top + overRect.height / 2;
          targetIndex = isTopHalf ? 0 : targetPosition.column.blocks.length;
        }
        commitSections((previous) =>
          addBlockToColumnAtIndex(previous, overData.columnId, block, targetIndex),
        );
        return;
      }

      if (overData?.type === 'canvas-row-container') {
        // Check if target row is locked
        if (isRowLocked(overData.rowId)) {
          console.log('🚫 Cannot drop into locked row');
          return;
        }
        const targetRow = findRowPosition(sections, overData.rowId);
        if (!targetRow || targetRow.row.columns.length === 0) {
          return;
        }
        const rowRect = event.over?.rect;
        const pointer = getPointerCenter(event, rowRect);
        let targetColumnIndex = 0;
        if (rowRect) {
          const relativeX = Math.max(0, Math.min(pointer.x - rowRect.left, rowRect.width));
          const ratio = rowRect.width > 0 ? relativeX / rowRect.width : 0;
          targetColumnIndex = Math.min(
            targetRow.row.columns.length - 1,
            Math.max(0, Math.floor(ratio * targetRow.row.columns.length)),
          );
        }
        const columnId = targetRow.row.columns[targetColumnIndex].id;
        const targetIndex = targetRow.row.columns[targetColumnIndex].blocks.length;
        commitSections((previous) =>
          addBlockToColumnAtIndex(previous, columnId, block, targetIndex),
        );
        return;
      }

      if (overData?.type === 'canvas-section') {
        // Check if target section is locked
        if (isSectionLocked(overData.sectionId)) {
          console.log('🚫 Cannot drop into locked section');
          return;
        }
        // Bubble into the section: ensure it has a row, then insert at end of first column
        const sectionId = overData.sectionId;
        commitSections((previous) => {
          let next = previous;
          const sectionIndex = next.findIndex((s) => s.id === sectionId);
          if (sectionIndex !== -1) {
            const targetSection = next[sectionIndex];
            if (targetSection.rows.length === 0) {
              next = addRowToSection(next, sectionId, 1);
            }
            const updatedSection = next.find((s) => s.id === sectionId)!;
            const firstColumnId = updatedSection.rows[updatedSection.rows.length - 1].columns[0].id;
            return addBlockToColumnAtIndex(
              next,
              firstColumnId,
              block,
              Infinity as unknown as number,
            );
          }
          return previous;
        });
        return;
      }

      // Fallback to default handler
      const result = handleSidebarDrop(activeId, overId, sections, blockDefinitionMap);
      if (result) {
        commitSections(() => result);
      } else {
        console.log('🚫 Drop not allowed (content fallback):', { activeId, overId });
      }
      return;
    }

    // Handle canvas row movements
    if (activeData?.type === 'canvas-row-item') {
      const sourcePosition = findRowPosition(sections, activeData.rowId);

      if (!sourcePosition) {
        return;
      }

      // Allow dropping rows to canvas to create new sections
      if (overId === 'canvas') {
        const newSection = createEmptySection();
        commitSections((previous) => {
          const rowToMove = sourcePosition.row;
          const withoutRow = previous.map((section) => {
            if (section.id !== sourcePosition.sectionId) {
              return section;
            }
            return {
              ...section,
              rows: section.rows.filter((_, index) => index !== sourcePosition.rowIndex),
            };
          });
          return [...withoutRow, { ...newSection, rows: [rowToMove] }];
        });
        return;
      }

      if (overData?.type === 'canvas-row-item') {
        const targetPosition = findRowPosition(sections, overData.rowId);

        if (!targetPosition) {
          return;
        }

        commitSections((previous) =>
          moveRowToSection(
            previous,
            sourcePosition.sectionId,
            targetPosition.sectionId,
            sourcePosition.rowIndex,
            targetPosition.rowIndex,
          ),
        );
        return;
      }

      if (overData?.type === 'canvas-section') {
        // Check if target section is locked
        if (isSectionLocked(overData.sectionId)) {
          console.log('🚫 Cannot move row to locked section');
          return;
        }
        commitSections((previous) =>
          moveRowToSection(
            previous,
            sourcePosition.sectionId,
            overData.sectionId,
            sourcePosition.rowIndex,
            overData.rowCount,
          ),
        );
        return;
      }

      // Allow dropping a row on a specific column: insert after that column's row
      if (overData?.type === 'canvas-column') {
        const targetPosition = findColumnPosition(sections, overData.columnId);
        if (!targetPosition) {
          return;
        }

        commitSections((previous) =>
          moveRowToSection(
            previous,
            sourcePosition.sectionId,
            targetPosition.sectionId,
            sourcePosition.rowIndex,
            targetPosition.rowIndex + 1,
          ),
        );
        return;
      }
    }

    // Handle canvas column movements
    if (activeData?.type === 'canvas-column-item') {
      const sourcePosition = findColumnPosition(sections, activeData.columnId);

      if (!sourcePosition) {
        return;
      }

      // Prevent dropping columns directly to canvas (Main) - columns must be in rows
      if (overId === 'canvas') {
        return;
      }

      if (overData?.type === 'canvas-column-item') {
        const targetPosition = findColumnPosition(sections, overData.columnId);

        if (!targetPosition) {
          return;
        }

        commitSections((previous) =>
          moveColumnToRow(
            previous,
            sourcePosition.sectionId,
            sourcePosition.rowId,
            targetPosition.sectionId,
            targetPosition.rowId,
            sourcePosition.columnIndex,
            targetPosition.columnIndex,
          ),
        );
        return;
      }

      // Handle column dropped on row - append to end of row
      if (overData?.type === 'canvas-row-container') {
        // Check if target row is locked
        if (isRowLocked(overData.rowId)) {
          console.log('🚫 Cannot move column to locked row');
          return;
        }
        commitSections((previous) =>
          moveColumnToRow(
            previous,
            sourcePosition.sectionId,
            sourcePosition.rowId,
            overData.sectionId,
            overData.rowId,
            sourcePosition.columnIndex,
            overData.columnCount,
          ),
        );
        return;
      }
    }

    // Handle canvas block movements
    if (activeData?.type === 'canvas-block') {
      const sourcePosition = findBlockPosition(sections, activeData.blockId);

      if (!sourcePosition) {
        return;
      }

      const { columnId: sourceColumnId, blockIndex } = sourcePosition;

      if (overData?.type === 'canvas-block') {
        const targetPosition = findBlockPosition(sections, overData.blockId);

        if (!targetPosition) {
          return;
        }

        // Check if target column is locked
        if (isColumnLocked(targetPosition.columnId)) {
          console.log('🚫 Cannot move block to locked column');
          return;
        }

        // Insert before/after depending on pointer Y relative to target block center
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        const insertAfter = overRect ? pointer.y > overRect.top + overRect.height / 2 : false;
        const targetIndex = targetPosition.blockIndex + (insertAfter ? 1 : 0);

        commitSections((previous) =>
          moveBlockToColumn(
            previous,
            sourceColumnId,
            targetPosition.columnId,
            blockIndex,
            targetIndex,
          ),
        );
        return;
      }

      if (overData?.type === 'canvas-column') {
        // Check if target column is locked
        if (isColumnLocked(overData.columnId)) {
          console.log('🚫 Cannot move block to locked column');
          return;
        }
        const targetPosition = findColumnPosition(sections, overData.columnId);
        // If we have the column rect, drop to start or end depending on pointer Y
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        let targetIndex = targetPosition
          ? targetPosition.column.blocks.length
          : overData.blockCount;
        if (overRect && targetPosition) {
          const isTopHalf = pointer.y < overRect.top + overRect.height / 2;
          targetIndex = isTopHalf ? 0 : targetPosition.column.blocks.length;
        }

        commitSections((previous) =>
          moveBlockToColumn(previous, sourceColumnId, overData.columnId, blockIndex, targetIndex),
        );
        return;
      }

      // Allow dropping a block on a row: append to the first column of that row
      if (overData?.type === 'canvas-row-container') {
        // Check if target row is locked
        if (isRowLocked(overData.rowId)) {
          console.log('🚫 Cannot move block to locked row');
          return;
        }
        const targetRow = findRowPosition(sections, overData.rowId);
        if (!targetRow || targetRow.row.columns.length === 0) {
          return;
        }
        // Choose target column based on pointer X position within the row rect
        const rowRect = event.over?.rect;
        const pointer = getPointerCenter(event, rowRect);
        let targetColumnIndex = 0;
        if (rowRect) {
          const relativeX = Math.max(0, Math.min(pointer.x - rowRect.left, rowRect.width));
          const ratio = rowRect.width > 0 ? relativeX / rowRect.width : 0;
          targetColumnIndex = Math.min(
            targetRow.row.columns.length - 1,
            Math.max(0, Math.floor(ratio * targetRow.row.columns.length)),
          );
        }
        const columnId = targetRow.row.columns[targetColumnIndex].id;
        const targetIndex = targetRow.row.columns[targetColumnIndex].blocks.length;

        commitSections((previous) =>
          moveBlockToColumn(previous, sourceColumnId, columnId, blockIndex, targetIndex),
        );
        return;
      }
    }

    // Handle canvas section movements
    if (activeData?.type === 'canvas-section-item') {
      const sourceSectionIndex = findSectionPosition(sections, activeData.sectionId);

      if (sourceSectionIndex === null) {
        return;
      }

      // Handle dropping on another section (droppable area)
      if (overData?.type === 'canvas-section') {
        const targetSectionIndex = findSectionPosition(sections, overData.sectionId);

        if (targetSectionIndex === null) {
          return;
        }

        commitSections((previous) =>
          moveSectionToPosition(previous, sourceSectionIndex, targetSectionIndex),
        );
        return;
      }

      // Handle dropping on another section item (sortable item)
      if (overData?.type === 'canvas-section-item') {
        const targetSectionIndex = findSectionPosition(sections, overData.sectionId);

        if (targetSectionIndex === null) {
          return;
        }

        commitSections((previous) =>
          moveSectionToPosition(previous, sourceSectionIndex, targetSectionIndex),
        );
        return;
      }

      // Allow dropping sections to canvas to reorder at the end
      if (overId === 'canvas') {
        commitSections((previous) =>
          moveSectionToPosition(previous, sourceSectionIndex, previous.length - 1),
        );
        return;
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={clsx('w-full h-screen flex flex-col', className)}>
        {showHeader && <Header daisyui={daisyui} />}
        <div className="flex h-full overflow-hidden">
          <Sidebar daisyui={daisyui} blocks={contentBlocks} />
          <div className="flex-1 h-full overflow-auto">
            <Main
              sections={sections}
              daisyui={daisyui}
              unlockable={unlockable}
              customBlockRegistry={customBlockRegistry}
            />
          </div>
        </div>
        <PropertiesPanel
          daisyui={daisyui}
          colors={colors}
          textColors={textColors}
          bgColors={bgColors}
          customBlockPropEditors={customBlockPropEditors}
        />
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-sm shadow">
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
