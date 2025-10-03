import type { CSSProperties } from 'react';
import { Heading as EmailHeading } from '@react-email/components';
import { TextHIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
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
  icon: TextHIcon,
  defaults: headingDefaults,
};

export const HeadingIcon = TextHIcon;

export function Heading(props: HeadingBlockProps & { daisyui?: boolean }) {
  const {
    content,
    as = 'h2',
    align = 'left',
    fontSize = 24,
    color = '#111827',
    lineHeight = '1.3',
    fontWeight = 'bold',
    margin = '0 0 16px',
    daisyui = false,
  } = props;

  const resolvedFontWeight = fontWeight === 'medium' ? 500 : fontWeight;

  const style: CSSProperties = {
    textAlign: align,
    fontSize: daisyui ? undefined : fontSize,
    color: daisyui ? undefined : color,
    lineHeight: daisyui ? undefined : lineHeight,
    fontWeight: daisyui ? undefined : resolvedFontWeight,
    margin,
  };

  const getDaisyUIHeadingClass = () => {
    if (!daisyui) return '';

    switch (as) {
      case 'h1':
        return 'text-4xl font-bold text-base-content';
      case 'h2':
        return 'text-3xl font-bold text-base-content';
      case 'h3':
        return 'text-2xl font-bold text-base-content';
      case 'h4':
        return 'text-xl font-bold text-base-content';
      case 'h5':
        return 'text-lg font-bold text-base-content';
      case 'h6':
        return 'text-base font-bold text-base-content';
      default:
        return 'text-3xl font-bold text-base-content';
    }
  };

  return (
    <EmailHeading
      as={as}
      className={clsx({
        [getDaisyUIHeadingClass()]: daisyui,
      })}
      style={style}
    >
      {content}
    </EmailHeading>
  );
}
