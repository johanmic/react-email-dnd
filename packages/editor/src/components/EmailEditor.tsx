import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Main } from './Main';
import { Header } from './Header';
import { PropertiesPanel } from './PropertiesPanel';
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
} from '../utils/drag-drop';
import { createEmptySection } from '../utils/document';
import type { CanvasSection, CanvasDocument } from '../types/schema';
import clsx from 'clsx';
export interface EmailEditorProps {
  showHeader?: boolean;
  className?: string;
  daisyui?: boolean;
  /** Initial JSON document to load into the editor */
  initialDocument?: CanvasDocument;
  /** Callback fired whenever the document changes (for real-time updates) */
  onDocumentChange?: (document: CanvasDocument) => void;
  /** Callback fired when the user clicks the save button */
  onSave?: (document: CanvasDocument) => void;
}

export function EmailEditor({
  showHeader = true,
  className = '',
  daisyui = false,
  initialDocument,
  onDocumentChange,
}: EmailEditorProps) {
  const { document, setDocument } = useCanvasStore();
  const sections = document.sections;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Handle initial document
  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument, { replaceHistory: true, markAsSaved: true });
    }
  }, [initialDocument, setDocument]);

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
    if (activeId.startsWith('structure-') || activeId.startsWith('block-')) {
      const result = handleSidebarDrop(activeId, overId, sections);

      if (result) {
        commitSections(() => result);
      } else {
        console.log('🚫 Drop not allowed:', { activeId, overId });
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

        commitSections((previous) =>
          moveBlockToColumn(
            previous,
            sourceColumnId,
            targetPosition.columnId,
            blockIndex,
            targetPosition.blockIndex,
          ),
        );
        return;
      }

      if (overData?.type === 'canvas-column') {
        const targetPosition = findColumnPosition(sections, overData.columnId);
        const targetIndex = targetPosition
          ? targetPosition.column.blocks.length
          : overData.blockCount;

        commitSections((previous) =>
          moveBlockToColumn(previous, sourceColumnId, overData.columnId, blockIndex, targetIndex),
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={clsx('w-full h-screen flex flex-col', className)}>
        {showHeader && <Header daisyui={daisyui} />}
        <div className="flex h-full">
          <Sidebar daisyui={daisyui} />
          <Main sections={sections} daisyui={daisyui} />
        </div>
        <PropertiesPanel />
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
