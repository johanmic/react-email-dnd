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
    daisyui = false,
    editorMode = false,
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin: '12px 0',
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (editorMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div style={wrapperStyle} className="">
      <EmailButton
        href={href}
        className={clsx({
          'btn': daisyui,
        })}
        style={{
          display: 'inline-block',
          backgroundColor,
          color,
          borderRadius,
          padding: '12px 24px',
          textDecoration: 'none',
          fontWeight: 600,
          cursor: editorMode ? 'pointer' : undefined,
        }}
        onClick={handleClick}
      >
        {label}
      </EmailButton>
    </div>
  );
}
