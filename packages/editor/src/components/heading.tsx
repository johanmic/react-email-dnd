import type { CSSProperties } from 'react';
import { Heading as EmailHeading } from '@react-email/components';
import { TextH } from '@phosphor-icons/react';
import type { BlockDefinition, HeadingBlock, HeadingBlockProps } from '../types/schema';

export const headingDefaults: HeadingBlockProps = {
  content: 'Add a clear headline',
  as: 'h2',
  align: 'left',
  fontSize: 24,
  color: '#111827',
  lineHeight: '1.3',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

export const headingDefinition: BlockDefinition<HeadingBlock> = {
  type: 'heading',
  label: 'Heading',
  icon: TextH,
  defaults: headingDefaults,
};

export const HeadingIcon = TextH;

export function Heading(props: HeadingBlockProps) {
  const {
    content,
    as = 'h2',
    align = 'left',
    fontSize = 24,
    color = '#111827',
    lineHeight = '1.3',
    fontWeight = 'bold',
    margin = '0 0 16px',
  } = props;

  const resolvedFontWeight = fontWeight === 'medium' ? 500 : fontWeight;

  const style: CSSProperties = {
    textAlign: align,
    fontSize,
    color,
    lineHeight,
    fontWeight: resolvedFontWeight,
    margin,
  };

  return (
    <EmailHeading as={as} style={style} className="email-dnd-heading">
      {content}
    </EmailHeading>
  );
}
