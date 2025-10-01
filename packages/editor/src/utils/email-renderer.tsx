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
} from '../types/schema';
import { Button } from '../components/button';
import { Divider } from '../components/divider';
import { Heading } from '../components/heading';
import { Image } from '../components/image';
import { Text } from '../components/text';

/**
 * Renders a content block using the appropriate component
 */
function renderEmailBlock(block: CanvasContentBlock) {
  switch (block.type) {
    case 'button':
      return <Button {...block.props} />;
    case 'text':
      return <Text {...block.props} />;
    case 'heading':
      return <Heading {...block.props} />;
    case 'divider':
      return <Divider {...block.props} />;
    case 'image':
      return <Image {...block.props} />;
    case 'custom':
      return <div data-component={block.props.componentName}>{block.props.componentName}</div>;
    default:
      return null;
  }
}

/**
 * Renders a canvas column using React Email Column component
 */
function renderEmailColumn(column: CanvasColumn) {
  return (
    <Column key={column.id}>
      {column.blocks.map((block) => (
        <div key={block.id}>{renderEmailBlock(block)}</div>
      ))}
    </Column>
  );
}

/**
 * Renders a canvas row using React Email Row component
 */
function renderEmailRow(row: CanvasRow) {
  return <Row key={row.id}>{row.columns.map((column) => renderEmailColumn(column))}</Row>;
}

/**
 * Renders a canvas section using React Email Section component
 */
function renderEmailSection(section: CanvasSection) {
  return <Section key={section.id}>{section.rows.map((row) => renderEmailRow(row))}</Section>;
}

/**
 * Renders the complete canvas document using React Email components
 * for actual email output. This maintains the proper React Email
 * structure: Section > Row > Column
 *
 * @param document The canvas document to render
 * @returns JSX element using React Email components
 */
export function renderEmailDocument(document: CanvasDocument) {
  return <>{document.sections.map((section) => renderEmailSection(section))}</>;
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
