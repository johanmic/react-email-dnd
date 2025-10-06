import type { ReactElement } from "react"
import type {
  CanvasDocument,
  CustomBlockRegistry,
} from "@react-email-dnd/shared"

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
