import type { CanvasContentBlock } from "@react-email-dnd/shared"
import type { RenderContext } from "./types"

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g

/**
 * Get a nested value from an object using dot notation path
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined
  
  const parts = path.split(".")
  let current: unknown = obj
  
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined
    if (Array.isArray(current)) {
      const index = Number.parseInt(part, 10)
      if (Number.isNaN(index)) return undefined
      current = current[index]
    } else {
      current = (current as Record<string, unknown>)[part]
    }
  }
  
  return current
}

/**
 * Convert a value to a string representation
 */
function valueToString(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map(valueToString).join(", ")
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function substitute(
  value: string | undefined,
  context: RenderContext
): string | undefined {
  if (!value) return value
  if (!context.variables) return value

  return value.replace(PLACEHOLDER_PATTERN, (_, key: string) => {
    if (!context.variables) return `{{${key}}}`
    
    // Support nested paths like "club.name" or "event.title"
    const nestedValue = getNestedValue(context.variables, key)
    
    if (nestedValue !== undefined) {
      return valueToString(nestedValue)
    }
    
    // Fallback to direct key access for backward compatibility
    if (Object.prototype.hasOwnProperty.call(context.variables, key)) {
      return valueToString(context.variables[key])
    }
    
    return `{{${key}}}`
  })
}

export function substituteObject(
  value: unknown,
  context: RenderContext
): unknown {
  if (!value || !context.variables) return value
  
  // Handle special case where the entire value is a variable placeholder
  if (typeof value === "string" && value.match(/^\{\{([a-zA-Z0-9_.-]+)\}\}$/)) {
    const key = value.slice(2, -2).trim()
    
    // Support nested paths like "club.name" or "event.title"
    const nestedValue = getNestedValue(context.variables, key)
    
    if (nestedValue !== undefined) {
      return nestedValue // Return the actual object, not a string
    }
    
    // Fallback to direct key access for backward compatibility
    if (Object.prototype.hasOwnProperty.call(context.variables, key)) {
      return context.variables[key] // Return the actual object, not a string
    }
  }
  
  return value
}

export function deepSubstitute<T>(value: T, context: RenderContext): T {
  if (value == null) return value
  if (typeof value === "string") {
    // First try object substitution for full variable placeholders
    const objectResult = substituteObject(value, context)
    if (objectResult !== value) {
      return objectResult as unknown as T
    }
    // Fall back to string substitution
    return substitute(value, context) as unknown as T
  }
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
    case "custom": {
      const componentName = block.props.componentName
      const props = deepSubstitute(block.props.props, context)

      // Try to extract meaningful text from common prop names
      const textProps = [
        "title",
        "content",
        "text",
        "label",
        "description",
        "message",
      ]
      let description = componentName

      for (const propName of textProps) {
        if (props && typeof props === "object" && propName in props) {
          const propValue = (props as any)[propName]
          if (typeof propValue === "string" && propValue.trim()) {
            description = `${componentName}: ${propValue}`
            break
          }
        }
      }

      return description
    }
    default:
      const exhaustive: never = block
      throw new Error(`Unsupported block type: ${String(exhaustive)}`)
  }
}

export function indentLines(lines: string[], indentSize: number): string {
  const pad = " ".repeat(indentSize)
  return lines.map((line) => (line.length ? `${pad}${line}` : line)).join("\n")
}
