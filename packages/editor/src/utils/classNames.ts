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
  Padding,
} from '@react-email-dnd/shared';
import { resolvePaddingClasses } from './padding';

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
  padding,
}: {
  existingClassName?: string;
  backgroundClassName?: string;
  colorClassName?: string;
  padding?: Padding;
}): string | undefined {
  const tokens = new Set<string>();
  addTokens(tokens, existingClassName);
  addTokens(tokens, backgroundClassName);
  addTokens(tokens, colorClassName);
  const paddingClasses = resolvePaddingClasses(padding);
  paddingClasses.forEach((paddingClass) => addTokens(tokens, paddingClass));

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
    padding?: Padding;
  };

  const combined = computeCombinedClassName({
    existingClassName: props.className,
    backgroundClassName: props.backgroundClassName,
    colorClassName: props.colorClassName,
    padding: props.padding,
  });

  return {
    ...block,
    props: {
      ...props,
      className: combined,
    },
  };
}

function mergeColumnClassName(column: CanvasColumn): CanvasColumn {
  const padding = column.padding;
  const combined = computeCombinedClassName({
    existingClassName: column.className,
    backgroundClassName: column.backgroundClassName,
    padding,
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
    padding: row.padding,
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
    padding: section.padding,
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
