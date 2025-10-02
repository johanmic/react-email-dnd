import type { CSSProperties } from 'react';
import { Img } from '@react-email/components';
import { ImageSquareIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, ImageBlock, ImageBlockProps } from '../types/schema';

export const imageDefaults: ImageBlockProps = {
  src: 'https://placehold.co/600x200',
  alt: 'Placeholder image',
  width: 600,
  height: 200,
  align: 'center',
  borderRadius: 0,
};

export const imageDefinition: BlockDefinition<ImageBlock> = {
  type: 'image',
  label: 'Image',
  icon: ImageSquareIcon,
  defaults: imageDefaults,
};

export const ImageIcon = ImageSquareIcon;

export function Image(props: ImageBlockProps & { daisyui?: boolean }) {
  const {
    src,
    alt,
    href,
    width,
    height,
    align = 'center',
    borderRadius = 0,
    daisyui = false,
    placeholder,
  } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin: '12px 0',
  };

  return (
    <div style={wrapperStyle}>
      <Img
        src={src || placeholder || imageDefaults.src}
        alt={alt}
        href={href}
        width={width}
        height={height}
        className={clsx({
          'rounded-lg': daisyui,
        })}
        style={{
          borderRadius: daisyui ? undefined : borderRadius,
          display: 'inline-block',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}
