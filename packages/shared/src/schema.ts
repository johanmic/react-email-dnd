import type { ComponentType } from "react"
import type { IconProps } from "@phosphor-icons/react"
import { z, type ZodError } from "zod"

const alignmentSchema = z.enum(["left", "center", "right", "justify"])
const fontWeightSchema = z.enum([
  "light",
  "normal",
  "medium",
  "bold",
  "extrabold",
])
export const paddingValueSchema = z.union([z.string(), z.number()])
export const responsivePaddingSchema = z.record(z.string(), paddingValueSchema)
export const paddingSchema = z.union([
  z.string(),
  z.number(),
  responsivePaddingSchema,
])
export type Padding = z.infer<typeof paddingSchema>

export interface PaddingOptionEntry {
  id: string
  label: string
  value: Padding
}

export const colorOptionSchema = z.union([
  z.string(),
  z.object({
    hex: z.string().optional(),
    class: z.string().optional(),
    tw: z.string().optional(),
    labelClass: z.string().optional(),
    label: z.string().optional(),
  }),
])
export const buttonBlockPropsSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
  align: alignmentSchema.optional(),
  backgroundColor: z.string().optional(),
  backgroundClassName: z.string().optional(),
  color: z.string().optional(),
  colorClassName: z.string().optional(),
  borderRadius: z.number().optional(),
  padding: paddingSchema.optional(),
  fontSize: z.number().optional(),
  fontWeight: fontWeightSchema.optional(),
  margin: z.string().optional(),
  className: z.string().optional(),
})
export type ButtonBlockProps = z.infer<typeof buttonBlockPropsSchema>

export const textBlockPropsSchema = z.object({
  content: z.string(),
  align: alignmentSchema.optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  colorClassName: z.string().optional(),
  lineHeight: z.string().optional(),
  fontWeight: fontWeightSchema.optional(),
  margin: z.string().optional(),
  padding: paddingSchema.optional(),
  className: z.string().optional(),
})
export type TextBlockProps = z.infer<typeof textBlockPropsSchema>
export type ColorOption = z.infer<typeof colorOptionSchema>

export const headingBlockPropsSchema = z.object({
  content: z.string(),
  as: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).optional(),
  align: alignmentSchema.optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  colorClassName: z.string().optional(),
  lineHeight: z.string().optional(),
  fontWeight: fontWeightSchema.optional(),
  margin: z.string().optional(),
  padding: paddingSchema.optional(),
  className: z.string().optional(),
})
export type HeadingBlockProps = z.infer<typeof headingBlockPropsSchema>

export const imageBlockPropsSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  href: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  align: alignmentSchema.optional(),
  borderRadius: z.number().optional(),
  placeholder: z.string().optional(),
  margin: z.string().optional(),
  padding: paddingSchema.optional(),
  className: z.string().optional(),
})
export type ImageBlockProps = z.infer<typeof imageBlockPropsSchema>

export const dividerBlockPropsSchema = z.object({
  color: z.string().optional(),
  colorClassName: z.string().optional(),
  thickness: z.number().optional(),
  width: z.string().optional(),
  align: alignmentSchema.optional(),
  margin: z.string().optional(),
  padding: paddingSchema.optional(),
  className: z.string().optional(),
})
export type DividerBlockProps = z.infer<typeof dividerBlockPropsSchema>

export const customBlockPropsSchema = z.object({
  componentName: z.string(),
  props: z.record(z.string(), z.unknown()),
})
export type CustomBlockProps = z.infer<typeof customBlockPropsSchema>

const blockBaseSchema = z.object({
  id: z.string(),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
})

export const buttonBlockSchema = blockBaseSchema.extend({
  type: z.literal("button"),
  props: buttonBlockPropsSchema,
})
export type ButtonBlock = z.infer<typeof buttonBlockSchema>

export const textBlockSchema = blockBaseSchema.extend({
  type: z.literal("text"),
  props: textBlockPropsSchema,
})
export type TextBlock = z.infer<typeof textBlockSchema>

export const headingBlockSchema = blockBaseSchema.extend({
  type: z.literal("heading"),
  props: headingBlockPropsSchema,
})
export type HeadingBlock = z.infer<typeof headingBlockSchema>

export const imageBlockSchema = blockBaseSchema.extend({
  type: z.literal("image"),
  props: imageBlockPropsSchema,
})
export type ImageBlock = z.infer<typeof imageBlockSchema>

export const dividerBlockSchema = blockBaseSchema.extend({
  type: z.literal("divider"),
  props: dividerBlockPropsSchema,
})
export type DividerBlock = z.infer<typeof dividerBlockSchema>

export const customBlockSchema = blockBaseSchema.extend({
  type: z.literal("custom"),
  props: customBlockPropsSchema,
})
export type CustomBlock = z.infer<typeof customBlockSchema>

export const canvasContentBlockSchema = z.discriminatedUnion("type", [
  buttonBlockSchema,
  textBlockSchema,
  headingBlockSchema,
  dividerBlockSchema,
  imageBlockSchema,
  customBlockSchema,
])
export type CanvasContentBlock = z.infer<typeof canvasContentBlockSchema>
export type CanvasContentType = CanvasContentBlock["type"]

export const canvasColumnSchema = blockBaseSchema.extend({
  type: z.literal("column"),
  width: z.number().optional(),
  backgroundColor: z.string().optional(),
  backgroundClassName: z.string().optional(),
  padding: paddingSchema.optional(),
  margin: paddingSchema.optional(),
  align: alignmentSchema.optional(),
  className: z.string().optional(),
  blocks: z.array(canvasContentBlockSchema),
})
export type CanvasColumn = z.infer<typeof canvasColumnSchema>

export const canvasRowSchema = blockBaseSchema.extend({
  type: z.literal("row"),
  columns: z.array(canvasColumnSchema),
  gutter: z.number().optional(),
  backgroundColor: z.string().optional(),
  backgroundClassName: z.string().optional(),
  padding: paddingSchema.optional(),
  margin: paddingSchema.optional(),
  align: alignmentSchema.optional(),
  className: z.string().optional(),
})
export type CanvasRow = z.infer<typeof canvasRowSchema>

export const canvasSectionSchema = blockBaseSchema.extend({
  type: z.literal("section"),
  rows: z.array(canvasRowSchema),
  backgroundColor: z.string().optional(),
  backgroundClassName: z.string().optional(),
  padding: paddingSchema.optional(),
  margin: paddingSchema.optional(),
  align: alignmentSchema.optional(),
  className: z.string().optional(),
})
export type CanvasSection = z.infer<typeof canvasSectionSchema>

export const documentMetaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
export type DocumentMeta = z.infer<typeof documentMetaSchema>

export const canvasDocumentSchema = z.object({
  version: z.number(),
  meta: documentMetaSchema,
  variables: z.record(z.string(), z.string()).optional(),
  sections: z.array(canvasSectionSchema),
})
export type CanvasDocument = z.infer<typeof canvasDocumentSchema>

export type ReactEmailDndDocument = CanvasDocument
export type ReactEmailDnd = CanvasDocument

export interface IdentifiedNode<Type extends string> {
  id: string
  type: Type
}

export type CanvasBlockBase<
  Type extends CanvasContentType,
  Props,
> = IdentifiedNode<Type> & {
  props: Props
  locked?: boolean
  hidden?: boolean
}

export interface BlockDefinition<Block extends CanvasContentBlock> {
  /**
   * Optional identifier used to differentiate palette entries with the same
   * block type. When omitted, the editor will fall back to the block type or
   * component name (for custom blocks) when generating sidebar IDs.
   */
  id?: string
  type: Block["type"]
  label: string
  icon: ComponentType<IconProps>
  defaults: Block["props"]
}

export interface CustomBlockDefinition<
  ComponentProps extends Record<string, unknown> = Record<string, unknown>,
> extends BlockDefinition<CustomBlock> {
  type: "custom"
  defaults: {
    componentName: string
    props: ComponentProps
  }
  /**
   * React component from `react-email` (or compatible) used to render the
   * custom block. Async components are not supported.
   */
  component: ComponentType<ComponentProps>
  /**
   * Optional prop editor component for editing the block's properties in the editor.
   * If not provided, the block will be read-only in the editor.
   */
  propEditor?: ComponentType<CustomBlockPropEditorProps<ComponentProps>>
}

export interface CustomBlockPropEditorProps<
  Props extends Record<string, unknown> = Record<string, unknown>,
> {
  value: Props
  block: CanvasContentBlock & { type: "custom" }
  onChange: (patch: Partial<Props>) => void
  onReplace: (value: Props) => void
  daisyui?: boolean
  colors?: ColorOption[]
  textColors?: ColorOption[]
  bgColors?: ColorOption[]
  disabled?: boolean
  paddingOptions?: PaddingOptionEntry[]
}

export type CustomBlockPropEditor<
  Props extends Record<string, unknown> = Record<string, unknown>,
> = ComponentType<CustomBlockPropEditorProps<Props>>

export type CustomBlockRegistry = Record<string, CustomBlockDefinition<any>>

export interface StructurePaletteItem {
  id: string
  label: string
  icon: ComponentType<IconProps>
}

export interface ComponentLibrary {
  blocks: BlockDefinition<CanvasContentBlock>[]
}

export type CanvasDocumentValidationResult =
  | { success: true; data: CanvasDocument }
  | { success: false; error: ZodError<CanvasDocument> }

export function parseCanvasDocument(input: unknown): CanvasDocument {
  return canvasDocumentSchema.parse(input)
}

export function safeParseCanvasDocument(input: unknown) {
  return canvasDocumentSchema.safeParse(input)
}

export function validateCanvasDocument(
  input: unknown
): CanvasDocumentValidationResult {
  const result = canvasDocumentSchema.safeParse(input)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

export function isCanvasDocument(input: unknown): input is CanvasDocument {
  return canvasDocumentSchema.safeParse(input).success
}
