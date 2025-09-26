import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Main,
  Sidebar,
  Header,
  useCanvasStore,
  buttonDefinition,
  dividerDefinition,
  headingDefinition,
  imageDefinition,
  textDefinition,
  type CanvasContentBlock,
  type CanvasSection,
  type CanvasRow,
  type CanvasColumn,
} from 'react-email-dnd';
import 'react-email-dnd/styles.css';

type BlockDropId =
  | 'block-heading'
  | 'block-text'
  | 'block-divider'
  | 'block-image'
  | 'block-button';
type StructureDropId =
  | 'structure-section'
  | 'structure-row'
  | 'structure-columns-1'
  | 'structure-columns-2'
  | 'structure-columns-3';

type SidebarDropId = BlockDropId | StructureDropId;

type BlockSidebarDefinition =
  | typeof textDefinition
  | typeof headingDefinition
  | typeof dividerDefinition
  | typeof imageDefinition
  | typeof buttonDefinition;

const BLOCK_DEFINITIONS: Record<BlockDropId, BlockSidebarDefinition> = {
  'block-heading': headingDefinition,
  'block-text': textDefinition,
  'block-divider': dividerDefinition,
  'block-image': imageDefinition,
  'block-button': buttonDefinition,
};

interface CanvasBlockDragData {
  type: 'canvas-block';
  blockId: string;
  columnId: string;
}

interface CanvasBlockContainerData {
  type: 'canvas-column';
  columnId: string;
  rowId: string;
  sectionId: string;
  blockCount: number;
}

interface CanvasColumnDragData {
  type: 'canvas-column-item';
  columnId: string;
  rowId: string;
  sectionId: string;
}

interface CanvasRowDragData {
  type: 'canvas-row-item';
  rowId: string;
  sectionId: string;
}

interface CanvasSectionDragData {
  type: 'canvas-section-item';
  sectionId: string;
}

interface CanvasRowContainerDropData {
  type: 'canvas-row-container';
  rowId: string;
  sectionId: string;
  columnCount: number;
}

interface CanvasSectionDropData {
  type: 'canvas-section';
  sectionId: string;
  rowCount: number;
}

interface BlockPosition {
  sectionId: string;
  rowId: string;
  columnId: string;
  blockIndex: number;
}

interface RowPosition {
  sectionId: string;
  rowIndex: number;
  row: CanvasRow;
}

interface ColumnPosition {
  sectionId: string;
  rowId: string;
  rowIndex: number;
  columnIndex: number;
  column: CanvasColumn;
}

type ActiveDragData =
  | CanvasBlockDragData
  | CanvasColumnDragData
  | CanvasRowDragData
  | CanvasSectionDragData;

type OverDragData =
  | CanvasBlockDragData
  | CanvasBlockContainerData
  | CanvasColumnDragData
  | CanvasRowContainerDropData
  | CanvasRowDragData
  | CanvasSectionDropData
  | CanvasSectionDragData;

function generateId(prefix: string) {
  const randomSuffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${randomSuffix}`;
}

function createSection(): CanvasSection {
  return {
    id: generateId('section'),
    type: 'section',
    rows: [],
  };
}

function createRow(columnCount: number): CanvasRow {
  return {
    id: generateId('row'),
    type: 'row',
    gutter: 16,
    columns: Array.from({ length: columnCount }, () => ({
      id: generateId('column'),
      type: 'column',
      blocks: [],
    })),
  };
}

function createBlockFromSidebar(id: BlockDropId): CanvasContentBlock {
  const definition = BLOCK_DEFINITIONS[id];
  if (!definition) {
    throw new Error(`Unsupported block: ${id}`);
  }
  const identifier = generateId(definition.type);

  switch (definition.type) {
    case 'heading':
    case 'text':
      return {
        id: identifier,
        type: definition.type,
        props: { ...definition.defaults },
      };
    case 'divider':
      return {
        id: identifier,
        type: definition.type,
        props: { ...definition.defaults },
      };
    case 'image':
      return {
        id: identifier,
        type: definition.type,
        props: { ...definition.defaults },
      };
    case 'button':
      return {
        id: identifier,
        type: definition.type,
        props: { ...definition.defaults },
      };
    default: {
      const unexpected: never = definition;
      throw new Error(`Unsupported block definition: ${String(unexpected)}`);
    }
  }
}

function findBlockPosition(sections: CanvasSection[], blockId: string): BlockPosition | null {
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

function findRowPosition(sections: CanvasSection[], rowId: string): RowPosition | null {
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

function findColumnPosition(sections: CanvasSection[], columnId: string): ColumnPosition | null {
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

function findSectionPosition(sections: CanvasSection[], sectionId: string): number | null {
  const sectionIndex = sections.findIndex((section) => section.id === sectionId);
  return sectionIndex !== -1 ? sectionIndex : null;
}

function addRowToSection(
  sections: CanvasSection[],
  sectionId: string,
  columnCount: number,
): CanvasSection[] {
  let updated = false;

  const nextSections = sections.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    updated = true;
    return {
      ...section,
      rows: [...section.rows, createRow(columnCount)],
    };
  });

  return updated ? nextSections : sections;
}

function addRowToNewSection(sections: CanvasSection[], columnCount: number): CanvasSection[] {
  const section = createSection();

  return [
    ...sections,
    {
      ...section,
      rows: [createRow(columnCount)],
    },
  ];
}

function addBlockToColumn(
  sections: CanvasSection[],
  columnId: string,
  block: CanvasContentBlock,
): CanvasSection[] {
  let updated = false;

  const nextSections = sections.map((section) => {
    let sectionUpdated = false;

    const nextRows = section.rows.map((row) => {
      let rowUpdated = false;

      const nextColumns = row.columns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }

        rowUpdated = true;
        sectionUpdated = true;
        updated = true;

        return {
          ...column,
          blocks: [...column.blocks, block],
        };
      });

      return rowUpdated ? { ...row, columns: nextColumns } : row;
    });

    return sectionUpdated ? { ...section, rows: nextRows } : section;
  });

  return updated ? nextSections : sections;
}

function moveBlockToColumn(
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

  const normalizedTargetIndex = Number.isFinite(targetIndex) ? Math.max(0, targetIndex) : Infinity;

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
          normalizedTargetIndex === Infinity
            ? nextBlocks.length
            : Math.min(normalizedTargetIndex, nextBlocks.length);
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

function moveRowToSection(
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

function moveColumnToRow(
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

function moveSectionToPosition(
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
  result.splice(toIndex, 0, movedSection);

  return result;
}

function App() {
  const { document, setDocument } = useCanvasStore();
  const sections = document.sections;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const commitSections = (updater: (sections: CanvasSection[]) => CanvasSection[]) => {
    const nextSections = updater(sections);

    if (nextSections === sections) {
      return;
    }

    setDocument({
      ...document,
      sections: nextSections,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log('🟢 DRAG START:', {
      activeId: String(event.active.id),
      activeData: event.active.data.current,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

    if (activeId === 'structure-section') {
      if (overId === 'canvas') {
        commitSections((previous) => [...previous, createSection()]);
      }

      return;
    }

    if (activeId === 'structure-row' || activeId.startsWith('structure-columns-')) {
      const columnCount =
        activeId === 'structure-row'
          ? 1
          : Number.parseInt(activeId.replace('structure-columns-', ''), 10) || 1;

      if (overId === 'canvas') {
        commitSections((previous) => addRowToNewSection(previous, columnCount));
        return;
      }

      if (overId.startsWith('section-')) {
        const sectionId = overId.replace('section-', '');
        commitSections((previous) => addRowToSection(previous, sectionId, columnCount));
        return;
      }
    }

    if (activeData?.type === 'canvas-row-item') {
      const sourcePosition = findRowPosition(sections, activeData.rowId);

      if (!sourcePosition) {
        return;
      }

      // Allow dropping rows to canvas to create new sections
      if (overId === 'canvas') {
        const newSection = createSection();
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

    if (activeId.startsWith('block-') && overId.startsWith('column-')) {
      const columnId = overId.replace('column-', '');
      const block = createBlockFromSidebar(activeId as BlockDropId);

      commitSections((previous) => addBlockToColumn(previous, columnId, block));
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <Main sections={sections} />
      </div>
    </DndContext>
  );
}

export default App;
