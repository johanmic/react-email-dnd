import type { CSSProperties } from 'react';
import { Button as EmailButton } from '@react-email/components';
import { HandPointingIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, ButtonBlock, ButtonBlockProps } from '@react-email-dnd/shared';

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
    backgroundColor = '#2563eb',
    color = '#ffffff',
    borderRadius = 6,
    padding = '12px 24px',
    fontSize = 14,
    fontWeight = 'bold',
    margin = '12px 0',
    daisyui = false,
    editorMode = false,
  } = props;

  const resolvedFontWeight = fontWeight === 'medium' ? 500 : fontWeight;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    width: '100%',
  };

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

  const getPaddingClass = () => {
    const paddingValue = padding.replace(/px/g, '');
    const [topBottom] = paddingValue.split(' ').map(Number);

    if (topBottom <= 8) return 'py-1';
    if (topBottom <= 12) return 'py-2';
    if (topBottom <= 16) return 'py-3';
    if (topBottom <= 20) return 'py-4';
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
          getPaddingClass(),
          // DaisyUI specific classes
          {
            btn: daisyui,
            'btn-primary': daisyui && backgroundColor === '#2563eb',
            'btn-secondary': daisyui && backgroundColor === '#6b7280',
            'btn-accent': daisyui && backgroundColor === '#8b5cf6',
            'btn-neutral': daisyui && backgroundColor === '#374151',
            'btn-success': daisyui && backgroundColor === '#059669',
            'btn-warning': daisyui && backgroundColor === '#d97706',
            'btn-error': daisyui && backgroundColor === '#dc2626',
            'btn-info': daisyui && backgroundColor === '#0891b2',
            // Fallback for custom colors
            'btn-ghost':
              daisyui &&
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
        )}
        style={{
          display: 'inline-block',
          backgroundColor: daisyui ? undefined : backgroundColor,
          color: daisyui ? undefined : color,
          borderRadius: daisyui ? undefined : `${borderRadius}px`,
          padding: daisyui ? undefined : padding,
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
