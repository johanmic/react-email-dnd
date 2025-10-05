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
    daisyui = false,
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin,
  };

  const lineStyle: CSSProperties = {
    border: 'none',
    borderTop: daisyui ? undefined : `${thickness}px solid ${color}`,
    margin: 0,
    width,
    display: 'inline-block',
  };

  return (
    <div style={wrapperStyle}>
      <Hr
        className={clsx({
          divider: daisyui,
        })}
        style={lineStyle}
      />
    </div>
  );
}
