import type { CSSProperties } from 'react';
import { Text as EmailText } from '@react-email/components';
import { TextT } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, TextBlock, TextBlockProps } from '@react-email-dnd/shared';

export const textDefaults: TextBlockProps = {
  content: 'Start typing your message here.',
  align: 'left',
  fontSize: 16,
  color: '#1f2937',
  lineHeight: '1.6',
  fontWeight: 'normal',
};

export const textDefinition: BlockDefinition<TextBlock> = {
  type: 'text',
  label: 'Text',
  icon: TextT,
  defaults: textDefaults,
};

export const TextIcon = TextT;

export function Text(props: TextBlockProps & { daisyui?: boolean }) {
  const {
    content,
    align = 'left',
    fontSize = 16,
    color = '#1f2937',
    lineHeight = '1.6',
    fontWeight = 'normal',
    daisyui = false,
  } = props;

  const resolvedFontWeight = fontWeight === 'medium' ? 500 : fontWeight;

  const style: CSSProperties = {
    textAlign: align,
    fontSize,
    color,
    lineHeight,
    fontWeight: resolvedFontWeight,
    margin: '0 0 16px',
  };

  return (
    <EmailText
      className={clsx({
        'text-base-content': daisyui,
      })}
      style={style}
    >
      {content}
    </EmailText>
  );
}
