import type { CSSProperties } from 'react';
import { Button as EmailButton } from '@react-email/components';
import { HandPointingIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, ButtonBlock, ButtonBlockProps } from '@react-email-dnd/shared';
import { resolvePaddingClasses, resolvePaddingStyle } from '../utils/padding';

export const buttonDefaults: ButtonBlockProps = {
  label: 'Call to action',
  href: 'https://example.com',
  align: 'center',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderRadius: 6,
  padding: '12px 24px',
  fontSize: 14,
  fontWeight: 'bold',
  margin: '12px 0',
};

export const buttonDefinition: BlockDefinition<ButtonBlock> = {
  type: 'button',
  label: 'Button',
  icon: HandPointingIcon,
  defaults: buttonDefaults,
};

export const ButtonIcon = HandPointingIcon;

export function Button(props: ButtonBlockProps & { daisyui?: boolean; editorMode?: boolean }) {
  const {
    label,
    href,
    align = 'center',
    backgroundColor,
    backgroundClassName,
    color,
    colorClassName,
    borderRadius = 6,
    padding = '12px 24px',
    fontSize = 14,
    fontWeight = 'bold',
    margin = '12px 0',
    daisyui = false,
    editorMode = false,
    className: customClassName,
  } = props;

  const resolvedFontWeight = fontWeight === 'medium' ? 500 : fontWeight;
  const paddingStyle = resolvePaddingStyle(padding);
  const paddingClasses = resolvePaddingClasses(padding);

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    width: '100%',
  };

  const defaultBackground = '#2563eb';
  const defaultTextColor = '#ffffff';
  const hasBackgroundClass = Boolean(backgroundClassName);
  const hasTextClass = Boolean(colorClassName);

  const inlineBackgroundColor =
    hasBackgroundClass || daisyui ? undefined : backgroundColor ?? defaultBackground;
  const inlineTextColor = hasTextClass || daisyui ? undefined : color ?? defaultTextColor;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (editorMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const getAlignmentClass = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'left':
        return 'text-left';
      default:
        return 'text-center';
    }
  };

  const getSizeClass = () => {
    if (fontSize <= 12) return 'text-xs';
    if (fontSize <= 14) return 'text-sm';
    if (fontSize <= 16) return 'text-base';
    if (fontSize <= 18) return 'text-lg';
    return 'text-xl';
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

  const getFallbackPaddingClass = () => {
    if (paddingClasses.length > 0) {
      return undefined;
    }
    const basePaddingValue = paddingStyle ?? (typeof padding === 'string' ? padding : undefined);
    if (!basePaddingValue) {
      return undefined;
    }

    const [topToken] = basePaddingValue.split(/\s+/);
    if (!topToken) {
      return undefined;
    }

    const pxMatch = topToken.match(/([\d.]+)px/);
    const numeric = pxMatch ? parseFloat(pxMatch[1]) : Number(topToken);
    if (!Number.isFinite(numeric)) {
      return undefined;
    }

    if (numeric <= 8) return 'py-1';
    if (numeric <= 12) return 'py-2';
    if (numeric <= 16) return 'py-3';
    if (numeric <= 20) return 'py-4';
    return 'py-5';
  };

  return (
    <div style={wrapperStyle} className={clsx('w-full', getAlignmentClass())}>
      <EmailButton
        href={href}
        className={clsx(
          // Base responsive classes
          'inline-block no-underline cursor-pointer transition-all duration-200',
          'hover:opacity-90 active:opacity-75',
          getSizeClass(),
          getFontWeightClass(),
          getFallbackPaddingClass(),
          // DaisyUI specific classes
          {
            btn: daisyui,
            'btn-primary': daisyui && !hasBackgroundClass && backgroundColor === '#2563eb',
            'btn-secondary': daisyui && !hasBackgroundClass && backgroundColor === '#6b7280',
            'btn-accent': daisyui && !hasBackgroundClass && backgroundColor === '#8b5cf6',
            'btn-neutral': daisyui && !hasBackgroundClass && backgroundColor === '#374151',
            'btn-success': daisyui && !hasBackgroundClass && backgroundColor === '#059669',
            'btn-warning': daisyui && !hasBackgroundClass && backgroundColor === '#d97706',
            'btn-error': daisyui && !hasBackgroundClass && backgroundColor === '#dc2626',
            'btn-info': daisyui && !hasBackgroundClass && backgroundColor === '#0891b2',
            // Fallback for custom colors
            'btn-ghost':
              daisyui &&
              !hasBackgroundClass &&
              ![
                '#2563eb',
                '#6b7280',
                '#8b5cf6',
                '#374151',
                '#059669',
                '#d97706',
                '#dc2626',
                '#0891b2',
              ].includes(backgroundColor),
          },
          backgroundClassName,
          colorClassName,
          customClassName,
          paddingClasses,
        )}
        style={{
          display: 'inline-block',
          backgroundColor: inlineBackgroundColor,
          color: inlineTextColor,
          borderRadius: daisyui ? undefined : `${borderRadius}px`,
          padding: daisyui ? undefined : paddingStyle ?? (typeof padding === 'string' ? padding : undefined),
          fontSize: `${fontSize}px`,
          fontWeight: resolvedFontWeight,
          margin,
          textDecoration: 'none',
          cursor: editorMode ? 'pointer' : undefined,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          border: 'none',
          outline: 'none',
          minWidth: '120px',
          maxWidth: '100%',
        }}
        onClick={handleClick}
      >
        {label}
      </EmailButton>
    </div>
  );
}
