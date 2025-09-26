declare module '@react-email/components' {
  import type {
    AnchorHTMLAttributes,
    DetailedHTMLProps,
    HTMLAttributes,
    ImgHTMLAttributes,
    ReactNode,
  } from 'react';

  export interface ButtonProps
    extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
    children?: ReactNode;
  }
  export function Button(props: ButtonProps): JSX.Element;

  export interface TextProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> {
    children?: ReactNode;
  }
  export function Text(props: TextProps): JSX.Element;

  export interface HeadingProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    children?: ReactNode;
  }
  export function Heading(props: HeadingProps): JSX.Element;

  export interface ImgProps
    extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    href?: string;
  }
  export function Img(props: ImgProps): JSX.Element;

  export interface HrProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement> {}
  export function Hr(props: HrProps): JSX.Element;
}
