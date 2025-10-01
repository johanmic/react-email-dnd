import type { CSSProperties } from 'react';
import { Text as EmailText } from '@react-email/components';
import { TextT } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, TextBlock, TextBlockProps } from '../types/schema';

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

  const style: CSSProperties = {
    textAlign: align,
    fontSize: daisyui ? undefined : fontSize,
    color: daisyui ? undefined : color,
    lineHeight: daisyui ? undefined : lineHeight,
    fontWeight: daisyui ? undefined : fontWeight,
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
