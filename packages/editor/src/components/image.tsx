import type { CSSProperties } from 'react';
import { Img } from '@react-email/components';
import { ImageSquareIcon } from '@phosphor-icons/react';
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

export function Image(props: ImageBlockProps) {
  const { src, alt, href, width, height, align = 'center', borderRadius = 0 } = props;

  const wrapperStyle: CSSProperties = {
    textAlign: align,
    margin: '12px 0',
  };

  return (
    <div style={wrapperStyle} className="email-dnd-image">
      <Img
        src={src}
        alt={alt}
        href={href}
        width={width}
        height={height}
        style={{
          borderRadius,
          display: 'inline-block',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}
