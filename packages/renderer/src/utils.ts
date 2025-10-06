import type { CanvasContentBlock } from "@react-email-dnd/shared"
import type { RenderContext } from "./types"

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g

export function substitute(
  value: string | undefined,
  context: RenderContext
): string | undefined {
  if (!value) return value
  if (!context.variables) return value

  return value.replace(PLACEHOLDER_PATTERN, (_, key: string) => {
    if (!context.variables) return `{{${key}}}`
    return Object.prototype.hasOwnProperty.call(context.variables, key)
      ? (context.variables[key] ?? "")
      : `{{${key}}}`
  })
}

export function deepSubstitute<T>(value: T, context: RenderContext): T {
  if (value == null) return value
  if (typeof value === "string")
    return substitute(value, context) as unknown as T
  if (Array.isArray(value))
    return value.map((v) => deepSubstitute(v, context)) as unknown as T
  if (typeof value === "object") {
    const input = value as Record<string, unknown>
    const output: Record<string, unknown> = {}
    for (const key of Object.keys(input)) {
      output[key] = deepSubstitute(input[key] as unknown, context) as unknown
    }
    return output as T
  }
  return value
}

export function describeBlock(
  block: CanvasContentBlock,
  context: RenderContext
): string {
  switch (block.type) {
    case "text":
      return substitute(block.props.content, context) ?? ""
    case "heading":
      return substitute(block.props.content, context) ?? ""
    case "button":
      return `${substitute(block.props.label, context) ?? block.props.label} (${
        substitute(block.props.href, context) ?? block.props.href ?? "#"
      })`
    case "image":
      return (
        substitute(block.props.alt, context) ??
        substitute(block.props.src, context) ??
        block.props.src
      )
    case "divider":
      return "——"
    case "custom":
      return block.props.componentName
    default:
      const exhaustive: never = block
      throw new Error(`Unsupported block type: ${String(exhaustive)}`)
  }
}

export function indentLines(lines: string[], indentSize: number): string {
  const pad = " ".repeat(indentSize)
  return lines.map((line) => (line.length ? `${pad}${line}` : line)).join("\n")
}
