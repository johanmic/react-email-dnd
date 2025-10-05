import { Fragment, createElement } from "react"
import type { ReactElement } from "react"
import type { CanvasDocument } from "@react-email-dnd/shared"
import { substitute } from "../utils"
import type { RenderContext, RendererOptions } from "../types"

export function renderReact(
  document: CanvasDocument,
  context: RenderContext,
  _options: RendererOptions
): ReactElement {
  return createElement(
    Fragment,
    null,
    document.sections.map((section) =>
      createElement(
        "section",
        {
          key: section.id,
          "data-id": section.id,
          style: {
            backgroundColor: section.backgroundColor,
            padding: section.padding,
          },
        },
        section.rows.map((row) =>
          createElement(
            "div",
            {
              key: row.id,
              "data-id": row.id,
              style: { display: "flex", gap: row.gutter ?? 0 },
            },
            row.columns.map((column) =>
              createElement(
                "div",
                {
                  key: column.id,
                  "data-id": column.id,
                  style: { flex: column.width ?? 1 },
                },
                column.blocks.map((block) => {
                  switch (block.type) {
                    case "heading":
                      return createElement(
                        block.props.as ?? "h2",
                        { key: block.id },
                        substitute(block.props.content, context)
                      )
                    case "text":
                      return createElement(
                        "p",
                        { key: block.id },
                        substitute(block.props.content, context)
                      )
                    case "button":
                      return createElement(
                        "a",
                        {
                          key: block.id,
                          href: block.props.href,
                          style: {
                            display: "inline-block",
                            padding: "12px 24px",
                            backgroundColor: block.props.backgroundColor,
                            color: block.props.color,
                            borderRadius: block.props.borderRadius,
                            textDecoration: "none",
                          },
                        },
                        substitute(block.props.label, context) ??
                          block.props.label
                      )
                    case "image":
                      return createElement("img", {
                        key: block.id,
                        src:
                          substitute(block.props.src, context) ??
                          block.props.src,
                        alt: substitute(block.props.alt, context),
                        style: {
                          width: block.props.width,
                          height: block.props.height,
                          borderRadius: block.props.borderRadius,
                        },
                      })
                    case "divider":
                      return createElement("hr", {
                        key: block.id,
                        style: {
                          margin: block.props.margin,
                          borderWidth: block.props.thickness,
                          borderColor: block.props.color,
                        },
                      })
                    case "custom":
                      return createElement("div", {
                        key: block.id,
                        "data-custom-block": block.props.componentName,
                      })
                    default: {
                      // const _exhaustive: never = block
                      return null
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )
}
