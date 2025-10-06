import type {
  CanvasContentBlock,
  CanvasDocument,
} from "@react-email-dnd/shared"
import { deepSubstitute, substitute } from "../utils"
import type { RenderContext, RendererOptions } from "../types"

function renderBlock(
  block: CanvasContentBlock,
  context: RenderContext
): string {
  switch (block.type) {
    case "heading":
      return `<h${block.props.as?.slice(1) ?? 2} style="${[
        block.props.align ? `text-align:${block.props.align}` : "",
        block.props.fontSize != null
          ? `font-size:${block.props.fontSize}px`
          : "",
        block.props.color ? `color:${block.props.color}` : "",
        block.props.lineHeight ? `line-height:${block.props.lineHeight}` : "",
        block.props.fontWeight ? `font-weight:${block.props.fontWeight}` : "",
        block.props.margin ? `margin:${block.props.margin}` : "",
      ]
        .filter(Boolean)
        .join(";")}">${substitute(block.props.content, context) ?? ""}</h${
        block.props.as?.slice(1) ?? 2
      }>`
    case "text":
      return `<p style="${[
        block.props.align ? `text-align:${block.props.align}` : "",
        block.props.fontSize != null
          ? `font-size:${block.props.fontSize}px`
          : "",
        block.props.color ? `color:${block.props.color}` : "",
        block.props.lineHeight ? `line-height:${block.props.lineHeight}` : "",
        block.props.fontWeight ? `font-weight:${block.props.fontWeight}` : "",
      ]
        .filter(Boolean)
        .join(";")}">${substitute(block.props.content, context) ?? ""}</p>`
    case "button":
      return `<a href="${
        substitute(block.props.href, context) ?? block.props.href ?? "#"
      }" style="${[
        "display:inline-block",
        "padding:12px 24px",
        block.props.backgroundColor
          ? `background:${block.props.backgroundColor}`
          : "",
        block.props.color ? `color:${block.props.color}` : "",
        block.props.borderRadius != null
          ? `border-radius:${block.props.borderRadius}px`
          : "",
        block.props.align ? `text-align:${block.props.align}` : "",
        "text-decoration:none",
      ]
        .filter(Boolean)
        .join(
          ";"
        )}">${substitute(block.props.label, context) ?? block.props.label}</a>`
    case "image":
      return `<img src="${substitute(block.props.src, context) ?? block.props.src}" alt="${
        substitute(block.props.alt, context) ?? ""
      }" style="${[
        block.props.width != null ? `width:${block.props.width}px` : "",
        block.props.height != null ? `height:${block.props.height}px` : "",
        block.props.borderRadius != null
          ? `border-radius:${block.props.borderRadius}px`
          : "",
      ]
        .filter(Boolean)
        .join(";")}" />`
    case "divider":
      return `<hr style="${[
        block.props.margin ? `margin:${block.props.margin}` : "margin:16px 0",
        `border-style:solid`,
        `border-width:${block.props.thickness ?? 1}px`,
        block.props.color
          ? `border-color:${block.props.color}`
          : "border-color:#e5e7eb",
        block.props.width ? `width:${block.props.width}` : "",
      ]
        .filter(Boolean)
        .join(";")}" />`
    case "custom":
      return `<div data-custom-block="${block.props.componentName}" data-props='${JSON.stringify(
        deepSubstitute(block.props.props, context)
      ).replace(/'/g, "&apos;")}'></div>`
    default:
      return ""
  }
}

export function renderHtml(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions
): string {
  const indent = options.indent ?? 2
  const lines: string[] = ['<div class="red-outer">']

  document.sections.forEach((section) => {
    const sectionStyle = [
      section.backgroundColor ? `background:${section.backgroundColor}` : "",
      section.padding ? `padding:${section.padding}` : "",
    ]
      .filter(Boolean)
      .join(";")
    const sectionStyleAttr = sectionStyle ? ` style="${sectionStyle}"` : ""
    const sectionClassAttr = section.className
      ? ` class="${section.className}"`
      : ""
    lines.push(
      `  <section data-id="${section.id}"${sectionClassAttr}${sectionStyleAttr}>`
    )

    section.rows.forEach((row) => {
      const rowStyle = [
        row.gutter != null ? `gap:${row.gutter}px` : "",
        row.backgroundColor ? `background:${row.backgroundColor}` : "",
        row.padding ? `padding:${row.padding}` : "",
      ]
        .filter(Boolean)
        .join(";")
      const rowStyleAttr = rowStyle ? ` style="${rowStyle}"` : ""
      const rowClassAttr = row.className ? ` ${row.className}` : ""
      lines.push(
        `    <div class="red-row${rowClassAttr}" data-id="${row.id}"${rowStyleAttr}>`
      )

      row.columns.forEach((column) => {
        const columnStyle = [
          column.backgroundColor ? `background:${column.backgroundColor}` : "",
          column.padding ? `padding:${column.padding}` : "",
        ]
          .filter(Boolean)
          .join(";")
        const columnStyleAttr = columnStyle ? ` style="${columnStyle}"` : ""
        const colClassAttr = column.className ? ` ${column.className}` : ""
        lines.push(
          `      <div class="red-column${colClassAttr}" data-id="${column.id}"${columnStyleAttr}>`
        )

        column.blocks.forEach((block) => {
          const rendered = renderBlock(block, context)
          if (rendered) {
            lines.push(`        ${rendered}`)
          }
        })

        lines.push("      </div>")
      })

      lines.push("    </div>")
    })

    lines.push("  </section>")
  })

  lines.push("</div>")

  if (indent <= 0) {
    return lines.join("\n")
  }

  return lines
    .map((line) => {
      const trimmed = line.trimStart()
      const depth = (line.length - trimmed.length) / 2
      return " ".repeat(depth * indent) + trimmed
    })
    .join("\n")
}
