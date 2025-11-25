import type {
  ButtonBlockProps,
  CanvasColumn,
  CanvasContentBlock,
  CanvasDocument,
  CanvasRow,
  CanvasSection,
  DividerBlockProps,
  HeadingBlockProps,
  ImageBlockProps,
  TextBlockProps,
} from '@react-email-dnd/shared';

type BlockPropsWithClassName =
  | ButtonBlockProps
  | TextBlockProps
  | HeadingBlockProps
  | ImageBlockProps
  | DividerBlockProps;

function addTokens(target: Set<string>, value?: string) {
  if (!value) {
    return;
  }
  value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => target.add(token));
}

function computeCombinedClassName({
  existingClassName,
  backgroundClassName,
  colorClassName,
}: {
  existingClassName?: string;
  backgroundClassName?: string;
  colorClassName?: string;
}): string | undefined {
  const tokens = new Set<string>();
  addTokens(tokens, existingClassName);
  addTokens(tokens, backgroundClassName);
  addTokens(tokens, colorClassName);

  const sanitized = Array.from(tokens).filter((token) => !token.includes(':'));

  if (sanitized.length === 0) {
    return undefined;
  }

  return sanitized.join(' ');
}

function mergeBlockClassName(block: CanvasContentBlock): CanvasContentBlock {
  if (!['button', 'text', 'heading', 'image', 'divider'].includes(block.type)) {
    return block;
  }

  const props = block.props as BlockPropsWithClassName & {
    backgroundClassName?: string;
    colorClassName?: string;
  };

  const combined = computeCombinedClassName({
    existingClassName: props.className,
    backgroundClassName: props.backgroundClassName,
    colorClassName: props.colorClassName,
  });

  return {
    ...block,
    props: {
      ...props,
      className: combined,
    },
  } as CanvasContentBlock;
}

function mergeColumnClassName(column: CanvasColumn): CanvasColumn {
  const combined = computeCombinedClassName({
    existingClassName: column.className,
    backgroundClassName: column.backgroundClassName,
  });

  return {
    ...column,
    className: combined,
    blocks: column.blocks.map(mergeBlockClassName),
  };
}

function mergeRowClassName(row: CanvasRow): CanvasRow {
  const combined = computeCombinedClassName({
    existingClassName: row.className,
    backgroundClassName: row.backgroundClassName,
  });

  return {
    ...row,
    className: combined,
    columns: row.columns.map((column) => mergeColumnClassName(column)),
  };
}

function mergeSectionClassName(section: CanvasSection): CanvasSection {
  const combined = computeCombinedClassName({
    existingClassName: section.className,
    backgroundClassName: section.backgroundClassName,
  });

  return {
    ...section,
    className: combined,
    rows: section.rows.map((row) => mergeRowClassName(row)),
  };
}

export function withCombinedClassNames(document: CanvasDocument): CanvasDocument {
  const cloned = JSON.parse(JSON.stringify(document)) as CanvasDocument;
  cloned.sections = cloned.sections.map((section) => mergeSectionClassName(section));
  return cloned;
}
