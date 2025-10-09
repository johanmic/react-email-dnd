import type { CSSProperties } from 'react';
import { Img } from '@react-email/components';
import { ImageSquareIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import type { BlockDefinition, ImageBlock, ImageBlockProps } from '@react-email-dnd/shared';
import { resolvePaddingClasses, resolvePaddingStyle } from '../utils/padding';

export const imageDefaults: ImageBlockProps = {
  src: 'https://placehold.co/600x200',
  alt: 'Placeholder image',
  width: 600,
  height: 200,
  align: 'center',
  borderRadius: 0,
  margin: '12px 0',
  padding: '0',
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
    margin = '12px 0',
    padding = '0',
    daisyui = false,
    placeholder,
    className: customClassName,
  } = props;

  const paddingStyle = resolvePaddingStyle(padding);
  const paddingClasses = resolvePaddingClasses(padding);

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

  const getBorderRadiusClass = () => {
    if (borderRadius === 0) return '';
    if (borderRadius <= 4) return 'rounded-sm';
    if (borderRadius <= 8) return 'rounded-md';
    if (borderRadius <= 12) return 'rounded-lg';
    if (borderRadius <= 16) return 'rounded-xl';
    if (borderRadius <= 24) return 'rounded-2xl';
    return 'rounded-3xl';
  };

  const getSizeClass = () => {
    const imgWidth = (width ?? imageDefaults.width) as number;
    if (imgWidth <= 200) return 'max-w-xs';
    if (imgWidth <= 300) return 'max-w-sm';
    if (imgWidth <= 400) return 'max-w-md';
    if (imgWidth <= 500) return 'max-w-lg';
    if (imgWidth <= 600) return 'max-w-xl';
    if (imgWidth <= 800) return 'max-w-2xl';
    if (imgWidth <= 1000) return 'max-w-3xl';
    return 'max-w-4xl';
  };

  return (
    <div style={wrapperStyle} className={clsx('w-full', getAlignmentClass())}>
      <Img
        src={src || placeholder || imageDefaults.src}
        alt={alt}
        href={href}
        width={width ?? imageDefaults.width}
        height={height ?? imageDefaults.height}
        className={clsx(
          // Base responsive classes
          'block mx-auto',
          getSizeClass(),
          getBorderRadiusClass(),
          // DaisyUI specific classes
          {
            'rounded-lg': daisyui && borderRadius > 0,
            'shadow-lg': daisyui,
          },
          customClassName,
          paddingClasses,
        )}
        style={{
          borderRadius: daisyui ? undefined : `${borderRadius}px`,
          margin,
          ...(paddingStyle ? { padding: paddingStyle } : {}),
          display: 'inline-block',
          maxWidth: '100%',
          height: 'auto',
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
}
