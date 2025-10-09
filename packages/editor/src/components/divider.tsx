import type { CSSProperties } from 'react';
import { Hr } from '@react-email/components';
import { Minus } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, DividerBlock, DividerBlockProps } from '@react-email-dnd/shared';

export const dividerDefaults: DividerBlockProps = {
  color: '#e5e7eb',
  thickness: 1,
  width: '100%',
  align: 'center',
  margin: '16px 0',
  padding: '0',
};

export const dividerDefinition: BlockDefinition<DividerBlock> = {
  type: 'divider',
  label: 'Divider',
  icon: Minus,
  defaults: dividerDefaults,
};

export const DividerIcon = Minus;

export function Divider(props: DividerBlockProps & { daisyui?: boolean }) {
  const {
    color = '#e5e7eb',
    thickness = 1,
    width = '100%',
    align = 'center',
    margin = '16px 0',
    padding = '0',
    daisyui = false,
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    width: '100%',
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

  const getWidthClass = () => {
    if (width === '100%') return 'w-full';
    if (width === '75%') return 'w-3/4';
    if (width === '50%') return 'w-1/2';
    if (width === '25%') return 'w-1/4';
    return '';
  };

  const getThicknessClass = () => {
    if (thickness <= 1) return 'border-t';
    if (thickness <= 2) return 'border-t-2';
    if (thickness <= 4) return 'border-t-4';
    return 'border-t-8';
  };

  const lineStyle: CSSProperties = {
    border: 'none',
    borderTop: daisyui ? undefined : `${thickness}px solid ${color}`,
    margin,
    padding,
    width,
    display: 'inline-block',
    maxWidth: '100%',
  };

  return (
    <div style={wrapperStyle} className={clsx('w-full', getAlignmentClass())}>
      <Hr
        className={clsx(
          // Base responsive classes
          'block',
          getWidthClass(),
          getThicknessClass(),
          // DaisyUI specific classes
          {
            divider: daisyui,
            'border-gray-300': !daisyui,
          },
        )}
        style={lineStyle}
      />
    </div>
  );
}
