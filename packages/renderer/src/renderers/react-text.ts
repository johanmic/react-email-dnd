import type { CanvasDocument } from "@react-email-dnd/shared"
import { deepSubstitute, substitute } from "../utils"
import type { RenderContext, RendererOptions } from "../types"

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

export function renderReactText(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions
): string {
  const indent = options.indent ?? 2
  const componentName = options.componentName ?? "EmailTemplate"
  const previewText =
    document.meta.description ?? document.meta.title ?? "Preview text"
  const lines: Line[] = []

  pushLine(
    lines,
    0,
    `import { ${COMPONENT_IMPORTS.join(", ")} } from '@react-email/components';`
  )
  pushLine(lines, 0, "")
  pushLine(lines, 0, `export function ${componentName}() {`)
  pushLine(lines, 1, "return (")
  pushLine(lines, 2, "<Html>")
  pushLine(lines, 3, "<Head />")
  pushLine(
    lines,
    3,
    `<Preview>${escapeForText(substitute(previewText, context))}</Preview>`
  )
  pushLine(lines, 3, "<Body>")
  pushLine(lines, 4, "<Container>")

  document.sections.forEach((section) => {
    const sectionStyle: Record<string, unknown> = {}
    if (section.backgroundColor)
      sectionStyle.backgroundColor = section.backgroundColor
    if (section.padding) sectionStyle.padding = section.padding
    const sectionStyleAttr = Object.keys(sectionStyle).length
      ? ` style={${JSON.stringify(sectionStyle)}}`
      : ""
    const sectionClassAttr = section.className
      ? ` className=\"${section.className}\"`
      : ""
    pushLine(lines, 5, `<Section${sectionClassAttr}${sectionStyleAttr}>`)

    section.rows.forEach((row) => {
      const rowStyle: Record<string, unknown> = {}
      if (row.gutter != null) rowStyle.gap = row.gutter
      if (row.backgroundColor) rowStyle.backgroundColor = row.backgroundColor
      if (row.padding) rowStyle.padding = row.padding
      const rowStyleAttr = Object.keys(rowStyle).length
        ? ` style={${JSON.stringify(rowStyle)}}`
        : ""
      const rowClassAttr = row.className
        ? ` className=\"${row.className}\"`
        : ""
      pushLine(lines, 6, `<Row${rowClassAttr}${rowStyleAttr}>`)

      row.columns.forEach((column) => {
        const width =
          column.width != null ? ` width={${JSON.stringify(column.width)}}` : ""
        const colStyle: Record<string, unknown> = {}
        if (column.backgroundColor)
          colStyle.backgroundColor = column.backgroundColor
        if (column.padding) colStyle.padding = column.padding
        const colStyleAttr = Object.keys(colStyle).length
          ? ` style={${JSON.stringify(colStyle)}}`
          : ""
        const colClassAttr = column.className
          ? ` className=\"${column.className}\"`
          : ""
        pushLine(lines, 7, `<Column${width}${colClassAttr}${colStyleAttr}>`)

        column.blocks.forEach((block) => {
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
              if (block.props.color) style.color = block.props.color
              if (block.props.lineHeight)
                style.lineHeight = block.props.lineHeight
              if (block.props.fontWeight)
                style.fontWeight = block.props.fontWeight
              if (block.props.margin) style.margin = block.props.margin
              const styleAttr = Object.keys(style).length
                ? ` style={${JSON.stringify(style)}}`
                : ""
              pushLine(
                lines,
                8,
                `<Heading as="${tag}"${styleAttr}>${content}</Heading>`
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
              if (block.props.color) style.color = block.props.color
              if (block.props.lineHeight)
                style.lineHeight = block.props.lineHeight
              if (block.props.fontWeight)
                style.fontWeight = block.props.fontWeight
              const styleAttr = Object.keys(style).length
                ? ` style={${JSON.stringify(style)}}`
                : ""
              pushLine(lines, 8, `<Text${styleAttr}>${content}</Text>`)
              break
            }
            case "button": {
              const label = escapeForText(
                substitute(block.props.label, context) ?? block.props.label
              )
              const href = escapeForAttribute(
                substitute(block.props.href, context) ?? block.props.href
              )
              const style: Record<string, unknown> = {}
              if (block.props.backgroundColor)
                style.backgroundColor = block.props.backgroundColor
              if (block.props.color) style.color = block.props.color
              if (block.props.borderRadius != null)
                style.borderRadius = block.props.borderRadius
              if (block.props.align) style.textAlign = block.props.align
              const styleAttr = Object.keys(style).length
                ? ` style={${JSON.stringify(style)}}`
                : ""
              pushLine(
                lines,
                8,
                `<Button href="${href || "#"}"${styleAttr}>${label}</Button>`
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
              const styleAttr = Object.keys(style).length
                ? ` style={${JSON.stringify(style)}}`
                : ""
              pushLine(
                lines,
                8,
                `<Img src="${src}" alt="${alt}"${widthAttr}${heightAttr}${styleAttr} />`
              )
              break
            }
            case "divider": {
              const style: Record<string, unknown> = {}
              if (block.props.margin) style.margin = block.props.margin
              if (block.props.thickness != null)
                style.borderWidth = block.props.thickness
              if (block.props.color) style.borderColor = block.props.color
              if (block.props.width) style.width = block.props.width
              const styleAttr = Object.keys(style).length
                ? ` style={${JSON.stringify(style)}}`
                : ""
              pushLine(lines, 8, `<Hr${styleAttr} />`)
              break
            }
            case "custom": {
              const propsObj = deepSubstitute(block.props.props, context)
              pushLine(
                lines,
                8,
                `{/* Custom block: ${block.props.componentName} */}`
              )
              pushLine(
                lines,
                8,
                `{/* Props: ${escapeForText(JSON.stringify(propsObj))} */}`
              )
              break
            }
            default:
              break
          }
        })

        pushLine(lines, 7, "</Column>")
      })

      pushLine(lines, 6, "</Row>")
    })

    pushLine(lines, 5, "</Section>")
  })

  pushLine(lines, 4, "</Container>")
  pushLine(lines, 3, "</Body>")
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
