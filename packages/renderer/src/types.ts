import type { ReactElement } from "react"
import type {
  CanvasDocument,
  CustomBlockRegistry,
} from "@react-email-dnd/shared"

export type ColorOption =
  | string
  | {
      hex: string
      class?: string
      label?: string
    }

export type RendererFormat = "react" | "react-text" | "html" | "plain-text"

export interface RendererOptions {
  /** Determines the output format. */
  format: RendererFormat
  /** Optional variables used when substituting placeholders like {{first_name}}. */
  variables?: Record<string, string>
  /** Optional indentation width for string outputs (HTML, react-text, plain-text). */
  indent?: number
  /** Optional component name used for react-text output (defaults to EmailTemplate). */
  componentName?: string
  /** Optional registry of custom blocks for React rendering. */
  customBlocks?: CustomBlockRegistry
  /** When true, enable Tailwind config injection for daisyUI theming. */
  daisyui?: boolean
  /** Optional theme colors to inject into Tailwind config when daisyui is enabled. */
  theme?: Record<string, string>
  /** Optional high-level color palette (hex/class/label) used to extend Tailwind theme colors. */
  colors?: ColorOption[]
}

export interface RenderRequest {
  document: CanvasDocument
  options: RendererOptions
}

export type RenderResult =
  | { format: "react"; node: ReactElement }
  | { format: "react-text"; code: string }
  | { format: "html"; html: string }
  | { format: "plain-text"; text: string }

export interface RenderContext {
  variables?: Record<string, string>
}

export type RenderFunction<Format extends RendererFormat, Result> = (
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions
) => Result
