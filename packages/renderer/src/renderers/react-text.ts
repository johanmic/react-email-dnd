import {
  type CanvasDocument,
  buildCustomBlockRegistry,
} from "@react-email-dnd/shared"
import { deepSubstitute, substitute } from "../utils"
import type { RenderContext, RendererOptions } from "../types"
import { DAISYUI_COLOR_KEYS } from "../utils/daisyui"

type Line = { depth: number; content: string }

const COMPONENT_IMPORTS = [
  "Html",
  "Head",
  "Preview",
  "Body",
  "Container",
  "Section",
  "Row",
  "Column",
  "Heading",
  "Text",
  "Button",
  "Hr",
  "Img",
  "Tailwind",
  "pixelBasedPreset",
]

function pushLine(lines: Line[], depth: number, content: string) {
  lines.push({ depth, content })
}

function escapeForAttribute(value: string | undefined): string {
  if (!value) return ""
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

function escapeForText(value: string | undefined): string {
  if (!value) return ""
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function buildClassAttr(...values: Array<string | null | undefined>): string {
  const classes = values
    .filter((value) => Boolean(value && value.trim()))
    .join(" ")
  if (!classes) return ""
  return ` className=\"${escapeForAttribute(classes)}\"`
}

export function renderReactText(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions,
  baseStyles?: string
): string {
  const indent = options.indent ?? 2
  const componentName = options.componentName ?? "EmailTemplate"
  const previewText =
    document.meta.description ?? document.meta.title ?? "Preview text"
  const lines: Line[] = []

  const customBlocksRegistry = Array.isArray(options.customBlocks)
    ? buildCustomBlockRegistry(options.customBlocks)
    : options.customBlocks

  // Collect custom component names from the document
  const customComponentNames = new Set<string>()
  document.sections
    .filter((section) => !section.hidden)
    .forEach((section) => {
      section.rows
        .filter((row) => !row.hidden)
        .forEach((row) => {
          row.columns
            .filter((column) => !column.hidden)
            .forEach((column) => {
              column.blocks
                .filter((block) => !block.hidden)
                .forEach((block) => {
                  if (block.type === "custom") {
                    customComponentNames.add(block.props.componentName)
                  }
                })
            })
        })
    })

  // Add react-email imports
  pushLine(
    lines,
    0,
    `import { ${COMPONENT_IMPORTS.join(", ")} } from '@react-email/components';`
  )

  // Add custom component imports if customBlocks registry is provided
  if (customBlocksRegistry && customComponentNames.size > 0) {
    pushLine(lines, 0, "")
    customComponentNames.forEach((componentName) => {
      const def = customBlocksRegistry![componentName]
      if (def) {
        // For react-text, we'll just add a comment since we can't actually import the component
        pushLine(lines, 0, `// Custom component: ${componentName}`)
      }
    })
  }
  pushLine(lines, 0, "")
  pushLine(lines, 0, `export function ${componentName}() {`)
  pushLine(lines, 1, "return (")
  pushLine(lines, 2, "<Html>")
  
  // Build Tailwind config with DaisyUI color mapping
  // Email clients don't support CSS variables, so we use direct hex values
  let tailwindConfigAttr = " config={{presets:[pixelBasedPreset]}}"
  if (options.daisyui && options.theme) {
    const theme = options.theme
    // Map DaisyUI color keys to their actual hex values for Tailwind
    const daisyUIColorMap: Record<string, string> = {}
    Object.keys(theme).forEach((key) => {
      // Skip non-color keys and keys that already start with --
      if (!key.startsWith("--") && key !== "color-scheme") {
        // Map known DaisyUI color keys to their actual hex values
        if (DAISYUI_COLOR_KEYS.has(key)) {
          const colorValue = theme[key]
          if (colorValue && typeof colorValue === "string") {
            daisyUIColorMap[key] = colorValue
          }
        }
      }
    })
    
    if (Object.keys(daisyUIColorMap).length > 0) {
      tailwindConfigAttr = ` config={{presets:[pixelBasedPreset], theme: { extend: { colors: ${JSON.stringify(
        daisyUIColorMap
      )} } } }}`
    }
  }

  pushLine(lines, 3, `<Tailwind${tailwindConfigAttr}>`)
  pushLine(lines, 4, "<Head>")
  if (baseStyles) {
    pushLine(
      lines,
      5,
      `<style type="text/css" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(
        baseStyles
      )} }} />`
    )
  }
  pushLine(lines, 4, "</Head>")
  if (previewText) {
    pushLine(
      lines,
      4,
      `<Preview>${escapeForText(substitute(previewText, context))}</Preview>`
    )
  }
  
  // Add bg-base-100 class to Body when daisyui is enabled
  const bodyClassAttr = options.daisyui
    ? buildClassAttr("bg-base-100", "font-sans", "text-base-content")
    : ""
  const bodyStyleAttr = options.daisyui
    ? ' style={{ margin: 0, padding: 0 }}'
    : ""
  pushLine(lines, 4, `<Body${bodyClassAttr}${bodyStyleAttr}>`)
  
  // Add container classes when daisyui is enabled
  const containerClassAttr = options.daisyui
    ? buildClassAttr("max-w-xl", "mx-auto", "p-4")
    : ""
  const containerStyleAttr = options.daisyui
    ? ' style={{ padding: 0, margin: "0 auto" }}'
    : ""
  pushLine(lines, 5, `<Container${containerClassAttr}${containerStyleAttr}>`)

  document.sections
    .filter((section) => !section.hidden)
    .forEach((section) => {
      const sectionStyle: Record<string, unknown> = {}
      if (section.backgroundColor)
        sectionStyle.backgroundColor = section.backgroundColor
      if (section.padding) sectionStyle.padding = section.padding
      const sectionStyleAttr = Object.keys(sectionStyle).length
        ? ` style={${JSON.stringify(sectionStyle)}}`
        : ""
      const sectionClassAttr = buildClassAttr(
        section.backgroundClassName,
        section.className
      )
      pushLine(lines, 6, `<Section${sectionClassAttr}${sectionStyleAttr}>`)

      section.rows
        .filter((row) => !row.hidden)
        .forEach((row) => {
          const rowStyle: Record<string, unknown> = {}
          if (row.gutter != null) rowStyle.gap = `${row.gutter}px`
          if (row.backgroundColor)
            rowStyle.backgroundColor = row.backgroundColor
          if (row.padding) rowStyle.padding = row.padding
          const rowStyleAttr = Object.keys(rowStyle).length
            ? ` style={${JSON.stringify(rowStyle)}}`
            : ""
          const rowClassAttr = buildClassAttr(
            row.backgroundClassName,
            row.className
          )
          pushLine(lines, 7, `<Row${rowClassAttr}${rowStyleAttr}>`)

          row.columns
            .filter((column) => !column.hidden)
            .forEach((column) => {
              const colStyle: Record<string, unknown> = {}
              if (column.backgroundColor)
                colStyle.backgroundColor = column.backgroundColor
              if (column.padding) colStyle.padding = column.padding
              if (column.width != null) colStyle.width = column.width
              const colStyleAttr = Object.keys(colStyle).length
                ? ` style={${JSON.stringify(colStyle)}}`
                : ""
              const colClassAttr = buildClassAttr(
                column.backgroundClassName,
                column.className
              )
              pushLine(lines, 8, `<Column${colClassAttr}${colStyleAttr}>`)

              column.blocks
                .filter((block) => !block.hidden)
                .forEach((block) => {
                  switch (block.type) {
                    case "heading": {
                      const tag = block.props.as ?? "h2"
                      const content = escapeForText(
                        substitute(block.props.content, context)
                      )
                      const style: Record<string, unknown> = {}
                      if (block.props.align) style.textAlign = block.props.align
                      if (block.props.fontSize != null)
                        style.fontSize = block.props.fontSize
                      const headingColor =
                        block.props.color ??
                        (block.props.colorClassName ? undefined : "#111827")
                      if (headingColor) style.color = headingColor
                      if (block.props.lineHeight)
                        style.lineHeight = block.props.lineHeight
                      if (block.props.fontWeight)
                        style.fontWeight = block.props.fontWeight
                      if (block.props.margin) style.margin = block.props.margin
                      if (block.props.padding)
                        style.padding = block.props.padding
                      const styleAttr = Object.keys(style).length
                        ? ` style={${JSON.stringify(style)}}`
                        : ""
                      const classAttr = buildClassAttr(
                        block.props.colorClassName,
                        block.props.className
                      )
                      pushLine(
                        lines,
                        9,
                        `<Heading as="${tag}"${classAttr}${styleAttr}>${content}</Heading>`
                      )
                      break
                    }
                    case "text": {
                      const content = escapeForText(
                        substitute(block.props.content, context)
                      )
                      const style: Record<string, unknown> = {}
                      if (block.props.align) style.textAlign = block.props.align
                      if (block.props.fontSize != null)
                        style.fontSize = block.props.fontSize
                      const textColor =
                        block.props.color ??
                        (block.props.colorClassName ? undefined : "#1f2937")
                      if (textColor) style.color = textColor
                      if (block.props.lineHeight)
                        style.lineHeight = block.props.lineHeight
                      if (block.props.fontWeight)
                        style.fontWeight = block.props.fontWeight
                      if (block.props.margin) style.margin = block.props.margin
                      if (block.props.padding)
                        style.padding = block.props.padding
                      const styleAttr = Object.keys(style).length
                        ? ` style={${JSON.stringify(style)}}`
                        : ""
                      const classAttr = buildClassAttr(
                        block.props.colorClassName,
                        block.props.className
                      )
                      pushLine(
                        lines,
                        9,
                        `<Text${classAttr}${styleAttr}>${content}</Text>`
                      )
                      break
                    }
                    case "button": {
                      const label = escapeForText(
                        substitute(block.props.label, context) ??
                          block.props.label
                      )
                      const href = escapeForAttribute(
                        substitute(block.props.href, context) ??
                          block.props.href
                      )
                      const style: Record<string, unknown> = {}
                      style.display = "inline-block"
                      style.textDecoration = "none"
                      const backgroundColor =
                        block.props.backgroundColor ??
                        (block.props.backgroundClassName
                          ? undefined
                          : "#2563eb")
                      if (backgroundColor)
                        style.backgroundColor = backgroundColor
                      const buttonColor =
                        block.props.color ??
                        (block.props.colorClassName ? undefined : "#ffffff")
                      if (buttonColor) style.color = buttonColor
                      if (block.props.borderRadius != null)
                        style.borderRadius = block.props.borderRadius
                      if (block.props.align) style.textAlign = block.props.align
                      if (block.props.padding)
                        style.padding = block.props.padding
                      if (block.props.fontSize != null)
                        style.fontSize = block.props.fontSize
                      if (block.props.fontWeight)
                        style.fontWeight = block.props.fontWeight
                      if (block.props.margin) style.margin = block.props.margin
                      const styleAttr = Object.keys(style).length
                        ? ` style={${JSON.stringify(style)}}`
                        : ""
                      const classAttr = buildClassAttr(
                        block.props.backgroundClassName,
                        block.props.colorClassName,
                        block.props.className
                      )
                      pushLine(
                        lines,
                        9,
                        `<Button href="${href || "#"}"${classAttr}${styleAttr}>${label}</Button>`
                      )
                      break
                    }
                    case "image": {
                      const src = escapeForAttribute(
                        substitute(block.props.src, context) ?? block.props.src
                      )
                      const alt = escapeForAttribute(
                        substitute(block.props.alt, context)
                      )
                      const widthAttr =
                        block.props.width != null
                          ? ` width={${JSON.stringify(block.props.width)}}`
                          : ""
                      const heightAttr =
                        block.props.height != null
                          ? ` height={${JSON.stringify(block.props.height)}}`
                          : ""
                      const style: Record<string, unknown> = {}
                      if (block.props.borderRadius != null)
                        style.borderRadius = block.props.borderRadius
                      if (block.props.margin) style.margin = block.props.margin
                      if (block.props.padding)
                        style.padding = block.props.padding
                      const styleAttr = Object.keys(style).length
                        ? ` style={${JSON.stringify(style)}}`
                        : ""
                      const classAttr = buildClassAttr(block.props.className)
                      pushLine(
                        lines,
                        9,
                        `<Img src="${src}" alt="${alt}"${widthAttr}${heightAttr}${classAttr}${styleAttr} />`
                      )
                      break
                    }
                    case "divider": {
                      const style: Record<string, unknown> = {}
                      if (block.props.margin) style.margin = block.props.margin
                      if (block.props.thickness != null)
                        style.borderWidth = block.props.thickness
                      const dividerColor =
                        block.props.color ??
                        (block.props.colorClassName ? undefined : "#e5e7eb")
                      if (dividerColor) style.borderColor = dividerColor
                      if (block.props.width) style.width = block.props.width
                      const styleAttr = Object.keys(style).length
                        ? ` style={${JSON.stringify(style)}}`
                        : ""
                      const classAttr = buildClassAttr(
                        block.props.colorClassName,
                        block.props.className
                      )
                      pushLine(lines, 9, `<Hr${classAttr}${styleAttr} />`)
                      break
                    }
                    case "custom": {
                      const propsObj = deepSubstitute(
                        block.props.props,
                        context
                      )
                      const componentName = block.props.componentName

                      // Check if we have the custom component in the registry
                      if (
                        customBlocksRegistry &&
                        customBlocksRegistry[componentName]
                      ) {
                        const def = customBlocksRegistry[componentName]
                        // For react-text output, we'll render a placeholder with the component name and props
                        pushLine(
                          lines,
                          9,
                          `{/* Custom component: ${componentName} */}`
                        )
                        pushLine(
                          lines,
                          9,
                          `<div data-custom-block="${componentName}">`
                        )
                        pushLine(
                          lines,
                          10,
                          `{/* Props: ${escapeForText(JSON.stringify(propsObj))} */}`
                        )
                        pushLine(lines, 9, "</div>")
                      } else {
                        if (context.throwOnMissingCustomBlocks) {
                          throw new Error(
                            `Custom block "${componentName}" not found in registry`
                          )
                        }
                        // Fallback when no customBlocks registry is provided
                        pushLine(
                          lines,
                          9,
                          `{/* Custom block: ${componentName} */}`
                        )
                        pushLine(
                          lines,
                          9,
                          `{/* Props: ${escapeForText(JSON.stringify(propsObj))} */}`
                        )
                      }
                      break
                    }
                    default:
                      break
                  }
                })

              pushLine(lines, 8, "</Column>")
            })

          pushLine(lines, 7, "</Row>")
        })

      pushLine(lines, 6, "</Section>")
    })

  pushLine(lines, 5, "</Container>")
  pushLine(lines, 4, "</Body>")
  pushLine(lines, 3, "</Tailwind>")
  pushLine(lines, 2, "</Html>")
  pushLine(lines, 1, ");")
  pushLine(lines, 0, "}")

  return lines
    .map(({ depth, content }) => {
      if (content === "") return ""
      return `${" ".repeat(depth * indent)}${content}`
    })
    .join("\n")
}
