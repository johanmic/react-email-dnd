import type { CSSProperties } from 'react';
import { Button as EmailButton } from '@react-email/components';
import { HandPointingIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
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
  icon: HandPointingIcon,
  defaults: buttonDefaults,
};

export const ButtonIcon = HandPointingIcon;

export function Button(props: ButtonBlockProps & { daisyui?: boolean }) {
  const {
    label,
    href,
    align = 'center',
    backgroundColor = '#2563eb',
    color = '#ffffff',
    borderRadius = 6,
    daisyui = false,
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin: '12px 0',
  };

  return (
    <div style={wrapperStyle} className="">
      <EmailButton
        href={href}
        className={clsx({
          'btn btn-primary': daisyui,
        })}
        style={{
          display: 'inline-block',
          backgroundColor: daisyui ? undefined : backgroundColor,
          color: daisyui ? undefined : color,
          borderRadius: daisyui ? undefined : borderRadius,
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
