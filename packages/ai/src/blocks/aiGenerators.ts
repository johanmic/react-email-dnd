/**
 * Block generator helpers to create editor blocks from AI outputs.
 * Ensures compatibility with shared schema and renderer types.
 */

import {
  type TextBlock,
  type HeadingBlock,
  type ButtonBlock,
  type ImageBlock,
  type DividerBlock,
  type CustomBlock,
  type CanvasColumn,
  type CanvasRow,
  type CanvasSection,
  type CanvasDocument,
  type TextBlockProps,
  type HeadingBlockProps,
  type ButtonBlockProps,
  type ImageBlockProps,
  type DividerBlockProps,
  type CustomBlockProps,
  type DocumentMeta,
  type CanvasContentBlock,
  textBlockSchema,
  headingBlockSchema,
  buttonBlockSchema,
  imageBlockSchema,
  dividerBlockSchema,
  customBlockSchema,
  canvasColumnSchema,
  canvasRowSchema,
  canvasSectionSchema,
  canvasDocumentSchema,
} from '@react-email-dnd/shared';

/**
 * Generate a unique ID for blocks
 */
export function generateBlockId(prefix: string = 'block'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Options for block generation
 */
export interface BlockGeneratorOptions {
  /** Optional custom ID. If not provided, a unique ID will be generated. */
  id?: string;
  /** Whether the block should be locked from editing */
  locked?: boolean;
  /** Whether the block should be hidden */
  hidden?: boolean;
  /** Whether to validate the generated block against the schema */
  validate?: boolean;
}

/**
 * Generate a text block from AI output
 */
export function generateTextBlock(
  props: TextBlockProps,
  options: BlockGeneratorOptions = {}
): TextBlock {
  const block: TextBlock = {
    id: options.id || generateBlockId('text'),
    type: 'text',
    props,
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return textBlockSchema.parse(block);
  }

  return block;
}

/**
 * Generate a heading block from AI output
 */
export function generateHeadingBlock(
  props: HeadingBlockProps,
  options: BlockGeneratorOptions = {}
): HeadingBlock {
  const block: HeadingBlock = {
    id: options.id || generateBlockId('heading'),
    type: 'heading',
    props,
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return headingBlockSchema.parse(block);
  }

  return block;
}

/**
 * Generate a button block from AI output
 */
export function generateButtonBlock(
  props: ButtonBlockProps,
  options: BlockGeneratorOptions = {}
): ButtonBlock {
  const block: ButtonBlock = {
    id: options.id || generateBlockId('button'),
    type: 'button',
    props,
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return buttonBlockSchema.parse(block);
  }

  return block;
}

/**
 * Generate an image block from AI output
 */
export function generateImageBlock(
  props: ImageBlockProps,
  options: BlockGeneratorOptions = {}
): ImageBlock {
  const block: ImageBlock = {
    id: options.id || generateBlockId('image'),
    type: 'image',
    props,
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return imageBlockSchema.parse(block);
  }

  return block;
}

/**
 * Generate a divider block from AI output
 */
export function generateDividerBlock(
  props: DividerBlockProps = {},
  options: BlockGeneratorOptions = {}
): DividerBlock {
  const block: DividerBlock = {
    id: options.id || generateBlockId('divider'),
    type: 'divider',
    props,
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return dividerBlockSchema.parse(block);
  }

  return block;
}

/**
 * Generate a custom block from AI output
 */
export function generateCustomBlock(
  props: CustomBlockProps,
  options: BlockGeneratorOptions = {}
): CustomBlock {
  const block: CustomBlock = {
    id: options.id || generateBlockId('custom'),
    type: 'custom',
    props,
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return customBlockSchema.parse(block);
  }

  return block;
}

/**
 * Options for structural block generation
 */
export interface StructuralBlockOptions extends BlockGeneratorOptions {
  /** Background color (hex or color name) */
  backgroundColor?: string;
  /** Background className for Tailwind/CSS */
  backgroundClassName?: string;
  /** Padding configuration */
  padding?: string | number | Record<string, string | number>;
  /** Margin configuration */
  margin?: string | number | Record<string, string | number>;
  /** Alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Additional CSS className */
  className?: string;
}

/**
 * Generate a column block from AI output
 */
export function generateColumnBlock(
  blocks: CanvasContentBlock[],
  options: StructuralBlockOptions & { width?: number } = {}
): CanvasColumn {
  const column: CanvasColumn = {
    id: options.id || generateBlockId('column'),
    type: 'column',
    blocks,
    ...(options.width !== undefined && { width: options.width }),
    ...(options.backgroundColor !== undefined && {
      backgroundColor: options.backgroundColor,
    }),
    ...(options.backgroundClassName !== undefined && {
      backgroundClassName: options.backgroundClassName,
    }),
    ...(options.padding !== undefined && { padding: options.padding }),
    ...(options.margin !== undefined && { margin: options.margin }),
    ...(options.align !== undefined && { align: options.align }),
    ...(options.className !== undefined && { className: options.className }),
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return canvasColumnSchema.parse(column);
  }

  return column;
}

/**
 * Generate a row block from AI output
 */
export function generateRowBlock(
  columns: CanvasColumn[],
  options: StructuralBlockOptions & { gutter?: number } = {}
): CanvasRow {
  const row: CanvasRow = {
    id: options.id || generateBlockId('row'),
    type: 'row',
    columns,
    ...(options.gutter !== undefined && { gutter: options.gutter }),
    ...(options.backgroundColor !== undefined && {
      backgroundColor: options.backgroundColor,
    }),
    ...(options.backgroundClassName !== undefined && {
      backgroundClassName: options.backgroundClassName,
    }),
    ...(options.padding !== undefined && { padding: options.padding }),
    ...(options.margin !== undefined && { margin: options.margin }),
    ...(options.align !== undefined && { align: options.align }),
    ...(options.className !== undefined && { className: options.className }),
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return canvasRowSchema.parse(row);
  }

  return row;
}

/**
 * Generate a section block from AI output
 */
export function generateSectionBlock(
  rows: CanvasRow[],
  options: StructuralBlockOptions = {}
): CanvasSection {
  const section: CanvasSection = {
    id: options.id || generateBlockId('section'),
    type: 'section',
    rows,
    ...(options.backgroundColor !== undefined && {
      backgroundColor: options.backgroundColor,
    }),
    ...(options.backgroundClassName !== undefined && {
      backgroundClassName: options.backgroundClassName,
    }),
    ...(options.padding !== undefined && { padding: options.padding }),
    ...(options.margin !== undefined && { margin: options.margin }),
    ...(options.align !== undefined && { align: options.align }),
    ...(options.className !== undefined && { className: options.className }),
    ...(options.locked !== undefined && { locked: options.locked }),
    ...(options.hidden !== undefined && { hidden: options.hidden }),
  };

  if (options.validate !== false) {
    return canvasSectionSchema.parse(section);
  }

  return section;
}

/**
 * Options for document generation
 */
export interface DocumentGeneratorOptions {
  /** Document version (defaults to 1) */
  version?: number;
  /** Document metadata */
  meta?: DocumentMeta;
  /** Template variables */
  variables?: Record<string, unknown>;
  /** Theme configuration */
  theme?: {
    fonts?: Array<{
      id: string;
      fontFamily: string;
      fallbackFontFamily?: string;
      webFont?: {
        url: string;
        format:
          | 'woff'
          | 'woff2'
          | 'truetype'
          | 'opentype'
          | 'embedded-opentype'
          | 'svg';
      };
      fontWeight?: number;
      fontStyle?: 'normal' | 'italic' | 'oblique';
    }>;
  };
  /** Whether to validate the generated document */
  validate?: boolean;
}

/**
 * Generate a complete canvas document from AI output
 */
export function generateDocument(
  sections: CanvasSection[],
  options: DocumentGeneratorOptions = {}
): CanvasDocument {
  const document: CanvasDocument = {
    version: options.version ?? 1,
    meta: options.meta ?? {
      title: 'Untitled Document',
      description: '',
      tags: [],
    },
    ...(options.variables !== undefined && { variables: options.variables }),
    ...(options.theme !== undefined && { theme: options.theme }),
    sections,
  };

  if (options.validate !== false) {
    return canvasDocumentSchema.parse(document);
  }

  return document;
}

/**
 * Utility to create a simple single-column layout with content blocks
 */
export function generateSimpleLayout(
  blocks: CanvasContentBlock[],
  options: DocumentGeneratorOptions & StructuralBlockOptions = {}
): CanvasDocument {
  const column = generateColumnBlock(blocks, {
    validate: options.validate,
    ...options,
  });

  const row = generateRowBlock([column], {
    validate: options.validate,
    ...options,
  });

  const section = generateSectionBlock([row], {
    validate: options.validate,
    ...options,
  });

  return generateDocument([section], options);
}

/**
 * Utility to create a multi-column layout
 */
export function generateMultiColumnLayout(
  columnBlocks: CanvasContentBlock[][],
  options: DocumentGeneratorOptions & StructuralBlockOptions & { gutter?: number } = {}
): CanvasDocument {
  const columns = columnBlocks.map((blocks) =>
    generateColumnBlock(blocks, {
      validate: options.validate,
      ...options,
    })
  );

  const row = generateRowBlock(columns, {
    validate: options.validate,
    gutter: options.gutter,
    ...options,
  });

  const section = generateSectionBlock([row], {
    validate: options.validate,
    ...options,
  });

  return generateDocument([section], options);
}
