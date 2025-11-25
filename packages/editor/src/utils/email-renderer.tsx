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
  CustomBlockRegistry,
} from '@react-email-dnd/shared';
import { buildCustomBlockRegistry } from '@react-email-dnd/shared';
import { Button } from '../components/button';
import { Divider } from '../components/divider';
import { Heading } from '../components/heading';
import { Image } from '../components/image';
import { Text } from '../components/text';
import { deepSubstitute, substituteString } from './templateVariables';

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

function withSubstitutions(
  block: CanvasContentBlock,
  variables: Record<string, unknown> | undefined,
): CanvasContentBlock {
  // Only substitute known string props
  const next = JSON.parse(JSON.stringify(block)) as CanvasContentBlock;
  switch (next.type) {
    case 'button': {
      const p = next.props as ButtonBlockProps;
      p.label = substituteString(p.label, variables) ?? p.label;
      p.href = substituteString(p.href, variables);
      return next;
    }
    case 'text': {
      const p = next.props as TextBlockProps;
      p.content = substituteString(p.content, variables) ?? p.content;
      return next;
    }
    case 'heading': {
      const p = next.props as HeadingBlockProps;
      p.content = substituteString(p.content, variables) ?? p.content;
      return next;
    }
    case 'image': {
      const p = next.props as ImageBlockProps;
      p.src = substituteString(p.src, variables) ?? p.src;
      p.placeholder = substituteString(p.placeholder, variables) ?? p.placeholder;
      p.alt = substituteString(p.alt, variables);
      p.href = substituteString(p.href, variables);
      return next;
    }
    case 'custom': {
      const p = next.props as CustomBlockProps;
      p.props = deepSubstitute(p.props, variables) as Record<string, unknown>;
      return next;
    }
    default:
      return next;
  }
}

function renderEmailBlock(
  block: CanvasContentBlock,
  variables: Record<string, unknown> | undefined,
  customRegistry: CustomBlockRegistry,
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
      const customProps = b.props as CustomBlockProps;
      const definition = customRegistry[customProps.componentName];
      if (definition) {
        const Component = definition.component;
        return (
          <Component
            {...(customProps.props as Record<string, unknown>)}
            {...(variables ?? {})}
          />
        );
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
  variables: Record<string, unknown> | undefined,
  customRegistry: CustomBlockRegistry,
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
  variables: Record<string, unknown> | undefined,
  customRegistry: CustomBlockRegistry,
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
  variables: Record<string, unknown> | undefined,
  customRegistry: CustomBlockRegistry,
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
  customBlocks?: CustomBlockDefinition<any>[] | CustomBlockRegistry;
  customBlockRegistry?: CustomBlockRegistry;
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
  runtimeVariables?: Record<string, unknown>,
  options: RenderEmailDocumentOptions = {},
) {
  const merged =
    document.variables || runtimeVariables
      ? { ...(document.variables ?? {}), ...(runtimeVariables ?? {}) }
      : undefined;
  const registry: CustomBlockRegistry =
    options.customBlockRegistry ??
    (Array.isArray(options.customBlocks)
      ? buildCustomBlockRegistry(options.customBlocks)
      : options.customBlocks ?? {});

  return (
    <>{document.sections.map((section) => renderEmailSection(section, merged, registry))}</>
  );
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
