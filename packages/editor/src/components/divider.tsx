import type { CSSProperties } from 'react';
import { Hr } from '@react-email/components';
import { Minus } from '@phosphor-icons/react';
import type { BlockDefinition, DividerBlock, DividerBlockProps } from '../types/schema';

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

export function Divider(props: DividerBlockProps) {
  const {
    color = '#e5e7eb',
    thickness = 1,
    width = '100%',
    align = 'center',
    margin = '16px 0',
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin,
  };

  const lineStyle: CSSProperties = {
    border: 'none',
    borderTop: `${thickness}px solid ${color}`,
    margin: 0,
    width,
    display: 'inline-block',
  };

  return (
    <div style={wrapperStyle} className="email-dnd-divider">
      <Hr style={lineStyle} />
    </div>
  );
}
