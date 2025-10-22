import type { Padding } from "@react-email-dnd/shared"

type PaddingRecord = Record<string, string | number>

const BREAKPOINT_PREFIXES: Record<string, string> = {
  base: "",
  default: "",
  all: "",
  small: "sm",
  sm: "sm",
  mobile: "sm",
  medium: "md",
  md: "md",
  tablet: "md",
  large: "lg",
  lg: "lg",
  desktop: "lg",
  xl: "xl",
  "2xl": "2xl",
}

const ORDER = [
  "base",
  "default",
  "all",
  "mobile",
  "small",
  "sm",
  "tablet",
  "medium",
  "md",
  "desktop",
  "large",
  "lg",
  "xl",
  "2xl",
] as const

function isRecordPadding(value: Padding): value is PaddingRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function trimTrailingZeros(value: number): string {
  if (Number.isInteger(value)) {
    return `${value}`
  }
  return value.toString().replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

function numberToPx(value: number): string {
  const pxValue = value * 4
  if (Number.isInteger(pxValue)) {
    return `${pxValue}px`
  }
  const rounded = parseFloat(pxValue.toFixed(3))
  return `${trimTrailingZeros(rounded)}px`
}

function parseNumericString(value: string): number | undefined {
  const normalized = value.trim()
  if (!normalized) {
    return undefined
  }
  const numeric = Number(normalized)
  if (Number.isNaN(numeric)) {
    return undefined
  }
  return numeric
}

function sanitizeArbitraryValue(value: string): string {
  return value.trim().replace(/\s+/g, "_").replace(/\]/g, "\\]").replace(/\[/g, "\\[")
}

type SpacingShorthand = "p" | "m"

function toTailwindSpacingClass(value: string | number, shorthand: SpacingShorthand) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${shorthand}-${trimTrailingZeros(value)}`
  }

  const trimmed = typeof value === "string" ? value.trim() : ""
  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith("p-") || trimmed.startsWith("m-")) {
    return trimmed
  }

  const numericValue = parseNumericString(trimmed)
  if (numericValue != null) {
    return `${shorthand}-${trimTrailingZeros(numericValue)}`
  }

  return `${shorthand}-[${sanitizeArbitraryValue(trimmed)}]`
}

function normalizeArbitraryToCss(value: string, shorthand: SpacingShorthand): string {
  const arbitraryMatch = value.match(new RegExp(`^${shorthand}-\\[(.*)]$`))
  if (!arbitraryMatch) {
    return value
  }

  return arbitraryMatch[1].replace(/\\\]/g, "]").replace(/\\\[/g, "[").replace(/_/g, " ")
}

function toCssSpacingValue(value: string | number, shorthand: SpacingShorthand): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return numberToPx(value)
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  if (trimmed.startsWith("p-") || trimmed.startsWith("m-")) {
    const numericMatch = trimmed.match(/^[pm]-([0-9]+(?:\.[0-9]+)?)$/)
    if (numericMatch) {
      const num = Number(numericMatch[1])
      if (!Number.isNaN(num)) {
        return numberToPx(num)
      }
    }
    return normalizeArbitraryToCss(trimmed, shorthand)
  }

  const numericValue = parseNumericString(trimmed)
  if (numericValue != null) {
    return numberToPx(numericValue)
  }

  return trimmed
}

function pickBasePaddingValue(padding: PaddingRecord): string | number | undefined {
  for (const key of ORDER) {
    if (key in padding) {
      return padding[key]
    }
  }

  const firstEntry = Object.values(padding)[0]
  return firstEntry
}

function resolveSpacingClasses(value: Padding | undefined, shorthand: SpacingShorthand): string[] {
  if (!value) {
    return []
  }

  if (typeof value === "string") {
    const className = toTailwindSpacingClass(value, shorthand)
    return className ? [className] : []
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return [`${shorthand}-${trimTrailingZeros(value)}`]
  }

  if (!isRecordPadding(value)) {
    return []
  }

  const resolved: string[] = []
  const seen = new Set<string>()

  for (const [key, rawValue] of Object.entries(value)) {
    const className = toTailwindSpacingClass(rawValue, shorthand)
    if (!className) {
      continue
    }

    const prefix = BREAKPOINT_PREFIXES[key] ?? key.replace(/[^a-z0-9:]/gi, "")
    const fullClassName = prefix ? `${prefix}:${className}` : className
    if (seen.has(fullClassName)) {
      continue
    }
    seen.add(fullClassName)
    resolved.push(fullClassName)
  }

  return resolved
}

function resolveSpacingStyle(value: Padding | undefined, shorthand: SpacingShorthand): string | undefined {
  if (!value) {
    return undefined
  }

  if (typeof value === "string") {
    const cssValue = toCssSpacingValue(value, shorthand)
    return cssValue || undefined
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return numberToPx(value)
  }

  if (!isRecordPadding(value)) {
    return undefined
  }

  const baseValue = pickBasePaddingValue(value)
  if (baseValue == null) {
    return undefined
  }

  const cssValue = toCssSpacingValue(baseValue, shorthand)
  return cssValue || undefined
}

export function resolvePaddingClasses(padding: Padding | undefined): string[] {
  return resolveSpacingClasses(padding, "p")
}

export function resolvePaddingStyle(padding: Padding | undefined): string | undefined {
  return resolveSpacingStyle(padding, "p")
}

export function resolveMarginClasses(margin: Padding | undefined): string[] {
  return resolveSpacingClasses(margin, "m")
}

export function resolveMarginStyle(margin: Padding | undefined): string | undefined {
  return resolveSpacingStyle(margin, "m")
}
