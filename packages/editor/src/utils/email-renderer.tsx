import * as ReactEmailComponents from '@react-email/components';
import type { RowProps, ColumnProps, SectionProps } from '@react-email/components';

const ReactEmailModule = ReactEmailComponents as {
  Row: React.ComponentType<RowProps>;
  Column: React.ComponentType<ColumnProps>;
  Section: React.ComponentType<SectionProps>;
};

const { Row, Column, Section } = ReactEmailModule;
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
} from '../types/schema';
import { Button } from '../components/button';
import { Divider } from '../components/divider';
import { Heading } from '../components/heading';
import { Image } from '../components/image';
import { Text } from '../components/text';

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

function renderEmailBlock(block: CanvasContentBlock, variables?: Record<string, string>) {
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
      return <div data-component={block.props.componentName}>{block.props.componentName}</div>;
    default:
      return null;
  }
}

/**
 * Renders a canvas column using React Email Column component
 */
function renderEmailColumn(column: CanvasColumn, variables?: Record<string, string>) {
  return (
    <Column key={column.id}>
      {column.blocks.map((block) => (
        <div key={block.id}>{renderEmailBlock(block, variables)}</div>
      ))}
    </Column>
  );
}

/**
 * Renders a canvas row using React Email Row component
 */
function renderEmailRow(row: CanvasRow, variables?: Record<string, string>) {
  return (
    <Row key={row.id}>{row.columns.map((column) => renderEmailColumn(column, variables))}</Row>
  );
}

/**
 * Renders a canvas section using React Email Section component
 */
function renderEmailSection(section: CanvasSection, variables?: Record<string, string>) {
  return (
    <Section key={section.id}>{section.rows.map((row) => renderEmailRow(row, variables))}</Section>
  );
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
) {
  const merged = { ...(document.variables ?? {}), ...(runtimeVariables ?? {}) };
  return <>{document.sections.map((section) => renderEmailSection(section, merged))}</>;
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
