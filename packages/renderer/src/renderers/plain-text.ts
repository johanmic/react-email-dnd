import type { CanvasDocument } from "@react-email-dnd/shared"
import { describeBlock, indentLines } from "../utils"
import type { RenderContext, RendererOptions } from "../types"

export function renderPlainText(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions
): string {
  const lines: string[] = []

  document.sections
    .filter((section) => !section.hidden)
    .forEach((section, sectionIndex) => {
      if (sectionIndex > 0) {
        lines.push("")
        lines.push("---")
        lines.push("")
      }

      section.rows
        .filter((row) => !row.hidden)
        .forEach((row) => {
          row.columns
            .filter((column) => !column.hidden)
            .forEach((column) => {
              column.blocks
                .filter((block) => !block.hidden)
                .forEach((block) => {
                  const text = describeBlock(block, context)
                  if (text.trim().length) {
                    lines.push(text.trim())
                  }
                })
            })
        })
    })

  const indent = options.indent ?? 0
  if (indent > 0) {
    return indentLines(lines, indent)
  }

  return lines.join("\n")
}
