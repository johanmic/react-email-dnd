import type { CSSProperties } from 'react';
import { Text as EmailText } from '@react-email/components';
import { TextT } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, TextBlock, TextBlockProps } from '@react-email-dnd/shared';
import { resolvePaddingClasses, resolvePaddingStyle } from '../utils/padding';
import { replaceVariables } from '../utils/templateVariables';

export const textDefaults: TextBlockProps = {
  content: 'Start typing your message here.',
  align: 'left',
  fontSize: 16,
  color: '#1f2937',
  lineHeight: '1.6',
  fontWeight: 'normal',
  margin: '0 0 16px',
  padding: '0',
};

export const textDefinition: BlockDefinition<TextBlock> = {
  type: 'text',
  label: 'Text',
  icon: TextT,
  defaults: textDefaults,
};

export const TextIcon = TextT;

export function Text(
  props: TextBlockProps & {
    daisyui?: boolean;
    variables?: Record<string, unknown>;
    previewVariables?: boolean;
  },
) {
  const {
    content,
    align = 'left',
    fontSize = 16,
    color,
    colorClassName,
    lineHeight = '1.6',
    fontWeight = 'normal',
    fontFamily,
    margin = '0 0 16px',
    padding = '0',
    daisyui = false,
    className: customClassName,
    variables,
    previewVariables,
  } = props;

  const paddingStyle = resolvePaddingStyle(padding);
  const paddingClasses = resolvePaddingClasses(padding);

  const resolvedFontWeight = fontWeight === 'medium' ? 500 : fontWeight;
  // When daisyui is enabled and no colorClassName is set, use text-base-content class instead of inline color
  // When daisyui is disabled and no colorClassName is set, use default gray color
  const defaultColor = daisyui && !colorClassName ? undefined : '#1f2937';
  const inlineColor = color ?? (colorClassName ? undefined : defaultColor);

  const displayContent = previewVariables
    ? replaceVariables(content, variables, daisyui)
    : content;

  const style: CSSProperties = {
    textAlign: align,
    fontSize: `${fontSize}px`,
    lineHeight,
    fontWeight: resolvedFontWeight,
    margin,
    ...(paddingStyle ? { padding: paddingStyle } : {}),
    fontFamily:
      fontFamily ||
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    wordBreak: 'break-word',
    maxWidth: '100%',
    ...(inlineColor ? { color: inlineColor } : {}),
  };

  const getAlignmentClass = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

  const getFontSizeClass = () => {
    if (fontSize <= 12) return 'text-xs';
    if (fontSize <= 14) return 'text-sm';
    if (fontSize <= 16) return 'text-base';
    if (fontSize <= 18) return 'text-lg';
    if (fontSize <= 20) return 'text-xl';
    if (fontSize <= 24) return 'text-2xl';
    if (fontSize <= 30) return 'text-3xl';
    return 'text-4xl';
  };

  const getFontWeightClass = () => {
    switch (fontWeight) {
      case 'light':
        return 'font-light';
      case 'normal':
        return 'font-normal';
      case 'medium':
        return 'font-medium';
      case 'bold':
        return 'font-bold';
      case 'extrabold':
        return 'font-extrabold';
      default:
        return 'font-normal';
    }
  };

  return (
    <EmailText
      className={clsx(
        // Base responsive classes
        'block w-full leading-relaxed',
        getAlignmentClass(),
        getFontSizeClass(),
        getFontWeightClass(),
        // DaisyUI specific classes
        {
          'text-base-content': daisyui && !colorClassName,
          'text-gray-800': !daisyui && !colorClassName,
        },
        colorClassName,
        customClassName,
        paddingClasses,
      )}
      style={style}
    >
      {displayContent}
    </EmailText>
  );
}
