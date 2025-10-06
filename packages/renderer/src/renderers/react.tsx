import type { ReactElement } from "react"
import type { CanvasDocument } from "@react-email-dnd/shared"
import { deepSubstitute, substitute } from "../utils"
import type { RenderContext, RendererOptions } from "../types"
import * as ReactEmail from "@react-email/components"
const {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading: REHeading,
  Text: REText,
  Button: REButton,
  Img: REImg,
  Hr: REHr,
} = ReactEmail as any

export function renderReact(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions
): ReactElement {
  const previewText = document.meta.description ?? document.meta.title

  return (
    <Html>
      <Head />
      {previewText ? (
        <Preview>{substitute(previewText, context)}</Preview>
      ) : null}
      <Body>
        <Container>
          {document.sections.map((section) => {
            const sectionStyle: Record<string, unknown> = {}
            if (section.backgroundColor)
              sectionStyle.backgroundColor = section.backgroundColor
            if (section.padding) sectionStyle.padding = section.padding

            return (
              <Section
                key={section.id}
                className={section.className}
                style={sectionStyle}
              >
                {section.rows.map((row) => {
                  const rowStyle: Record<string, unknown> = {}
                  if (row.gutter != null) rowStyle.gap = row.gutter
                  if (row.backgroundColor)
                    rowStyle.backgroundColor = row.backgroundColor
                  if (row.padding) rowStyle.padding = row.padding

                  return (
                    <Row
                      key={row.id}
                      className={row.className}
                      style={rowStyle}
                    >
                      {row.columns.map((column) => {
                        const colStyle: Record<string, unknown> = {}
                        if (column.backgroundColor)
                          colStyle.backgroundColor = column.backgroundColor
                        if (column.padding) colStyle.padding = column.padding

                        return (
                          <Column key={column.id} style={colStyle}>
                            {column.blocks.map((block) => {
                              switch (block.type) {
                                case "heading": {
                                  const tag = block.props.as ?? "h2"
                                  const style: Record<string, unknown> = {}
                                  if (block.props.align)
                                    style.textAlign = block.props.align
                                  if (block.props.fontSize != null)
                                    style.fontSize = block.props.fontSize
                                  if (block.props.color)
                                    style.color = block.props.color
                                  if (block.props.lineHeight)
                                    style.lineHeight = block.props.lineHeight
                                  if (block.props.fontWeight)
                                    style.fontWeight = block.props.fontWeight
                                  if (block.props.margin)
                                    style.margin = block.props.margin
                                  return (
                                    <REHeading
                                      key={block.id}
                                      as={tag as any}
                                      style={style}
                                    >
                                      {substitute(block.props.content, context)}
                                    </REHeading>
                                  )
                                }
                                case "text": {
                                  const style: Record<string, unknown> = {}
                                  if (block.props.align)
                                    style.textAlign = block.props.align
                                  if (block.props.fontSize != null)
                                    style.fontSize = block.props.fontSize
                                  if (block.props.color)
                                    style.color = block.props.color
                                  if (block.props.lineHeight)
                                    style.lineHeight = block.props.lineHeight
                                  if (block.props.fontWeight)
                                    style.fontWeight = block.props.fontWeight
                                  return (
                                    <REText key={block.id} style={style}>
                                      {substitute(block.props.content, context)}
                                    </REText>
                                  )
                                }
                                case "button": {
                                  const style: Record<string, unknown> = {}
                                  if (block.props.backgroundColor)
                                    style.backgroundColor =
                                      block.props.backgroundColor
                                  if (block.props.color)
                                    style.color = block.props.color
                                  if (block.props.borderRadius != null)
                                    style.borderRadius =
                                      block.props.borderRadius
                                  if (block.props.align)
                                    style.textAlign = block.props.align
                                  const href =
                                    substitute(block.props.href, context) ??
                                    block.props.href ??
                                    "#"
                                  const label =
                                    substitute(block.props.label, context) ??
                                    block.props.label
                                  return (
                                    <REButton
                                      key={block.id}
                                      href={href}
                                      style={style}
                                    >
                                      {label}
                                    </REButton>
                                  )
                                }
                                case "image": {
                                  const src =
                                    substitute(block.props.src, context) ??
                                    block.props.src
                                  const alt = substitute(
                                    block.props.alt,
                                    context
                                  )
                                  const width = block.props.width
                                  const height = block.props.height
                                  const style: Record<string, unknown> = {}
                                  if (block.props.borderRadius != null)
                                    style.borderRadius =
                                      block.props.borderRadius
                                  return (
                                    <REImg
                                      key={block.id}
                                      src={src}
                                      alt={alt}
                                      width={width as any}
                                      height={height as any}
                                      style={style}
                                    />
                                  )
                                }
                                case "divider": {
                                  const style: Record<string, unknown> = {}
                                  if (block.props.margin)
                                    style.margin = block.props.margin
                                  if (block.props.thickness != null)
                                    style.borderWidth = block.props.thickness
                                  if (block.props.color)
                                    style.borderColor = block.props.color
                                  if (block.props.width)
                                    style.width = block.props.width
                                  return <REHr key={block.id} style={style} />
                                }
                                case "custom": {
                                  if (!options.customBlocks) {
                                    return (
                                      <div
                                        key={block.id}
                                        data-custom-block={
                                          block.props.componentName
                                        }
                                      />
                                    )
                                  }
                                  const def =
                                    options.customBlocks[
                                      block.props.componentName
                                    ]
                                  if (!def) {
                                    return (
                                      <div
                                        key={block.id}
                                        data-custom-block={
                                          block.props.componentName
                                        }
                                      />
                                    )
                                  }
                                  const props = deepSubstitute(
                                    block.props.props,
                                    context
                                  )
                                  const Component = def.component as any
                                  return (
                                    <Component
                                      key={block.id}
                                      {...(props as any)}
                                    />
                                  )
                                }
                                default:
                                  return null
                              }
                            })}
                          </Column>
                        )
                      })}
                    </Row>
                  )
                })}
              </Section>
            )
          })}
        </Container>
      </Body>
    </Html>
  )
}
