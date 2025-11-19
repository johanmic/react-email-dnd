import type { CSSProperties } from 'react';
import { Heading as EmailHeading } from '@react-email/components';
import { TextHIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, HeadingBlock, HeadingBlockProps } from '@react-email-dnd/shared';
import { resolvePaddingClasses, resolvePaddingStyle } from '../utils/padding';
import { replaceVariables } from '../utils/templateVariables';

export const headingDefaults: HeadingBlockProps = {
  content: 'Add a clear headline',
  as: 'h2',
  align: 'left',
  fontSize: 24,
  color: '#111827',
  lineHeight: '1.3',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

export const headingDefinition: BlockDefinition<HeadingBlock> = {
  type: 'heading',
  label: 'Heading',
  icon: TextHIcon,
  defaults: headingDefaults,
};

export const HeadingIcon = TextHIcon;

export function Heading(
  props: HeadingBlockProps & {
    daisyui?: boolean;
    variables?: Record<string, unknown>;
    previewVariables?: boolean;
  },
) {
  const {
    content,
    as = 'h2',
    align = 'left',
    fontSize = 24,
    color,
    colorClassName,
    lineHeight = '1.3',
    fontWeight = 'bold',
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
  const defaultColor = '#111827';
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
    fontFamily:
      fontFamily ||
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    wordBreak: 'break-word',
    maxWidth: '100%',
    ...(inlineColor ? { color: inlineColor } : {}),
    ...(paddingStyle ? { padding: paddingStyle } : {}),
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
    if (fontSize <= 16) return 'text-base';
    if (fontSize <= 18) return 'text-lg';
    if (fontSize <= 20) return 'text-xl';
    if (fontSize <= 24) return 'text-2xl';
    if (fontSize <= 30) return 'text-3xl';
    if (fontSize <= 36) return 'text-4xl';
    if (fontSize <= 48) return 'text-5xl';
    return 'text-6xl';
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
        return 'font-bold';
    }
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
      className={clsx(
        // Base responsive classes
        'block w-full leading-tight',
        getAlignmentClass(),
        getFontSizeClass(),
        getFontWeightClass(),
        !colorClassName && (daisyui ? getDaisyUIHeadingClass() : 'text-gray-900'),
        colorClassName,
        customClassName,
        paddingClasses,
      )}
      style={style}
    >
      {displayContent}
    </EmailHeading>
  );
}
