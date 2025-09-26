import type { CSSProperties } from 'react';
import { Button as EmailButton } from '@react-email/components';
import { HandPointing } from '@phosphor-icons/react';
import type { BlockDefinition, ButtonBlock, ButtonBlockProps } from '../types/schema';

export const buttonDefaults: ButtonBlockProps = {
  label: 'Call to action',
  href: 'https://example.com',
  align: 'center',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderRadius: 6,
};

export const buttonDefinition: BlockDefinition<ButtonBlock> = {
  type: 'button',
  label: 'Button',
  icon: HandPointing,
  defaults: buttonDefaults,
};

export const ButtonIcon = HandPointing;

export function Button(props: ButtonBlockProps) {
  const {
    label,
    href,
    align = 'center',
    backgroundColor = '#2563eb',
    color = '#ffffff',
    borderRadius = 6,
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin: '12px 0',
  };

  return (
    <div style={wrapperStyle} className="email-dnd-button">
      <EmailButton
        href={href}
        style={{
          display: 'inline-block',
          backgroundColor,
          color,
          borderRadius,
          padding: '12px 24px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        {label}
      </EmailButton>
    </div>
  );
}
