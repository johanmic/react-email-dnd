import * as ReactEmailComponents from '@react-email/components';
import type { RowProps, ColumnProps, SectionProps } from '@react-email/components';
import { resolvePaddingClasses, resolvePaddingStyle } from './padding';
import type {
  CanvasDocument,
  CanvasSection,
  CanvasRow,
  CanvasColumn,
  CanvasContentBlock,
  ButtonBlockProps,
  TextBlockProps,
  HeadingBlockProps,
  ImageBlockProps,
  CustomBlockDefinition,
  CustomBlockProps,
} from '@react-email-dnd/shared';
import { Button } from '../components/button';
import { Divider } from '../components/divider';
import { Heading } from '../components/heading';
import { Image } from '../components/image';
import { Text } from '../components/text';

const ReactEmailModule = ReactEmailComponents as {
  Row: React.ComponentType<RowProps>;
  Column: React.ComponentType<ColumnProps>;
  Section: React.ComponentType<SectionProps>;
};

const { Row, Column, Section } = ReactEmailModule;

function combineClasses(...values: Array<string | null | undefined>): string | undefined {
  const merged = values.filter((value) => Boolean(value && value.trim())).join(' ');
  return merged.length > 0 ? merged : undefined;
}

function extractStringVariables(
  values?: Record<string, unknown>,
): Record<string, string> | undefined {
  if (!values) return undefined;
  const entries = Object.entries(values).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value;
    }
    return acc;
  }, {});
  return Object.keys(entries).length > 0 ? entries : undefined;
}

/**
 * Renders a content block using the appropriate component
 */
function substitute(
  str: string | undefined,
  variables: Record<string, string> | undefined,
): string | undefined {
  if (!str) return str;
  if (!variables) return str;
  return str.replace(/\{\{\s*([a-zA-Z0-9_\.\-]+)\s*\}\}/g, (_, key: string) => {
    return Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : `{{${key}}}`;
  });
}

function withSubstitutions(
  block: CanvasContentBlock,
  variables: Record<string, string> | undefined,
): CanvasContentBlock {
  // Only substitute known string props
  const next = JSON.parse(JSON.stringify(block)) as CanvasContentBlock;
  switch (next.type) {
    case 'button': {
      const p = next.props as ButtonBlockProps;
      p.label = substitute(p.label, variables) ?? p.label;
      p.href = substitute(p.href, variables);
      return next;
    }
    case 'text': {
      const p = next.props as TextBlockProps;
      p.content = substitute(p.content, variables) ?? p.content;
      return next;
    }
    case 'heading': {
      const p = next.props as HeadingBlockProps;
      p.content = substitute(p.content, variables) ?? p.content;
      return next;
    }
    case 'image': {
      const p = next.props as ImageBlockProps;
      p.src = substitute(p.src, variables) ?? p.src;
      p.placeholder = substitute(p.placeholder, variables) ?? p.placeholder;
      p.alt = substitute(p.alt, variables);
      p.href = substitute(p.href, variables);
      return next;
    }
    default:
      return next;
  }
}

function renderEmailBlock(
  block: CanvasContentBlock,
  variables: Record<string, string> | undefined,
  // Using `any` by design to allow heterogeneous custom block props across definitions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customRegistry: Record<string, CustomBlockDefinition<any>>,
) {
  const b = withSubstitutions(block, variables);
  switch (block.type) {
    case 'button':
      return <Button {...(b.props as ButtonBlockProps)} />;
    case 'text':
      return <Text {...(b.props as TextBlockProps)} />;
    case 'heading':
      return <Heading {...(b.props as HeadingBlockProps)} />;
    case 'divider':
      return <Divider {...block.props} />;
    case 'image':
      return <Image {...(b.props as ImageBlockProps)} />;
    case 'custom':
      const customProps = block.props as CustomBlockProps;
      const definition = customRegistry[customProps.componentName];
      if (definition) {
        const Component = definition.component;
        return <Component {...(customProps.props as Record<string, unknown>)} />;
      }
      return <div data-component={customProps.componentName}>{customProps.componentName}</div>;
    default:
      return null;
  }
}

/**
 * Renders a canvas column using React Email Column component
 */
function renderEmailColumn(
  column: CanvasColumn,
  variables: Record<string, string> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customRegistry: Record<string, CustomBlockDefinition<any>>,
) {
  const columnStyle: Record<string, unknown> = {};
  if (column.backgroundColor) columnStyle.backgroundColor = column.backgroundColor;
  const columnPaddingStyle = resolvePaddingStyle(column.padding);
  const columnPaddingClasses = resolvePaddingClasses(column.padding).filter(
    (className) => !className.includes(':'),
  );
  if (columnPaddingStyle) columnStyle.padding = columnPaddingStyle;
  if (column.width != null) columnStyle.width = column.width;

  return (
    <Column
      key={column.id}
      className={combineClasses(
        column.backgroundClassName,
        column.className,
        columnPaddingClasses.join(' '),
      )}
      style={columnStyle}
    >
      {column.blocks.map((block) => (
        <div key={block.id}>{renderEmailBlock(block, variables, customRegistry)}</div>
      ))}
    </Column>
  );
}

/**
 * Renders a canvas row using React Email Row component
 */
function renderEmailRow(
  row: CanvasRow,
  variables: Record<string, string> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customRegistry: Record<string, CustomBlockDefinition<any>>,
) {
  const rowStyle: Record<string, unknown> = {};
  if (row.gutter != null) rowStyle.gap = `${row.gutter}px`;
  if (row.backgroundColor) rowStyle.backgroundColor = row.backgroundColor;
  const rowPaddingStyle = resolvePaddingStyle(row.padding);
  const rowPaddingClasses = resolvePaddingClasses(row.padding).filter(
    (className) => !className.includes(':'),
  );
  if (rowPaddingStyle) rowStyle.padding = rowPaddingStyle;

  return (
    <Row
      key={row.id}
      className={combineClasses(row.backgroundClassName, row.className, rowPaddingClasses.join(' '))}
      style={rowStyle}
    >
      {row.columns.map((column) => renderEmailColumn(column, variables, customRegistry))}
    </Row>
  );
}

/**
 * Renders a canvas section using React Email Section component
 */
function renderEmailSection(
  section: CanvasSection,
  variables: Record<string, string> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customRegistry: Record<string, CustomBlockDefinition<any>>,
) {
  const sectionStyle: Record<string, unknown> = {};
  if (section.backgroundColor) sectionStyle.backgroundColor = section.backgroundColor;
  const sectionPaddingStyle = resolvePaddingStyle(section.padding);
  const sectionPaddingClasses = resolvePaddingClasses(section.padding).filter(
    (className) => !className.includes(':'),
  );
  if (sectionPaddingStyle) sectionStyle.padding = sectionPaddingStyle;

  return (
    <Section
      key={section.id}
      className={combineClasses(
        section.backgroundClassName,
        section.className,
        sectionPaddingClasses.join(' '),
      )}
      style={sectionStyle}
    >
      {section.rows.map((row) => renderEmailRow(row, variables, customRegistry))}
    </Section>
  );
}

export interface RenderEmailDocumentOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlocks?: CustomBlockDefinition<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlockRegistry?: Record<string, CustomBlockDefinition<any>>;
}

/**
 * Renders the complete canvas document using React Email components
 * for actual email output. This maintains the proper React Email
 * structure: Section > Row > Column
 *
 * @param document The canvas document to render
 * @returns JSX element using React Email components
 */
export function renderEmailDocument(
  document: CanvasDocument,
  runtimeVariables?: Record<string, string>,
  options: RenderEmailDocumentOptions = {},
) {
  const documentVariables = extractStringVariables(document.variables);
  const merged =
    documentVariables || runtimeVariables
      ? { ...(documentVariables ?? {}), ...(runtimeVariables ?? {}) }
      : undefined;
  // Using `any` by design at the registry boundary; each entry keeps its own prop type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registry: Record<string, CustomBlockDefinition<any>> =
    options.customBlockRegistry ??
    (options.customBlocks
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options.customBlocks.reduce<Record<string, CustomBlockDefinition<any>>>((acc, block) => {
          acc[block.defaults.componentName] = block;
          return acc;
        }, {})
      : {});

  return <>{document.sections.map((section) => renderEmailSection(section, merged, registry))}</>;
}

/**
 * Type guard to check if a document has the proper React Email structure
 */
export function validateEmailStructure(document: CanvasDocument): boolean {
  // Ensure we have sections
  if (!document.sections || document.sections.length === 0) {
    return false;
  }

  // Each section should have rows
  for (const section of document.sections) {
    if (!section.rows || section.rows.length === 0) {
      continue; // Empty sections are allowed
    }

    // Each row should have columns
    for (const row of section.rows) {
      if (!row.columns || row.columns.length === 0) {
        return false; // Rows must have at least one column
      }
    }
  }

  return true;
}
