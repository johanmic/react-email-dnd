import type {
  RenderRequest,
  RenderResult,
  RendererOptions,
  ColorOption,
} from "./types"
import { renderHtml } from "./renderers/html"
import { renderPlainText } from "./renderers/plain-text"
import { renderReact } from "./renderers/react"
import { renderReactText } from "./renderers/react-text"
import type { RenderContext } from "./types"
import { buildDaisyUIBaseStyles } from "./utils/daisyui"

function createContext(options: RendererOptions): RenderContext {
  return {
    variables: options.variables,
  }
}

export function renderDocument({
  document,
  options,
}: RenderRequest): RenderResult {
  const context = createContext(options)

  // Normalize palette: allow providing colors as strings or {hex,class,label}. We'll expose
  // a simple theme extension map (name->hex) for Tailwind when daisyui is enabled.
  const normalizedPalette = (options.colors ?? [])
    .map((c): { hex: string; label: string } | null => {
      if (typeof c === "string") return { hex: c, label: c }
      if (!c?.hex) return null
      return { hex: c.hex, label: c.label ?? c.tw ?? c.hex }
    })
    .filter(Boolean) as { hex: string; label: string }[]

  // If theme misssing but colors provided, create a stable theme extension.
  if (options.daisyui && !options.theme && normalizedPalette.length > 0) {
    const merged: Record<string, string> = {}
    normalizedPalette.forEach((p, idx) => {
      merged[p.label.replace(/\s+/g, "_").toLowerCase() || `c${idx}`] = p.hex
    })
    // eslint-disable-next-line no-param-reassign
    options.theme = merged
  }

  const baseStyles =
    options.daisyui && options.theme
      ? buildDaisyUIBaseStyles(options.theme)
      : undefined

  switch (options.format) {
    case "react":
      return {
        format: "react",
        node: renderReact(document, context, options, baseStyles),
      }
    case "react-text":
      return {
        format: "react-text",
        code: renderReactText(document, context, options, baseStyles),
      }
    case "html":
      return {
        format: "html",
        html: baseStyles
          ? `<style>${baseStyles}</style>\n${renderHtml(
              document,
              context,
              options
            )}`
          : renderHtml(document, context, options),
      }
    case "plain-text":
      return {
        format: "plain-text",
        text: renderPlainText(document, context, options),
      }
    default: {
      const exhaustive: never = options.format
      throw new Error(`Unsupported render format: ${exhaustive}`)
    }
  }
}

export * from "./types"
export { renderReactText } from "./renderers/react-text"
