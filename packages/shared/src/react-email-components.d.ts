declare module "@react-email/components" {
  import type {
    AnchorHTMLAttributes,
    DetailedHTMLProps,
    HTMLAttributes,
    ImgHTMLAttributes,
    ReactNode,
  } from "react"

  export interface ButtonProps
    extends DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    > {
    children?: ReactNode
  }
  export function Button(props: ButtonProps): JSX.Element

  export interface TextProps
    extends DetailedHTMLProps<
      HTMLAttributes<HTMLParagraphElement>,
      HTMLParagraphElement
    > {
    children?: ReactNode
  }
  export function Text(props: TextProps): JSX.Element

  export interface HeadingProps
    extends DetailedHTMLProps<
      HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    > {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    children?: ReactNode
  }
  export function Heading(props: HeadingProps): JSX.Element

  export interface ImgProps
    extends DetailedHTMLProps<
      ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    > {
    href?: string
  }
  export function Img(props: ImgProps): JSX.Element

  export type HrProps = DetailedHTMLProps<
    HTMLAttributes<HTMLHRElement>,
    HTMLHRElement
  >
  export function Hr(props: HrProps): JSX.Element

  export interface RowProps
    extends DetailedHTMLProps<
      HTMLAttributes<HTMLTableRowElement>,
      HTMLTableRowElement
    > {
    children?: ReactNode
  }
  export function Row(props: RowProps): JSX.Element

  export interface ColumnProps
    extends DetailedHTMLProps<
      HTMLAttributes<HTMLTableDataCellElement>,
      HTMLTableDataCellElement
    > {
    children?: ReactNode
  }
  export function Column(props: ColumnProps): JSX.Element

  export interface SectionProps
    extends DetailedHTMLProps<
      HTMLAttributes<HTMLTableSectionElement>,
      HTMLTableSectionElement
    > {
    children?: ReactNode
  }
  export function Section(props: SectionProps): JSX.Element

  export interface LinkProps
    extends DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    > {
    children?: ReactNode
  }
  export function Link(props: LinkProps): JSX.Element
}
