const DAISYUI_COLOR_KEYS = new Set([
  "base-100",
  "base-200",
  "base-300",
  "base-content",
  "primary",
  "primary-content",
  "secondary",
  "secondary-content",
  "accent",
  "accent-content",
  "neutral",
  "neutral-content",
  "info",
  "info-content",
  "success",
  "success-content",
  "warning",
  "warning-content",
  "error",
  "error-content",
])

const NON_COLOR_TOKEN_PREFIXES = [
  "radius-",
  "size-",
  "shadow",
  "border",
  "depth",
  "noise",
]

const ROOT_SELECTOR = ":root"

/**
 * Convert a daisyUI theme object into CSS custom properties so classes like
 * `bg-base-100` resolve to their themed values when rendered outside of Tailwind.
 */
export function buildDaisyUIBaseStyles(
  theme?: Record<string, string>
): string | undefined {
  if (!theme) return undefined

  const declarations: string[] = []

  const colorScheme = theme["color-scheme"]
  if (typeof colorScheme === "string" && colorScheme.trim().length > 0) {
    declarations.push(`  color-scheme: ${colorScheme};`)
  }

  Object.entries(theme).forEach(([key, value]) => {
    if (!value || typeof value !== "string") return
    if (key === "color-scheme") return

    let cssVariableName: string | undefined

    if (key.startsWith("--")) {
      cssVariableName = key
    } else if (DAISYUI_COLOR_KEYS.has(key)) {
      cssVariableName = `--color-${key}`
    } else if (
      NON_COLOR_TOKEN_PREFIXES.some((prefix) => key === prefix || key.startsWith(prefix))
    ) {
      cssVariableName = `--${key}`
    }

    if (cssVariableName) {
      declarations.push(`  ${cssVariableName}: ${value};`)
    }
  })

  if (declarations.length === 0) return undefined

  return `${ROOT_SELECTOR} {\n${declarations.join("\n")}\n}`
}
