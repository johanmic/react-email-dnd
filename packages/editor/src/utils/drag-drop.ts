import type {
  CanvasSection,
  CanvasRow,
  CanvasColumn,
  CanvasContentBlock,
} from '@react-email-dnd/shared';
import { createEmptySection, createEmptyRow, createContentBlock } from './document';
import type { BlockDefinitionMap } from './block-library';

export type StructureDropId =
  | 'structure-section'
  | 'structure-row'
  | 'structure-columns-1'
  | 'structure-columns-2'
  | 'structure-columns-3';

export type SidebarDropId = string | StructureDropId;

export interface CanvasBlockDragData {
  type: 'canvas-block';
  blockId: string;
  columnId: string;
}

export interface CanvasBlockContainerData {
  type: 'canvas-column';
  columnId: string;
  rowId: string;
  sectionId: string;
  blockCount: number;
}

export interface CanvasBlockDropZoneData {
  type: 'canvas-block-dropzone';
  columnId: string;
  index: number;
}

export interface CanvasRowDropZoneData {
  type: 'canvas-row-dropzone';
  sectionId: string;
  index: number;
}

export interface CanvasColumnDragData {
  type: 'canvas-column-item';
  columnId: string;
  rowId: string;
  sectionId: string;
}

export interface CanvasRowDragData {
  type: 'canvas-row-item';
  rowId: string;
  sectionId: string;
}

export interface CanvasSectionDragData {
  type: 'canvas-section-item';
  sectionId: string;
}

export interface CanvasRowContainerDropData {
  type: 'canvas-row-container';
  rowId: string;
  sectionId: string;
  columnCount: number;
}

export interface CanvasSectionDropData {
  type: 'canvas-section';
  sectionId: string;
  rowCount: number;
}

export type ActiveDragData =
  | CanvasBlockDragData
  | CanvasColumnDragData
  | CanvasRowDragData
  | CanvasSectionDragData;

export type OverDragData =
  | CanvasBlockDragData
  | CanvasBlockContainerData
  | CanvasBlockDropZoneData
  | CanvasRowDropZoneData
  | CanvasColumnDragData
  | CanvasRowContainerDropData
  | CanvasRowDragData
  | CanvasSectionDropData
  | CanvasSectionDragData;

// Helper functions
export function createBlockFromSidebar(
  id: string,
  definitions: BlockDefinitionMap,
): CanvasContentBlock | null {
  const definition = definitions[id];
  if (!definition) {
    return null;
  }

  return createContentBlock(
    definition.type,
    definition.defaults as Record<string, unknown>,
  ) as CanvasContentBlock;
}

export function getColumnCountFromStructureId(id: StructureDropId): number {
  if (id === 'structure-row') return 1;
  if (id === 'structure-columns-1') return 1;
  if (id === 'structure-columns-2') return 2;
  if (id === 'structure-columns-3') return 3;
  return 1;
}

// Document manipulation functions
export function addRowToSection(
  sections: CanvasSection[],
  sectionId: string,
  columnCount: number,
): CanvasSection[] {
  return sections.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    return {
      ...section,
      rows: [...section.rows, createEmptyRow(columnCount)],
    };
  });
}

export function addRowToSectionAtIndex(
  sections: CanvasSection[],
  sectionId: string,
  columnCount: number,
  index: number,
): CanvasSection[] {
  return sections.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    const nextRows = [...section.rows];
    const insertionIndex = Math.max(0, Math.min(index, nextRows.length));
    nextRows.splice(insertionIndex, 0, createEmptyRow(columnCount));

    return {
      ...section,
      rows: nextRows,
    };
  });
}

export function addRowToNewSection(
  sections: CanvasSection[],
  columnCount: number,
): CanvasSection[] {
  const section = createEmptySection();

  return [
    ...sections,
    {
      ...section,
      rows: [createEmptyRow(columnCount)],
    },
  ];
}

export function addBlockToColumn(
  sections: CanvasSection[],
  columnId: string,
  block: CanvasContentBlock,
): CanvasSection[] {
  let updated = false;

  const nextSections = sections.map((section) => {
    const nextRows = section.rows.map((row) => {
      const nextColumns = row.columns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }

        updated = true;
        return {
          ...column,
          blocks: [...column.blocks, block],
        };
      });

      return { ...row, columns: nextColumns };
    });

    return { ...section, rows: nextRows };
  });

  return updated ? nextSections : sections;
}

export function addBlockToColumnAtIndex(
  sections: CanvasSection[],
  columnId: string,
  block: CanvasContentBlock,
  index: number,
): CanvasSection[] {
  let updated = false;

  const nextSections = sections.map((section) => {
    const nextRows = section.rows.map((row) => {
      const nextColumns = row.columns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }

        const nextBlocks = [...column.blocks];
        const insertionIndex = Math.max(0, Math.min(index, nextBlocks.length));
        nextBlocks.splice(insertionIndex, 0, block);
        updated = true;
        return { ...column, blocks: nextBlocks };
      });
      return { ...row, columns: nextColumns };
    });
    return { ...section, rows: nextRows };
  });

  return updated ? nextSections : sections;
}

export function replaceColumnStructure(
  sections: CanvasSection[],
  targetColumnId: string,
  newColumnCount: number,
): CanvasSection[] {
  let updated = false;

  const nextSections = sections.map((section) => {
    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      // Find if this row contains the target column
      const columnIndex = row.columns.findIndex((column) => column.id === targetColumnId);

      if (columnIndex === -1) {
        return row;
      }

      // Collect all blocks from all columns in this row
      const allBlocks: CanvasContentBlock[] = [];
      row.columns.forEach((column) => {
        allBlocks.push(...column.blocks);
      });

      // Create new row with requested column count
      const newRow = createEmptyRow(newColumnCount);

      // Put all blocks in the first column
      if (newRow.columns.length > 0) {
        newRow.columns[0] = {
          ...newRow.columns[0],
          blocks: allBlocks,
        };
      }

      // Keep the row ID and other properties
      newRow.id = row.id;
      if (row.gutter !== undefined) {
        newRow.gutter = row.gutter;
      }

      sectionUpdated = true;
      updated = true;

      return newRow;
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  return updated ? nextSections : sections;
}

// Replace the structure (number of columns) of a specific row.
// All existing blocks in the row are preserved and moved into the first new column.
export function replaceRowStructure(
  sections: CanvasSection[],
  targetRowId: string,
  newColumnCount: number,
): CanvasSection[] {
  let updated = false;

  const nextSections = sections.map((section) => {
    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      if (row.id !== targetRowId) {
        return row;
      }

      // Collect all blocks from all columns in this row
      const allBlocks: CanvasContentBlock[] = [];
      row.columns.forEach((column) => {
        allBlocks.push(...column.blocks);
      });

      // Create new row with requested column count
      const newRow = createEmptyRow(newColumnCount);

      // Put all blocks in the first column
      if (newRow.columns.length > 0) {
        newRow.columns[0] = {
          ...newRow.columns[0],
          blocks: allBlocks,
        };
      }

      // Keep the row ID and other properties
      newRow.id = row.id;
      if (row.gutter !== undefined) {
        newRow.gutter = row.gutter;
      }

      sectionUpdated = true;
      updated = true;

      return newRow;
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  return updated ? nextSections : sections;
}

export function insertRowToSectionAt(
  sections: CanvasSection[],
  sectionId: string,
  afterRowIndex: number,
  columnCount: number,
): CanvasSection[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;
    const nextRows = [...section.rows];
    const insertionIndex = Math.max(0, Math.min(afterRowIndex + 1, nextRows.length));
    nextRows.splice(insertionIndex, 0, createEmptyRow(columnCount));
    return { ...section, rows: nextRows };
  });
}

export function insertEmptySectionAfter(
  sections: CanvasSection[],
  afterSectionId: string,
): CanvasSection[] {
  const index = sections.findIndex((s) => s.id === afterSectionId);
  if (index === -1) {
    return [...sections, createEmptySection()];
  }
  const next = [...sections];
  next.splice(index + 1, 0, createEmptySection());
  return next;
}

export function insertEmptySectionAt(
  sections: CanvasSection[],
  targetIndex: number,
): CanvasSection[] {
  const next = [...sections];
  const insertionIndex = Math.max(0, Math.min(targetIndex, next.length));
  next.splice(insertionIndex, 0, createEmptySection());
  return next;
}

// Canvas item position finding functions
export interface BlockPosition {
  sectionId: string;
  rowId: string;
  columnId: string;
  blockIndex: number;
}

export interface RowPosition {
  sectionId: string;
  rowIndex: number;
  row: CanvasRow;
}

export interface ColumnPosition {
  sectionId: string;
  rowId: string;
  rowIndex: number;
  columnIndex: number;
  column: CanvasColumn;
}

export function findBlockPosition(
  sections: CanvasSection[],
  blockId: string,
): BlockPosition | null {
  for (const section of sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        const blockIndex = column.blocks.findIndex((block) => block.id === blockId);

        if (blockIndex !== -1) {
          return {
            sectionId: section.id,
            rowId: row.id,
            columnId: column.id,
            blockIndex,
          };
        }
      }
    }
  }

  return null;
}

export function findRowPosition(sections: CanvasSection[], rowId: string): RowPosition | null {
  for (const section of sections) {
    const rowIndex = section.rows.findIndex((candidate) => candidate.id === rowId);

    if (rowIndex !== -1) {
      return {
        sectionId: section.id,
        rowIndex,
        row: section.rows[rowIndex],
      };
    }
  }

  return null;
}

export function findColumnPosition(
  sections: CanvasSection[],
  columnId: string,
): ColumnPosition | null {
  for (const section of sections) {
    for (let rowIndex = 0; rowIndex < section.rows.length; rowIndex += 1) {
      const row = section.rows[rowIndex];
      const columnIndex = row.columns.findIndex((column) => column.id === columnId);

      if (columnIndex !== -1) {
        return {
          sectionId: section.id,
          rowId: row.id,
          rowIndex,
          columnIndex,
          column: row.columns[columnIndex],
        };
      }
    }
  }

  return null;
}

export function findSectionPosition(sections: CanvasSection[], sectionId: string): number | null {
  const sectionIndex = sections.findIndex((section) => section.id === sectionId);
  return sectionIndex !== -1 ? sectionIndex : null;
}

// Canvas item movement functions
export function moveBlockToColumn(
  sections: CanvasSection[],
  sourceColumnId: string,
  targetColumnId: string,
  fromIndex: number,
  targetIndex: number,
): CanvasSection[] {
  let blockToMove: CanvasContentBlock | null = null;
  let updated = false;
  let removed = false;

  const withoutBlock = sections.map((section) => {
    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      let rowUpdated = false;

      const nextColumns = row.columns.map((column) => {
        if (column.id !== sourceColumnId) {
          return column;
        }

        if (fromIndex < 0 || fromIndex >= column.blocks.length) {
          return column;
        }

        blockToMove = column.blocks[fromIndex];

        const nextBlocks = column.blocks.filter((_, index) => index !== fromIndex);

        rowUpdated = true;
        sectionUpdated = true;
        updated = true;
        removed = true;

        return {
          ...column,
          blocks: nextBlocks,
        };
      });

      return rowUpdated ? { ...row, columns: nextColumns } : row;
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  if (!blockToMove || !removed) {
    return sections;
  }

  const sameColumn = sourceColumnId === targetColumnId;
  const normalizedTargetIndex = Number.isFinite(targetIndex) ? Math.max(0, targetIndex) : Infinity;
  const adjustedTargetIndex =
    sameColumn && normalizedTargetIndex > fromIndex
      ? normalizedTargetIndex - 1
      : normalizedTargetIndex;

  let inserted = false;

  const nextSections = withoutBlock.map((section) => {
    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      let rowUpdated = false;

      const nextColumns = row.columns.map((column) => {
        if (column.id !== targetColumnId) {
          return column;
        }

        const nextBlocks = [...column.blocks];
        const insertionIndex =
          adjustedTargetIndex === Infinity
            ? nextBlocks.length
            : Math.min(adjustedTargetIndex, nextBlocks.length);
        nextBlocks.splice(insertionIndex, 0, blockToMove!);

        rowUpdated = true;
        sectionUpdated = true;
        updated = true;
        inserted = true;

        return {
          ...column,
          blocks: nextBlocks,
        };
      });

      return rowUpdated ? { ...row, columns: nextColumns } : row;
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  if (!inserted) {
    return sections;
  }

  return updated ? nextSections : sections;
}

export function moveRowToSection(
  sections: CanvasSection[],
  sourceSectionId: string,
  targetSectionId: string,
  fromIndex: number,
  targetIndex: number,
): CanvasSection[] {
  if (sourceSectionId === targetSectionId && fromIndex === targetIndex) {
    return sections;
  }

  let rowToMove: CanvasRow | null = null;
  let removed = false;

  const withoutRow = sections.map((section) => {
    if (section.id !== sourceSectionId) {
      return section;
    }

    if (fromIndex < 0 || fromIndex >= section.rows.length) {
      return section;
    }

    rowToMove = section.rows[fromIndex];
    removed = true;

    const nextRows = section.rows.filter((_, index) => index !== fromIndex);
    return { ...section, rows: nextRows };
  });

  if (!rowToMove || !removed) {
    return sections;
  }

  const sameSection = sourceSectionId === targetSectionId;
  const normalizedTargetIndex = Number.isFinite(targetIndex) ? Math.max(0, targetIndex) : Infinity;
  const adjustedTargetIndex =
    sameSection && normalizedTargetIndex > fromIndex
      ? normalizedTargetIndex - 1
      : normalizedTargetIndex;

  let inserted = false;

  const withRowInserted = withoutRow.map((section) => {
    if (section.id !== targetSectionId) {
      return section;
    }

    const nextRows = [...section.rows];
    const insertionIndex =
      adjustedTargetIndex === Infinity
        ? nextRows.length
        : Math.min(adjustedTargetIndex, nextRows.length);

    nextRows.splice(insertionIndex, 0, rowToMove!);
    inserted = true;

    return { ...section, rows: nextRows };
  });

  return inserted ? withRowInserted : sections;
}

export function moveColumnToRow(
  sections: CanvasSection[],
  sourceSectionId: string,
  sourceRowId: string,
  targetSectionId: string,
  targetRowId: string,
  fromIndex: number,
  targetIndex: number,
): CanvasSection[] {
  if (
    sourceSectionId === targetSectionId &&
    sourceRowId === targetRowId &&
    fromIndex === targetIndex
  ) {
    return sections;
  }

  let columnToMove: CanvasColumn | null = null;
  let removed = false;

  const withoutColumn = sections.map((section) => {
    if (section.id !== sourceSectionId) {
      return section;
    }

    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      if (row.id !== sourceRowId) {
        return row;
      }

      if (fromIndex < 0 || fromIndex >= row.columns.length) {
        return row;
      }

      columnToMove = row.columns[fromIndex];
      const nextColumns = row.columns.filter((_, index) => index !== fromIndex);

      removed = true;
      sectionUpdated = true;

      return { ...row, columns: nextColumns };
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  if (!columnToMove || !removed) {
    return sections;
  }

  const sameRow = sourceSectionId === targetSectionId && sourceRowId === targetRowId;
  const normalizedTargetIndex = Number.isFinite(targetIndex) ? Math.max(0, targetIndex) : Infinity;
  const adjustedTargetIndex =
    sameRow && normalizedTargetIndex > fromIndex
      ? normalizedTargetIndex - 1
      : normalizedTargetIndex;

  let inserted = false;

  const withColumnInserted = withoutColumn.map((section) => {
    if (section.id !== targetSectionId) {
      return section;
    }

    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      if (row.id !== targetRowId) {
        return row;
      }

      const nextColumns = [...row.columns];
      const insertionIndex =
        adjustedTargetIndex === Infinity
          ? nextColumns.length
          : Math.min(adjustedTargetIndex, nextColumns.length);

      nextColumns.splice(insertionIndex, 0, columnToMove!);
      inserted = true;
      sectionUpdated = true;

      return { ...row, columns: nextColumns };
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  return inserted ? withColumnInserted : sections;
}

export function moveSectionToPosition(
  sections: CanvasSection[],
  fromIndex: number,
  toIndex: number,
): CanvasSection[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sections.length ||
    toIndex >= sections.length
  ) {
    return sections;
  }

  const result = [...sections];
  const [movedSection] = result.splice(fromIndex, 1);

  // Adjust target index if moving upward (fromIndex > toIndex)
  // because removing the item shifts all subsequent indices down by 1
  const adjustedToIndex = fromIndex > toIndex ? toIndex : toIndex - 1;

  result.splice(adjustedToIndex, 0, movedSection);

  return result;
}

// Helper functions to check if containers are locked
function isColumnLocked(sections: CanvasSection[], columnId: string): boolean {
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
}

function isRowLocked(sections: CanvasSection[], rowId: string): boolean {
  for (const section of sections) {
    const row = section.rows.find((r) => r.id === rowId);
    if (row) {
      // Check if row OR parent section is locked
      return !!(row.locked || section.locked);
    }
  }
  return false;
}

function isSectionLocked(sections: CanvasSection[], sectionId: string): boolean {
  const section = sections.find((s) => s.id === sectionId);
  return !!section?.locked;
}

// Helper function to enforce Row -> Column -> Content structure
export function handleSidebarDrop(
  activeId: string,
  overId: string,
  sections: CanvasSection[],
  blockDefinitions: BlockDefinitionMap,
  pointerInfo?: { pointerY: number; overRect?: { top: number; height: number } | null },
): CanvasSection[] | null {
  // Prevent drops back to sidebar - these should be handled as cancellations
  if (overId.startsWith('sidebar-drop-')) {
    return null;
  }

  // Handle structure drops
  if (activeId === 'structure-section') {
    if (overId === 'canvas') {
      return [...sections, createEmptySection()];
    }
    if (overId.startsWith('section-')) {
      const sectionId = overId.replace('section-', '');
      const targetSectionIndex = findSectionPosition(sections, sectionId);
      if (targetSectionIndex !== null && pointerInfo?.overRect) {
        const insertAfter =
          pointerInfo.pointerY > pointerInfo.overRect.top + pointerInfo.overRect.height / 2;
        const finalTargetIndex = targetSectionIndex + (insertAfter ? 1 : 0);
        return insertEmptySectionAt(sections, finalTargetIndex);
      }
      return insertEmptySectionAfter(sections, sectionId);
    }
    if (overId.startsWith('row-')) {
      const rowId = overId.replace('row-', '');
      const pos = findRowPosition(sections as unknown as CanvasSection[], rowId);
      if (pos) {
        const targetSectionIndex = findSectionPosition(sections, pos.sectionId);
        if (targetSectionIndex !== null && pointerInfo?.overRect) {
          const insertAfter =
            pointerInfo.pointerY > pointerInfo.overRect.top + pointerInfo.overRect.height / 2;
          const finalTargetIndex = targetSectionIndex + (insertAfter ? 1 : 0);
          return insertEmptySectionAt(sections, finalTargetIndex);
        }
        return insertEmptySectionAfter(sections, pos.sectionId);
      }
    }
    if (overId.startsWith('column-')) {
      const columnId = overId.replace('column-', '');
      const pos = findColumnPosition(sections, columnId);
      if (pos) {
        const targetSectionIndex = findSectionPosition(sections, pos.sectionId);
        if (targetSectionIndex !== null && pointerInfo?.overRect) {
          const insertAfter =
            pointerInfo.pointerY > pointerInfo.overRect.top + pointerInfo.overRect.height / 2;
          const finalTargetIndex = targetSectionIndex + (insertAfter ? 1 : 0);
          return insertEmptySectionAt(sections, finalTargetIndex);
        }
        return insertEmptySectionAfter(sections, pos.sectionId);
      }
    }
    if (overId.startsWith('canvas-block-')) {
      const blockId = overId.replace('canvas-block-', '');
      const pos = findBlockPosition(sections, blockId);
      if (pos) {
        const targetSectionIndex = findSectionPosition(sections, pos.sectionId);
        if (targetSectionIndex !== null && pointerInfo?.overRect) {
          const insertAfter =
            pointerInfo.pointerY > pointerInfo.overRect.top + pointerInfo.overRect.height / 2;
          const finalTargetIndex = targetSectionIndex + (insertAfter ? 1 : 0);
          return insertEmptySectionAt(sections, finalTargetIndex);
        }
        return insertEmptySectionAfter(sections, pos.sectionId);
      }
    }
    // No valid drop target found - return null to prevent adding items
    return null;
  }

  if (activeId === 'structure-row' || activeId.startsWith('structure-columns-')) {
    const columnCount = getColumnCountFromStructureId(activeId as StructureDropId);

    if (overId === 'canvas') {
      return addRowToNewSection(sections, columnCount);
    }

    if (overId.startsWith('section-')) {
      const sectionId = overId.replace('section-', '');
      // Check if section is locked
      if (isSectionLocked(sections, sectionId)) {
        return null;
      }
      return addRowToSection(sections, sectionId, columnCount);
    }

    // For a plain 'row' structure, inserting under the target row is preferred
    if (activeId === 'structure-row' && overId.startsWith('row-')) {
      const rowId = overId.replace('row-', '');
      const pos = findRowPosition(sections, rowId);
      if (pos) {
        if (pointerInfo?.overRect) {
          const insertAfter =
            pointerInfo.pointerY > pointerInfo.overRect.top + pointerInfo.overRect.height / 2;
          const targetRowIndex = pos.rowIndex + (insertAfter ? 1 : 0);
          return insertRowToSectionAt(sections, pos.sectionId, targetRowIndex, columnCount);
        }
        return insertRowToSectionAt(sections, pos.sectionId, pos.rowIndex, columnCount);
      }
    }

    if (activeId === 'structure-row' && overId.startsWith('column-')) {
      const columnId = overId.replace('column-', '');
      const pos = findColumnPosition(sections, columnId);
      if (pos) {
        return insertRowToSectionAt(sections, pos.sectionId, pos.rowIndex, columnCount);
      }
    }

    if (activeId === 'structure-row' && overId.startsWith('canvas-block-')) {
      const blockId = overId.replace('canvas-block-', '');
      const pos = findBlockPosition(sections, blockId);
      if (pos) {
        const rowPos = findRowPosition(sections, pos.rowId);
        if (rowPos) {
          return insertRowToSectionAt(sections, rowPos.sectionId, rowPos.rowIndex, columnCount);
        }
      }
    }

    // Column layout changes (columns-*) keep existing replacement behavior
    if (activeId.startsWith('structure-columns-')) {
      if (overId.startsWith('row-')) {
        const rowId = overId.replace('row-', '');
        // Check if row is locked
        if (isRowLocked(sections, rowId)) {
          return null;
        }
        return replaceRowStructure(sections, rowId, columnCount);
      }
      if (overId.startsWith('column-')) {
        const columnId = overId.replace('column-', '');
        // Check if column is locked
        if (isColumnLocked(sections, columnId)) {
          return null;
        }
        return replaceColumnStructure(sections, columnId, columnCount);
      }
      if (overId.startsWith('canvas-block-')) {
        const blockId = overId.replace('canvas-block-', '');
        const pos = findBlockPosition(sections, blockId);
        if (pos) {
          // Check if row is locked
          if (isRowLocked(sections, pos.rowId)) {
            return null;
          }
          return replaceRowStructure(sections, pos.rowId, columnCount);
        }
      }
    }

    return null;
  }

  // Handle content block drops - enforce they can only go in columns
  if (activeId.startsWith('block-') && overId.startsWith('column-')) {
    const columnId = overId.replace('column-', '');
    // Check if column is locked
    if (isColumnLocked(sections, columnId)) {
      return null;
    }
    const block = createBlockFromSidebar(activeId, blockDefinitions);
    if (!block) {
      return null;
    }
    return addBlockToColumn(sections, columnId, block);
  }

  // Prevent content blocks from being dropped outside of columns
  if (activeId.startsWith('block-') && !overId.startsWith('column-')) {
    // Don't allow content blocks to be dropped on sections, rows, or canvas
    return null;
  }

  return null;
}

// Deletion helpers
export function removeSection(sections: CanvasSection[], sectionId: string): CanvasSection[] {
  return sections.filter((section) => section.id !== sectionId);
}

export function removeRow(sections: CanvasSection[], rowId: string): CanvasSection[] {
  let updated = false;

  const next = sections.map((section) => {
    const before = section.rows.length;
    const rows = section.rows.filter((row) => row.id !== rowId);
    if (rows.length !== before) updated = true;
    return { ...section, rows };
  });

  return updated ? next : sections;
}

export function removeColumn(sections: CanvasSection[], columnId: string): CanvasSection[] {
  let updated = false;

  const next = sections.map((section) => {
    const rows = section.rows.map((row) => {
      const before = row.columns.length;
      const columns = row.columns.filter((col) => col.id !== columnId);
      if (columns.length !== before) updated = true;
      return { ...row, columns };
    });
    return { ...section, rows };
  });

  return updated ? next : sections;
}

export function removeBlock(sections: CanvasSection[], blockId: string): CanvasSection[] {
  let updated = false;

  const next = sections.map((section) => {
    const rows = section.rows.map((row) => {
      const columns = row.columns.map((column) => {
        const before = column.blocks.length;
        const blocks = column.blocks.filter((block) => block.id !== blockId);
        if (blocks.length !== before) updated = true;
        return { ...column, blocks };
      });
      return { ...row, columns };
    });
    return { ...section, rows };
  });

  return updated ? next : sections;
}
