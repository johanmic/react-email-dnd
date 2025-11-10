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

  // Extract theme from document first, then merge with options.theme
  // Document theme may contain colors if extended beyond the schema
  let finalTheme: Record<string, string> | undefined = options.theme

  // Check if document has theme data (beyond just fonts)
  if (document.theme && typeof document.theme === "object") {
    const docTheme = document.theme as Record<string, unknown>
    // Extract color-related properties from document theme
    const docThemeColors: Record<string, string> = {}
    Object.keys(docTheme).forEach((key) => {
      // Skip fonts, but include color-scheme and any color keys
      if (key !== "fonts" && typeof docTheme[key] === "string") {
        docThemeColors[key] = docTheme[key] as string
      }
    })

    // Merge document theme with options theme (options takes precedence)
    if (Object.keys(docThemeColors).length > 0) {
      finalTheme = { ...docThemeColors, ...(options.theme ?? {}) }
    }
  }

  // Normalize palette: allow providing colors as strings or {hex,class,label}. We'll expose
  // a simple theme extension map (name->hex) for Tailwind when daisyui is enabled.
  const normalizedPalette = (options.colors ?? [])
    .map((c): { hex: string; label: string } | null => {
      if (typeof c === "string") return { hex: c, label: c }
      if (!c?.hex) return null
      return { hex: c.hex, label: c.label ?? c.tw ?? c.hex }
    })
    .filter(Boolean) as { hex: string; label: string }[]

  // If theme missing but colors provided, create a stable theme extension.
  if (options.daisyui && !finalTheme && normalizedPalette.length > 0) {
    const merged: Record<string, string> = {}
    normalizedPalette.forEach((p, idx) => {
      merged[p.label.replace(/\s+/g, "_").toLowerCase() || `c${idx}`] = p.hex
    })
    finalTheme = merged
  }

  // Update options with final theme for use in renderers
  const optionsWithTheme = { ...options, theme: finalTheme }

  const baseStyles =
    options.daisyui && finalTheme
      ? buildDaisyUIBaseStyles(finalTheme)
      : undefined

  switch (options.format) {
    case "react":
      return {
        format: "react",
        node: renderReact(document, context, optionsWithTheme, baseStyles),
      }
    case "react-text":
      return {
        format: "react-text",
        code: renderReactText(document, context, optionsWithTheme, baseStyles),
      }
    case "html":
      return {
        format: "html",
        html: baseStyles
          ? `<style>${baseStyles}</style>\n${renderHtml(
              document,
              context,
              optionsWithTheme
            )}`
          : renderHtml(document, context, optionsWithTheme),
      }
    case "plain-text":
      return {
        format: "plain-text",
        text: renderPlainText(document, context, optionsWithTheme),
      }
    default: {
      const exhaustive: never = options.format
      throw new Error(`Unsupported render format: ${exhaustive}`)
    }
  }
}

export * from "./types"
export { renderReactText } from "./renderers/react-text"
