import type {
  CanvasColumn,
  CanvasDocument,
  CanvasRow,
  CanvasSection,
  CanvasContentBlock,
} from '@react-email-dnd/shared';

const DEFAULT_TITLE = 'Untitled email';
const DEFAULT_SECTION_PADDING: CanvasSection['padding'] = '6';
const DEFAULT_SECTION_MARGIN: CanvasSection['margin'] = '0';
const DEFAULT_SECTION_ALIGN: CanvasSection['align'] = 'left';
const DEFAULT_ROW_PADDING: CanvasRow['padding'] = '2';
const DEFAULT_ROW_MARGIN: CanvasRow['margin'] = '0';
const DEFAULT_ROW_ALIGN: CanvasRow['align'] = 'left';
const DEFAULT_COLUMN_PADDING: CanvasColumn['padding'] = '4';
const DEFAULT_COLUMN_MARGIN: CanvasColumn['margin'] = '0';
const DEFAULT_COLUMN_ALIGN: CanvasColumn['align'] = 'left';

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
    padding: DEFAULT_SECTION_PADDING,
    margin: DEFAULT_SECTION_MARGIN,
    align: DEFAULT_SECTION_ALIGN,
  };
}

export function cloneCanvasDocument(document: CanvasDocument): CanvasDocument {
  return JSON.parse(JSON.stringify(document)) as CanvasDocument;
}

export function documentsAreEqual(a: CanvasDocument, b: CanvasDocument): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function withColumnDefaults(column: CanvasColumn): CanvasColumn {
  return {
    ...column,
    padding: column.padding ?? DEFAULT_COLUMN_PADDING,
    margin: column.margin ?? DEFAULT_COLUMN_MARGIN,
    align: column.align ?? DEFAULT_COLUMN_ALIGN,
  };
}

function withRowDefaults(row: CanvasRow): CanvasRow {
  return {
    ...row,
    padding: row.padding ?? DEFAULT_ROW_PADDING,
    margin: row.margin ?? DEFAULT_ROW_MARGIN,
    align: row.align ?? DEFAULT_ROW_ALIGN,
    columns: row.columns.map(withColumnDefaults),
  };
}

function withSectionDefaults(section: CanvasSection): CanvasSection {
  return {
    ...section,
    padding: section.padding ?? DEFAULT_SECTION_PADDING,
    margin: section.margin ?? DEFAULT_SECTION_MARGIN,
    align: section.align ?? DEFAULT_SECTION_ALIGN,
    rows: section.rows.map(withRowDefaults),
  };
}

export function applyLayoutDefaults(document: CanvasDocument): CanvasDocument {
  const normalized = cloneCanvasDocument(document);
  normalized.sections = normalized.sections.map(withSectionDefaults);
  return normalized;
}

export function createEmptyRow(columnCount: number = 1) {
  return {
    id: generateId('row'),
    type: 'row' as const,
    gutter: 8,
    padding: DEFAULT_ROW_PADDING,
    margin: DEFAULT_ROW_MARGIN,
    align: DEFAULT_ROW_ALIGN,
    columns: Array.from({ length: columnCount }, () => createEmptyColumn()),
  };
}

export function createEmptyColumn() {
  return {
    id: generateId('column'),
    type: 'column' as const,
    padding: DEFAULT_COLUMN_PADDING,
    margin: DEFAULT_COLUMN_MARGIN,
    align: DEFAULT_COLUMN_ALIGN,
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
    Pick<
      CanvasSection,
      | 'backgroundColor'
      | 'backgroundClassName'
      | 'padding'
      | 'margin'
      | 'className'
      | 'align'
      | 'locked'
    >
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
    Pick<
      CanvasRow,
      | 'backgroundColor'
      | 'backgroundClassName'
      | 'padding'
      | 'margin'
      | 'className'
      | 'gutter'
      | 'align'
      | 'locked'
    >
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
    Pick<
      CanvasColumn,
      | 'backgroundColor'
      | 'backgroundClassName'
      | 'padding'
      | 'margin'
      | 'className'
      | 'width'
      | 'align'
      | 'locked'
    >
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
