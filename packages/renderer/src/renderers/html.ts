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
      const headingTag = block.props.as ?? "h2"
      const headingColor =
        block.props.color ??
        (block.props.colorClassName ? undefined : "#111827")
      const headingStyles = [
        block.props.align ? `text-align:${block.props.align}` : "",
        block.props.fontSize != null
          ? `font-size:${block.props.fontSize}px`
          : "",
        headingColor ? `color:${headingColor}` : "",
        block.props.lineHeight ? `line-height:${block.props.lineHeight}` : "",
        block.props.fontWeight ? `font-weight:${block.props.fontWeight}` : "",
        block.props.margin ? `margin:${block.props.margin}` : "",
        block.props.padding ? `padding:${block.props.padding}` : "",
      ]
        .filter(Boolean)
        .join(";")
      const headingClasses = [
        block.props.className,
        block.props.colorClassName,
      ]
        .filter(Boolean)
        .join(" ")
      const headingClassAttr =
        headingClasses.length > 0 ? ` class="${headingClasses}"` : ""
      const headingStyleAttr =
        headingStyles.length > 0 ? ` style="${headingStyles}"` : ""
      return `<${headingTag}${headingClassAttr}${headingStyleAttr}>${
        substitute(block.props.content, context) ?? ""
      }</${headingTag}>`
    case "text":
      const textColor =
        block.props.colorClassName ? undefined : block.props.color ?? "#1f2937"
      const textStyles = [
        block.props.align ? `text-align:${block.props.align}` : "",
        block.props.fontSize != null
          ? `font-size:${block.props.fontSize}px`
          : "",
        textColor ? `color:${textColor}` : "",
        block.props.lineHeight ? `line-height:${block.props.lineHeight}` : "",
        block.props.fontWeight ? `font-weight:${block.props.fontWeight}` : "",
        block.props.margin ? `margin:${block.props.margin}` : "",
        block.props.padding ? `padding:${block.props.padding}` : "",
      ]
        .filter(Boolean)
        .join(";")
      const textClasses = [
        block.props.className,
        block.props.colorClassName,
      ]
        .filter(Boolean)
        .join(" ")
      const textClassAttr =
        textClasses.length > 0 ? ` class="${textClasses}"` : ""
      const textStyleAttr =
        textStyles.length > 0 ? ` style="${textStyles}"` : ""
      return `<p${textClassAttr}${textStyleAttr}>${
        substitute(block.props.content, context) ?? ""
      }</p>`
    case "button":
      const resolvedHref =
        substitute(block.props.href, context) ?? block.props.href ?? "#"
      const buttonBackground =
        block.props.backgroundColor ??
        (block.props.backgroundClassName ? undefined : "#2563eb")
      const buttonColor =
        block.props.color ??
        (block.props.colorClassName ? undefined : "#ffffff")
      const buttonStyles = [
        "display:inline-block",
        block.props.padding ? `padding:${block.props.padding}` : "padding:12px 24px",
        buttonBackground ? `background:${buttonBackground}` : "",
        buttonColor ? `color:${buttonColor}` : "",
        block.props.borderRadius != null
          ? `border-radius:${block.props.borderRadius}px`
          : "",
        block.props.fontSize != null
          ? `font-size:${block.props.fontSize}px`
          : "",
        block.props.fontWeight ? `font-weight:${block.props.fontWeight}` : "",
        block.props.margin ? `margin:${block.props.margin}` : "",
        block.props.align ? `text-align:${block.props.align}` : "",
        "text-decoration:none",
      ]
        .filter(Boolean)
        .join(";")
      const buttonClasses = [
        block.props.className,
        block.props.backgroundClassName,
        block.props.colorClassName,
      ]
        .filter(Boolean)
        .join(" ")
      const buttonClassAttr =
        buttonClasses.length > 0 ? ` class="${buttonClasses}"` : ""
      const buttonStyleAttr =
        buttonStyles.length > 0 ? ` style="${buttonStyles}"` : ""
      return `<a href="${resolvedHref}"${buttonClassAttr}${buttonStyleAttr}>${
        substitute(block.props.label, context) ?? block.props.label
      }</a>`
    case "image":
      const imageStyles = [
        block.props.width != null ? `width:${block.props.width}px` : "",
        block.props.height != null ? `height:${block.props.height}px` : "",
        block.props.borderRadius != null
          ? `border-radius:${block.props.borderRadius}px`
          : "",
        block.props.margin ? `margin:${block.props.margin}` : "",
        block.props.padding ? `padding:${block.props.padding}` : "",
      ]
        .filter(Boolean)
        .join(";")
      const imageClassAttr = block.props.className
        ? ` class="${block.props.className}"`
        : ""
      const imageStyleAttr = imageStyles.length > 0 ? ` style="${imageStyles}"` : ""
      return `<img src="${substitute(block.props.src, context) ?? block.props.src}" alt="${
        substitute(block.props.alt, context) ?? ""
      }"${imageClassAttr}${imageStyleAttr} />`
    case "divider":
      const dividerColor =
        block.props.color ??
        (block.props.colorClassName ? undefined : "#e5e7eb")
      const dividerStyles = [
        block.props.margin ? `margin:${block.props.margin}` : "margin:16px 0",
        block.props.padding ? `padding:${block.props.padding}` : "",
        `border-style:solid`,
        `border-width:${block.props.thickness ?? 1}px`,
        dividerColor ? `border-color:${dividerColor}` : "",
        block.props.width ? `width:${block.props.width}` : "",
      ]
        .filter(Boolean)
        .join(";")
      const dividerClasses = [
        block.props.className,
        block.props.colorClassName,
      ]
        .filter(Boolean)
        .join(" ")
      const dividerClassAttr =
        dividerClasses.length > 0 ? ` class="${dividerClasses}"` : ""
      const dividerStyleAttr =
        dividerStyles.length > 0 ? ` style="${dividerStyles}"` : ""
      return `<hr${dividerClassAttr}${dividerStyleAttr} />`
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
    const sectionClasses = [
      section.backgroundClassName,
      section.className,
    ]
      .filter(Boolean)
      .join(" ")
    const sectionClassAttr =
      sectionClasses.length > 0 ? ` class="${sectionClasses}"` : ""
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
      const rowClasses = [row.backgroundClassName, row.className]
        .filter(Boolean)
        .join(" ")
      const rowClassAttr = rowClasses.length > 0 ? ` ${rowClasses}` : ""
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
        const colClasses = [
          column.backgroundClassName,
          column.className,
        ]
          .filter(Boolean)
          .join(" ")
        const colClassAttr = colClasses.length > 0 ? ` ${colClasses}` : ""
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
