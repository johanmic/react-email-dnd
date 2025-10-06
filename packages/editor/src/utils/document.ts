import type {
  CanvasColumn,
  CanvasDocument,
  CanvasRow,
  CanvasSection,
  CanvasContentBlock,
} from '@react-email-dnd/shared';

const DEFAULT_TITLE = 'Untitled email';

function generateId(prefix: string): string {
  const globalCrypto =
    typeof globalThis !== 'undefined'
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;

  const randomSuffix =
    globalCrypto && typeof globalCrypto.randomUUID === 'function'
      ? globalCrypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${randomSuffix}`;
}

export function createEmptyDocument(title: string = DEFAULT_TITLE): CanvasDocument {
  return {
    version: 1,
    meta: { title },
    variables: {},
    sections: [],
  };
}

export function createEmptySection(): CanvasSection {
  return {
    id: generateId('section'),
    type: 'section',
    rows: [],
  };
}

export function cloneCanvasDocument(document: CanvasDocument): CanvasDocument {
  return JSON.parse(JSON.stringify(document)) as CanvasDocument;
}

export function documentsAreEqual(a: CanvasDocument, b: CanvasDocument): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function createEmptyRow(columnCount: number = 1) {
  return {
    id: generateId('row'),
    type: 'row' as const,
    gutter: 16,
    columns: Array.from({ length: columnCount }, () => createEmptyColumn()),
  };
}

export function createEmptyColumn() {
  return {
    id: generateId('column'),
    type: 'column' as const,
    blocks: [] as CanvasContentBlock[],
  };
}

export function createContentBlock(blockType: string, defaults: Record<string, unknown>) {
  return {
    id: generateId(blockType),
    type: blockType,
    props: { ...defaults },
  };
}

export function findBlockById(
  document: CanvasDocument,
  blockId: string,
): CanvasContentBlock | null {
  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if (block.id === blockId) {
            return block;
          }
        }
      }
    }
  }
  return null;
}

export function updateBlockProps(
  document: CanvasDocument,
  blockId: string,
  updatedProps: Record<string, unknown>,
): CanvasDocument {
  const newDocument = cloneCanvasDocument(document);

  for (const section of newDocument.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        const blockIndex = column.blocks.findIndex((b) => b.id === blockId);
        if (blockIndex !== -1) {
          const block = column.blocks[blockIndex];
          block.props = { ...block.props, ...updatedProps };
          return newDocument;
        }
      }
    }
  }

  return newDocument;
}

export function updateSectionProps(
  document: CanvasDocument,
  sectionId: string,
  updatedProps: Partial<
    Pick<CanvasSection, 'backgroundColor' | 'padding' | 'className' | 'locked'>
  >,
): CanvasDocument {
  const next = cloneCanvasDocument(document);
  next.sections = next.sections.map((section) =>
    section.id === sectionId ? { ...section, ...updatedProps } : section,
  );
  return next;
}

export function updateRowProps(
  document: CanvasDocument,
  rowId: string,
  updatedProps: Partial<
    Pick<CanvasRow, 'backgroundColor' | 'padding' | 'className' | 'gutter' | 'locked'>
  >,
): CanvasDocument {
  const next = cloneCanvasDocument(document);
  next.sections = next.sections.map((section) => ({
    ...section,
    rows: section.rows.map((row) => (row.id === rowId ? { ...row, ...updatedProps } : row)),
  }));
  return next;
}

export function updateColumnProps(
  document: CanvasDocument,
  columnId: string,
  updatedProps: Partial<
    Pick<CanvasColumn, 'backgroundColor' | 'padding' | 'className' | 'width' | 'locked'>
  >,
): CanvasDocument {
  const next = cloneCanvasDocument(document);
  next.sections = next.sections.map((section) => ({
    ...section,
    rows: section.rows.map((row) => ({
      ...row,
      columns: row.columns.map((column) =>
        column.id === columnId ? { ...column, ...updatedProps } : column,
      ),
    })),
  }));
  return next;
}
