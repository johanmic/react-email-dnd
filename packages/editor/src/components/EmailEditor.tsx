'use client';

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, DEFAULT_CONTENT_ITEMS, DEFAULT_STRUCTURE_ITEMS } from './Sidebar';
import { Main } from './Main';
import { Header } from './Header';
import type { ColorOption, Padding } from '@react-email-dnd/shared';

// Re-export HeaderItem type to avoid import resolution issues
export type HeaderItem = 'title' | 'preview' | 'codeview' | 'undo' | 'save';
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
  createBlockFromSidebar,
  addBlockToColumn,
  addBlockToColumnAtIndex,
  addRowToSection,
  addRowToSectionAtIndex,
  getColumnCountFromStructureId,
  type StructureDropId,
} from '../utils/drag-drop';
import { createEmptySection, createEmptyColumn, documentsAreEqual } from '../utils/document';
import type {
  CanvasSection,
  CanvasDocument,
  CanvasContentBlock,
  BlockDefinition,
  CustomBlockDefinition,
  FontDefinition,
} from '@react-email-dnd/shared';
import clsx from 'clsx';
import { buildBlockDefinitionMap, buildCustomBlockRegistry } from '../utils/block-library';
import { withCombinedClassNames } from '../utils/classNames';
import { normalizePaddingOptions } from '../utils/padding';
export type EmailEditorProps = {
  /** Show the header bar with actions */
  showHeader?: boolean;
  /** Additional CSS class name for the root element */
  className?: string;
  /** Use DaisyUI styling */
  daisyui?: boolean;
  /** Color highlighting mode for canvas elements */
  colorMode?: 'hierarchy' | 'primary' | 'none' | 'output';
  /** Controls how deep the visual highlighting goes (1=Section, 2=Section+Row, 3=Section+Row+Column). Default null shows all levels. */
  colorModeDepth?: number | null;
  /** When false, locked items cannot be unlocked and will not accept any drops */
  unlockable?: boolean;
  /** When false, hidden items are not shown in the editor */
  showHidden?: boolean;
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
  /** Number of columns to display in the sidebar. Default is 2. */
  sideBarColumns?: 1 | 2 | 3;
  /** Custom content blocks that should be available from the sidebar */
  // Using `any` by design to allow heterogeneous custom block props across definitions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlocks?: CustomBlockDefinition<any>[];
  /** Preset padding options displayed as quick-select buttons */
  padding?: Record<string, Padding>;
  /** Available fonts for selection in text, heading, and button blocks */
  fonts?: FontDefinition[];
  /** Filter which blocks to show in sidebar. Only blocks matching these IDs will be visible. Empty array shows all blocks. */
  blocks?: string[];
  /** When true, variables cannot be edited and only existing variables are displayed. If no variables exist, the variables section is hidden. */
  variablesLocked?: boolean;
  /** Filter which header items to show. Only items matching these types will be visible. Default is all items. */
  headerItems?: HeaderItem[];
  /** Breakpoint in pixels for mobile/desktop detection. Default is 768. */
  mobileBreakpoint?: number;
  /** Force mobile layout regardless of viewport size */
  forceMobileLayout?: boolean;
  /** Force desktop layout regardless of viewport size */
  forceDesktopLayout?: boolean;
  /** Show inline insertion controls (plus buttons). Defaults to auto-detect based on mobile layout. */
  showInlineInsertionControls?: boolean;
  /** Always show sidebar even on mobile */
  alwaysShowSidebar?: boolean;
};

export function EmailEditor(props: EmailEditorProps) {
  const {
    showHeader = true,
    className,
    daisyui = false,
    colorMode = 'hierarchy',
    colorModeDepth = null,
    unlockable = true,
    showHidden = false,
    sideBarColumns = 2,
    initialDocument,
    onDocumentChange,
    colors,
    textColors,
    bgColors,
    customBlocks = [],
    padding,
    fonts,
    blocks,
    variablesLocked = false,
    headerItems,
    mobileBreakpoint = 768,
    forceMobileLayout,
    forceDesktopLayout,
    showInlineInsertionControls,
    alwaysShowSidebar = false,
  } = props;
  const {
    document,
    setDocument,
    setLayoutMode,
    setForceLayoutMode,
    setShowInlineInsertion,
    isMobileExperience,
  } = useCanvasStore();
  const sections = document.sections;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);

  // Build all blocks (for rendering) - includes all custom blocks
  const allBlocks = useMemo(() => {
    return [...DEFAULT_CONTENT_ITEMS, ...customBlocks] as BlockDefinition<CanvasContentBlock>[];
  }, [customBlocks]);

  // Filter blocks for sidebar display only (when blocks prop is provided)
  const contentBlocks = useMemo(() => {
    // If blocks prop is undefined or empty, show all blocks
    if (!blocks || blocks.length === 0) {
      return allBlocks;
    }

    // Filter blocks to only include those in the blocks array
    const blocksSet = new Set(blocks);
    const filteredBlocks = allBlocks.filter((block) => blocksSet.has(block.type));
    console.log('[EmailEditor] Filtering blocks:', {
      requested: blocks,
      allBlockTypes: allBlocks.map((b) => b.type),
      filteredTypes: filteredBlocks.map((b) => b.type),
    });
    return filteredBlocks;
  }, [allBlocks, blocks]);

  const filteredStructureItems = useMemo(() => {
    // If blocks prop is undefined or empty, show all structure items
    if (!blocks || blocks.length === 0) {
      return DEFAULT_STRUCTURE_ITEMS;
    }

    // Filter structure items based on block IDs
    const blocksSet = new Set(blocks);
    return DEFAULT_STRUCTURE_ITEMS.filter((item) => blocksSet.has(item.id));
  }, [blocks]);

  const blockDefinitionMap = useMemo(() => buildBlockDefinitionMap(contentBlocks), [contentBlocks]);

  // Build customBlockRegistry from all custom blocks (not filtered) so they can be rendered
  // even if they're not in the sidebar
  const customBlockRegistry = useMemo(() => buildCustomBlockRegistry(allBlocks), [allBlocks]);

  const paddingOptionEntries = useMemo(() => normalizePaddingOptions(padding), [padding]);

  // Viewport detection for mobile/desktop layout
  useEffect(() => {
    if (forceMobileLayout !== undefined || forceDesktopLayout !== undefined) {
      // Respect forced layout modes
      if (forceMobileLayout) {
        setForceLayoutMode('mobile');
      } else if (forceDesktopLayout) {
        setForceLayoutMode('desktop');
      } else {
        setForceLayoutMode(null);
      }
      return;
    }

    // Auto-detect viewport size
    const mediaQuery = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const updateLayoutMode = () => {
      setLayoutMode(mediaQuery.matches ? 'mobile' : 'desktop');
    };

    // Set initial value
    updateLayoutMode();

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateLayoutMode);
      return () => mediaQuery.removeEventListener('change', updateLayoutMode);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateLayoutMode);
      return () => mediaQuery.removeListener(updateLayoutMode);
    }
  }, [mobileBreakpoint, forceMobileLayout, forceDesktopLayout, setLayoutMode, setForceLayoutMode]);

  // Update showInlineInsertion based on mobile experience
  useEffect(() => {
    if (showInlineInsertionControls !== undefined) {
      setShowInlineInsertion(showInlineInsertionControls);
    } else {
      // Auto-detect: show inline insertion on mobile
      setShowInlineInsertion(isMobileExperience);
    }
  }, [showInlineInsertionControls, isMobileExperience, setShowInlineInsertion]);

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

  // Helper functions to check if containers are locked or hidden
  const isColumnDisabled = (columnId: string): boolean => {
    for (const section of sections) {
      for (const row of section.rows) {
        const column = row.columns.find((col) => col.id === columnId);
        if (column) {
          // Check if column OR any parent container is locked
          const isLocked = !!(column.locked || row.locked || section.locked);
          // Check if column OR any parent container is hidden (when showHidden is false)
          const isHidden = !showHidden && !!(column.hidden || row.hidden || section.hidden);
          return isLocked || isHidden;
        }
      }
    }
    return false;
  };

  const isRowDisabled = (rowId: string): boolean => {
    for (const section of sections) {
      const row = section.rows.find((r) => r.id === rowId);
      if (row) {
        // Check if row OR parent section is locked
        const isLocked = !!(row.locked || section.locked);
        // Check if row OR parent section is hidden (when showHidden is false)
        const isHidden = !showHidden && !!(row.hidden || section.hidden);
        return isLocked || isHidden;
      }
    }
    return false;
  };

  const isSectionDisabled = (sectionId: string): boolean => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const isLocked = !!section.locked;
      const isHidden = !showHidden && !!section.hidden;
      return isLocked || isHidden;
    }
    return false;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
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

  const commitSections = useCallback(
    (updater: (sections: CanvasSection[]) => CanvasSection[]) => {
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
      if (onDocumentChange) {
        onDocumentChange(withCombinedClassNames(nextDocument));
      }
    },
    [document, setDocument, onDocumentChange, sections],
  );

  // Callbacks for inline insertion
  const handleAddSection = useCallback(() => {
    commitSections((previous) => [...previous, createEmptySection()]);
  }, [commitSections]);

  const handleAddRow = useCallback(
    (sectionId: string, columnCount: number = 1, index?: number) => {
      commitSections((previous) => {
        if (index !== undefined) {
          return addRowToSectionAtIndex(previous, sectionId, columnCount, index);
        }
        return addRowToSection(previous, sectionId, columnCount);
      });
    },
    [commitSections],
  );

  const handleAddColumn = useCallback(
    (rowId: string, columnCount: number = 1, index?: number) => {
      commitSections((previous) => {
        // Find the row and add a column to it
        return previous.map((section) => ({
          ...section,
          rows: section.rows.map((row) => {
            if (row.id !== rowId) return row;
            const newColumns = Array.from({ length: columnCount }, () => createEmptyColumn());
            if (index !== undefined) {
              const nextColumns = [...row.columns];
              nextColumns.splice(index, 0, ...newColumns);
              return { ...row, columns: nextColumns };
            }
            return { ...row, columns: [...row.columns, ...newColumns] };
          }),
        }));
      });
    },
    [commitSections],
  );

  const handleAddBlock = useCallback(
    (columnId: string, blockKey: string, index?: number) => {
      // blockKey is the palette key (from getBlockPaletteKey), convert to sidebar block ID
      const sidebarBlockId = `block-${blockKey}`;
      const block = createBlockFromSidebar(
        sidebarBlockId,
        blockDefinitionMap,
        textColors ?? colors,
      );
      if (!block) {
        console.warn('Unsupported block key:', blockKey);
        return;
      }
      commitSections((previous) => {
        if (index !== undefined) {
          return addBlockToColumnAtIndex(previous, columnId, block, index);
        }
        return addBlockToColumn(previous, columnId, block);
      });
    },
    [commitSections, blockDefinitionMap, textColors, colors],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    const data = event.active.data.current as ActiveDragData | undefined;
    setActiveId(id);
    setActiveDragData(data || null);
    console.log('🟢 DRAG START:', {
      activeId: id,
      activeData: data,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveDragData(null);

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

    // Handle drops back to sidebar (cancellation)
    if (overId.startsWith('sidebar-drop-')) {
      const originalId = overId.replace('sidebar-drop-', '');
      if (activeId === originalId) {
        console.log('🚫 Drop cancelled - returned to original sidebar position:', {
          activeId,
          originalId,
        });
        return;
      }
    }

    // Handle sidebar item drops (structure and content blocks)
    if (activeId.startsWith('structure-')) {
      if (overData?.type === 'canvas-row-dropzone' && activeId !== 'structure-section') {
        if (isSectionDisabled(overData.sectionId)) {
          console.log('🚫 Cannot add row to disabled section');
          return;
        }

        const columnCount = getColumnCountFromStructureId(activeId as StructureDropId);
        commitSections((previous) =>
          addRowToSectionAtIndex(previous, overData.sectionId, columnCount, overData.index),
        );
        return;
      }

      const overRect = event.over?.rect;
      const pointer = getPointerCenter(event, overRect);
      const result = handleSidebarDrop(
        activeId,
        overId,
        sections,
        blockDefinitionMap,
        {
          pointerY: pointer.y,
          overRect: overRect,
        },
        textColors ?? colors,
      );
      if (result) {
        commitSections(() => result);
      } else {
        console.log('🚫 Drop not allowed:', { activeId, overId });
      }
      return;
    }

    if (activeId.startsWith('block-')) {
      const block = createBlockFromSidebar(activeId, blockDefinitionMap, textColors ?? colors);
      if (!block) {
        console.warn('Unsupported block dragged from sidebar:', activeId);
        return;
      }

      if (overData?.type === 'canvas-block-dropzone') {
        if (isColumnDisabled(overData.columnId)) {
          console.log('🚫 Cannot drop into disabled column');
          return;
        }

        commitSections((previous) =>
          addBlockToColumnAtIndex(previous, overData.columnId, block, overData.index),
        );
        return;
      }

      if (overData?.type === 'canvas-block') {
        const targetPosition = findBlockPosition(sections, overData.blockId);
        if (!targetPosition) {
          return;
        }
        // Check if target column is disabled
        if (isColumnDisabled(targetPosition.columnId)) {
          console.log('🚫 Cannot drop into disabled column');
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
        // Check if target column is disabled
        if (isColumnDisabled(overData.columnId)) {
          console.log('🚫 Cannot drop into disabled column');
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
        // Check if target row is disabled
        if (isRowDisabled(overData.rowId)) {
          console.log('🚫 Cannot drop into disabled row');
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
        // Check if target column is disabled
        if (isColumnDisabled(columnId)) {
          console.log('🚫 Cannot drop into disabled column');
          return;
        }
        const targetIndex = targetRow.row.columns[targetColumnIndex].blocks.length;
        commitSections((previous) =>
          addBlockToColumnAtIndex(previous, columnId, block, targetIndex),
        );
        return;
      }

      if (overData?.type === 'canvas-section') {
        // Check if target section is disabled
        if (isSectionDisabled(overData.sectionId)) {
          console.log('🚫 Cannot drop into disabled section');
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
            const lastRow = updatedSection.rows[updatedSection.rows.length - 1];
            // Safety check: ensure the row has columns
            if (!lastRow || !lastRow.columns || lastRow.columns.length === 0) {
              console.warn('Cannot add block to section: row has no columns');
              return previous;
            }
            // Check if target row is disabled
            if (isRowDisabled(lastRow.id)) {
              console.log('🚫 Cannot drop into disabled row');
              return previous;
            }
            const firstColumnId = lastRow.columns[0].id;
            // Check if target column is disabled
            if (isColumnDisabled(firstColumnId)) {
              console.log('🚫 Cannot drop into disabled column');
              return previous;
            }
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

      // Only allow drops on valid droppable areas - no fallback behavior
      console.log('🚫 Drop not allowed - no valid drop target:', { activeId, overId });
      return;
    }

    // Handle canvas row movements
    if (activeData?.type === 'canvas-row-item') {
      const sourcePosition = findRowPosition(sections, activeData.rowId);

      if (!sourcePosition) {
        return;
      }

      if (overData?.type === 'canvas-row-dropzone') {
        if (isSectionDisabled(overData.sectionId)) {
          console.log('🚫 Cannot move row to disabled section');
          return;
        }

        commitSections((previous) =>
          moveRowToSection(
            previous,
            sourcePosition.sectionId,
            overData.sectionId,
            sourcePosition.rowIndex,
            overData.index,
          ),
        );
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

        // Check if target section is disabled
        if (isSectionDisabled(targetPosition.sectionId)) {
          console.log('🚫 Cannot move row to disabled section');
          return;
        }

        // Insert before/after depending on pointer Y relative to target row center
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        const insertAfter = overRect ? pointer.y > overRect.top + overRect.height / 2 : false;
        const targetIndex = targetPosition.rowIndex + (insertAfter ? 1 : 0);

        commitSections((previous) =>
          moveRowToSection(
            previous,
            sourcePosition.sectionId,
            targetPosition.sectionId,
            sourcePosition.rowIndex,
            targetIndex,
          ),
        );
        return;
      }

      if (overData?.type === 'canvas-section') {
        // Check if target section is disabled
        if (isSectionDisabled(overData.sectionId)) {
          console.log('🚫 Cannot move row to disabled section');
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
        // Check if target row is disabled
        if (isRowDisabled(overData.rowId)) {
          console.log('🚫 Cannot move column to disabled row');
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

      if (overData?.type === 'canvas-block-dropzone') {
        if (isColumnDisabled(overData.columnId)) {
          console.log('🚫 Cannot move block to disabled column');
          return;
        }

        commitSections((previous) =>
          moveBlockToColumn(
            previous,
            sourceColumnId,
            overData.columnId,
            blockIndex,
            overData.index,
          ),
        );
        return;
      }

      if (overData?.type === 'canvas-block') {
        const targetPosition = findBlockPosition(sections, overData.blockId);

        if (!targetPosition) {
          return;
        }

        // Check if target column is disabled
        if (isColumnDisabled(targetPosition.columnId)) {
          console.log('🚫 Cannot move block to disabled column');
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
        // Check if target column is disabled
        if (isColumnDisabled(overData.columnId)) {
          console.log('🚫 Cannot move block to disabled column');
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
        // Check if target row is disabled
        if (isRowDisabled(overData.rowId)) {
          console.log('🚫 Cannot move block to disabled row');
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
        // Check if target column is disabled
        if (isColumnDisabled(columnId)) {
          console.log('🚫 Cannot move block to disabled column');
          return;
        }
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

        // Insert before/after depending on pointer Y relative to target section center
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        const insertAfter = overRect ? pointer.y > overRect.top + overRect.height / 2 : false;
        const finalTargetIndex = targetSectionIndex + (insertAfter ? 1 : 0);

        commitSections((previous) =>
          moveSectionToPosition(previous, sourceSectionIndex, finalTargetIndex),
        );
        return;
      }

      // Handle dropping on another section item (sortable item)
      if (overData?.type === 'canvas-section-item') {
        const targetSectionIndex = findSectionPosition(sections, overData.sectionId);

        if (targetSectionIndex === null) {
          return;
        }

        // Insert before/after depending on pointer Y relative to target section center
        const overRect = event.over?.rect;
        const pointer = getPointerCenter(event, overRect);
        const insertAfter = overRect ? pointer.y > overRect.top + overRect.height / 2 : false;
        const finalTargetIndex = targetSectionIndex + (insertAfter ? 1 : 0);

        commitSections((previous) =>
          moveSectionToPosition(previous, sourceSectionIndex, finalTargetIndex),
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
    setActiveDragData(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={clsx('w-full h-screen flex flex-col', className)}>
        {showHeader && <Header daisyui={daisyui} headerItems={headerItems} />}
        <div className="flex h-full overflow-hidden">
          {(!isMobileExperience || alwaysShowSidebar) && (
            <Sidebar
              columns={sideBarColumns}
              daisyui={daisyui}
              blocks={contentBlocks}
              structureItems={filteredStructureItems}
              variablesLocked={variablesLocked}
              hidden={isMobileExperience && !alwaysShowSidebar}
            />
          )}
          <div className="flex-1 h-full overflow-auto">
            <Main
              sections={sections}
              daisyui={daisyui}
              colorMode={colorMode}
              colorModeDepth={colorModeDepth}
              unlockable={unlockable}
              showHidden={showHidden}
              customBlockRegistry={customBlockRegistry}
              inlineInsertionMode={isMobileExperience && (showInlineInsertionControls ?? true)}
              inlineInsertionVariant="icon-with-label"
              onAddSection={handleAddSection}
              onAddRow={handleAddRow}
              onAddColumn={handleAddColumn}
              onAddBlock={handleAddBlock}
              contentBlocks={contentBlocks}
              structureItems={filteredStructureItems}
            />
          </div>
        </div>
        <PropertiesPanel
          daisyui={daisyui}
          colors={colors}
          textColors={textColors}
          bgColors={bgColors}
          unlockable={unlockable}
          customBlockRegistry={customBlockRegistry}
          paddingOptions={paddingOptionEntries}
          fonts={fonts || document.theme?.fonts}
        />
      </div>
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeId && activeDragData
          ? (() => {
              // Check if it's a structure item
              if (activeId.startsWith('structure-')) {
                const structureItem = filteredStructureItems.find((item) => item.id === activeId);
                if (structureItem) {
                  const Icon = structureItem.icon;
                  return (
                    <div
                      className={clsx('flex items-center gap-4', {
                        'p-3 rounded-xl border border-dashed border-slate-900/10 bg-white text-slate-900 text-sm font-medium leading-5':
                          !daisyui,
                      })}
                      style={{
                        pointerEvents: 'none',
                        cursor: 'grabbing',
                      }}
                    >
                      <Icon size={18} weight="duotone" />
                      <span>{structureItem.label}</span>
                    </div>
                  );
                }
              }
              // Check if it's a content block
              if (activeId.startsWith('block-')) {
                const block = blockDefinitionMap[activeId];
                if (block) {
                  const Icon = block.icon;
                  return (
                    <div
                      className={clsx('flex items-center gap-4', {
                        'p-3 rounded-xl border border-dashed border-slate-900/10 bg-white text-slate-900 text-sm font-medium leading-5':
                          !daisyui,
                      })}
                      style={{
                        pointerEvents: 'none',
                        cursor: 'grabbing',
                      }}
                    >
                      <Icon size={18} weight="duotone" />
                      <span>{block.label}</span>
                    </div>
                  );
                }
              }
              // Fallback for other drag types
              return (
                <div
                  className={clsx('px-3 py-1.5 rounded-md text-sm shadow-lg', {
                    'bg-slate-800 text-white': !daisyui,
                    'bg-base-200 text-base-content': daisyui,
                  })}
                  style={{ pointerEvents: 'none' }}
                >
                  Dragging...
                </div>
              );
            })()
          : null}
      </DragOverlay>
    </DndContext>
  );
}
