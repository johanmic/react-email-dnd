import type { ComponentType } from 'react';
import type { IconProps } from '@phosphor-icons/react';

export interface DocumentMeta {
  title: string;
  description?: string;
  tags?: string[];
}

export interface CanvasDocument {
  version: number;
  meta: DocumentMeta;
  /**
   * Key-value variables available for placeholder substitution in content.
   * Example: { user_name: "Alice", order_id: "123" }
   */
  variables?: Record<string, string>;
  sections: CanvasSection[];
}

interface IdentifiedNode<Type extends string> {
  id: string;
  type: Type;
}

export interface CanvasSection extends IdentifiedNode<'section'> {
  rows: CanvasRow[];
  backgroundColor?: string;
  padding?: string;
  locked?: boolean;
}

export interface CanvasRow extends IdentifiedNode<'row'> {
  columns: CanvasColumn[];
  gutter?: number;
  locked?: boolean;
}

export interface CanvasColumn extends IdentifiedNode<'column'> {
  width?: number;
  blocks: CanvasContentBlock[];
  locked?: boolean;
}

export type CanvasContentBlock =
  | ButtonBlock
  | TextBlock
  | HeadingBlock
  | DividerBlock
  | ImageBlock
  | CustomBlock;

export type CanvasContentType = CanvasContentBlock['type'];

export type CanvasBlockBase<Type extends CanvasContentType, Props> = IdentifiedNode<Type> & {
  props: Props;
  locked?: boolean;
};

export interface ButtonBlockProps {
  label: string;
  href?: string;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  color?: string;
  borderRadius?: number;
}

export type ButtonBlock = CanvasBlockBase<'button', ButtonBlockProps>;

export interface TextBlockProps {
  content: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  color?: string;
  lineHeight?: string;
  fontWeight?: 'normal' | 'medium' | 'bold';
}

export type TextBlock = CanvasBlockBase<'text', TextBlockProps>;

export interface HeadingBlockProps {
  content: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  color?: string;
  lineHeight?: string;
  fontWeight?: 'normal' | 'medium' | 'bold';
  margin?: string;
}

export type HeadingBlock = CanvasBlockBase<'heading', HeadingBlockProps>;

export interface ImageBlockProps {
  src: string;
  alt?: string;
  href?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
  borderRadius?: number;
  /** Optional URL used when `src` is empty */
  placeholder?: string;
}

export type ImageBlock = CanvasBlockBase<'image', ImageBlockProps>;

export interface DividerBlockProps {
  color?: string;
  thickness?: number;
  width?: string;
  align?: 'left' | 'center' | 'right';
  margin?: string;
}

export type DividerBlock = CanvasBlockBase<'divider', DividerBlockProps>;

export interface CustomBlockProps {
  componentName: string;
  props: Record<string, unknown>;
}

export type CustomBlock = CanvasBlockBase<'custom', CustomBlockProps>;

export interface BlockDefinition<Block extends CanvasContentBlock> {
  type: Block['type'];
  label: string;
  icon: ComponentType<IconProps>;
  defaults: Block['props'];
}

export interface StructurePaletteItem {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
}

export interface ComponentLibrary {
  blocks: BlockDefinition<CanvasContentBlock>[];
}

export type ReactEmailDndDocument = CanvasDocument;
export type ReactEmailDnd = CanvasDocument;
