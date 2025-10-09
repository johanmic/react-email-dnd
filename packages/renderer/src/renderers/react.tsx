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
  Tailwind,
  pixelBasedPreset,
} = ReactEmail as any

const mergeClassNames = (
  ...values: Array<string | null | undefined>
): string | undefined => {
  const merged = values
    .filter((value) => Boolean(value && value.trim()))
    .join(" ")
  return merged.length > 0 ? merged : undefined
}

export function renderReact(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions
): ReactElement {
  const previewText = document.meta.description ?? document.meta.title
  const tailwindConfig =
    options.daisyui && options.theme
      ? {
          presets: [pixelBasedPreset],
          theme: { extend: { colors: options.theme } },
        }
      : { presets: [pixelBasedPreset] }

  return (
    <Html>
      <Tailwind
        {...(tailwindConfig ? ({ config: tailwindConfig } as any) : {})}
      >
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
                  className={mergeClassNames(
                    section.backgroundClassName,
                    section.className
                  )}
                  style={sectionStyle}
                >
                  {section.rows.map((row) => {
                    const rowStyle: Record<string, unknown> = {}
                    if (row.gutter != null) rowStyle.gap = `${row.gutter}px`
                    if (row.backgroundColor)
                      rowStyle.backgroundColor = row.backgroundColor
                    if (row.padding) rowStyle.padding = row.padding

                    return (
                      <Row
                        key={row.id}
                        className={mergeClassNames(
                          row.backgroundClassName,
                          row.className
                        )}
                        style={rowStyle}
                      >
                        {row.columns.map((column) => {
                          const colStyle: Record<string, unknown> = {}
                          if (column.backgroundColor)
                            colStyle.backgroundColor = column.backgroundColor
                          if (column.padding) colStyle.padding = column.padding
                          if (column.width != null)
                            colStyle.width = column.width

                          return (
                            <Column
                              key={column.id}
                              className={mergeClassNames(
                                column.backgroundClassName,
                                column.className
                              )}
                              style={colStyle}
                            >
                              {column.blocks.map((block) => {
                                switch (block.type) {
                                  case "heading": {
                                    const tag = block.props.as ?? "h2"
                                    const align = block.props.align ?? "left"
                                    const fontSize = block.props.fontSize ?? 24
                                    const fontWeight =
                                      block.props.fontWeight ?? "bold"

                                    // Apply base styles with sensible defaults
                                    const style: Record<string, unknown> = {
                                      textAlign: align,
                                      fontSize: `${fontSize}px`,
                                      lineHeight:
                                        block.props.lineHeight ?? "1.3",
                                      fontWeight:
                                        fontWeight === "medium"
                                          ? 500
                                          : fontWeight,
                                      margin: block.props.margin ?? "0 0 16px",
                                      padding: block.props.padding ?? "0",
                                      fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                      wordBreak: "break-word",
                                      maxWidth: "100%",
                                    }

                                    const inlineColor =
                                      block.props.color ??
                                      (block.props.colorClassName
                                        ? undefined
                                        : "#111827")
                                    if (inlineColor) {
                                      style.color = inlineColor
                                    }

                                    // Generate responsive classes
                                    const getAlignmentClass = () => {
                                      switch (align) {
                                        case "center":
                                          return "text-center"
                                        case "right":
                                          return "text-right"
                                        case "justify":
                                          return "text-justify"
                                        default:
                                          return "text-left"
                                      }
                                    }

                                    const getFontSizeClass = () => {
                                      if (fontSize <= 16) return "text-base"
                                      if (fontSize <= 18) return "text-lg"
                                      if (fontSize <= 20) return "text-xl"
                                      if (fontSize <= 24) return "text-2xl"
                                      if (fontSize <= 30) return "text-3xl"
                                      if (fontSize <= 36) return "text-4xl"
                                      if (fontSize <= 48) return "text-5xl"
                                      return "text-6xl"
                                    }

                                    const getFontWeightClass = () => {
                                      switch (fontWeight) {
                                        case "light":
                                          return "font-light"
                                        case "normal":
                                          return "font-normal"
                                        case "medium":
                                          return "font-medium"
                                        case "bold":
                                          return "font-bold"
                                        case "extrabold":
                                          return "font-extrabold"
                                        default:
                                          return "font-bold"
                                      }
                                    }

                                    const getDaisyUIHeadingClass = () => {
                                      if (!options.daisyui) return ""
                                      switch (tag) {
                                        case "h1":
                                          return "text-4xl font-bold text-base-content"
                                        case "h2":
                                          return "text-3xl font-bold text-base-content"
                                        case "h3":
                                          return "text-2xl font-bold text-base-content"
                                        case "h4":
                                          return "text-xl font-bold text-base-content"
                                        case "h5":
                                          return "text-lg font-bold text-base-content"
                                        case "h6":
                                          return "text-base font-bold text-base-content"
                                        default:
                                          return "text-3xl font-bold text-base-content"
                                      }
                                    }

                                    const className = mergeClassNames(
                                      "block w-full leading-tight",
                                      getAlignmentClass(),
                                      getFontSizeClass(),
                                      getFontWeightClass(),
                                      options.daisyui &&
                                        !block.props.colorClassName
                                        ? getDaisyUIHeadingClass()
                                        : undefined,
                                      !options.daisyui &&
                                        !block.props.colorClassName
                                        ? "text-gray-900"
                                        : undefined,
                                      block.props.colorClassName,
                                      block.props.className
                                    )

                                    return (
                                      <REHeading
                                        key={block.id}
                                        as={tag as any}
                                        className={className}
                                        style={style}
                                      >
                                        {substitute(
                                          block.props.content,
                                          context
                                        )}
                                      </REHeading>
                                    )
                                  }
                                  case "text": {
                                    const align = block.props.align ?? "left"
                                    const fontSize = block.props.fontSize ?? 16
                                    const fontWeight =
                                      block.props.fontWeight ?? "normal"

                                    // Apply base styles with sensible defaults
                                    const style: Record<string, unknown> = {
                                      textAlign: align,
                                      fontSize: `${fontSize}px`,
                                      lineHeight:
                                        block.props.lineHeight ?? "1.6",
                                      fontWeight:
                                        fontWeight === "medium"
                                          ? 500
                                          : fontWeight,
                                      margin: block.props.margin ?? "0 0 16px",
                                      padding: block.props.padding ?? "0",
                                      fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                      wordBreak: "break-word",
                                      maxWidth: "100%",
                                    }

                                    const inlineColor =
                                      block.props.colorClassName
                                        ? undefined
                                        : block.props.color ?? "#1f2937"
                                    if (inlineColor) {
                                      style.color = inlineColor
                                    }

                                    // Generate responsive classes
                                    const getAlignmentClass = () => {
                                      switch (align) {
                                        case "center":
                                          return "text-center"
                                        case "right":
                                          return "text-right"
                                        case "justify":
                                          return "text-justify"
                                        default:
                                          return "text-left"
                                      }
                                    }

                                    const getFontSizeClass = () => {
                                      if (fontSize <= 12) return "text-xs"
                                      if (fontSize <= 14) return "text-sm"
                                      if (fontSize <= 16) return "text-base"
                                      if (fontSize <= 18) return "text-lg"
                                      if (fontSize <= 20) return "text-xl"
                                      if (fontSize <= 24) return "text-2xl"
                                      if (fontSize <= 30) return "text-3xl"
                                      return "text-4xl"
                                    }

                                    const getFontWeightClass = () => {
                                      switch (fontWeight) {
                                        case "light":
                                          return "font-light"
                                        case "normal":
                                          return "font-normal"
                                        case "medium":
                                          return "font-medium"
                                        case "bold":
                                          return "font-bold"
                                        case "extrabold":
                                          return "font-extrabold"
                                        default:
                                          return "font-normal"
                                      }
                                    }

                                    const className = mergeClassNames(
                                      "block w-full leading-relaxed",
                                      getAlignmentClass(),
                                      getFontSizeClass(),
                                      getFontWeightClass(),
                                      options.daisyui &&
                                        !block.props.colorClassName
                                        ? "text-base-content"
                                        : undefined,
                                      !options.daisyui &&
                                        !block.props.colorClassName
                                        ? "text-gray-800"
                                        : undefined,
                                      block.props.colorClassName,
                                      block.props.className
                                    )

                                    return (
                                      <REText
                                        key={block.id}
                                        className={className}
                                        style={style}
                                      >
                                        {substitute(
                                          block.props.content,
                                          context
                                        )}
                                      </REText>
                                    )
                                  }
                                  case "button": {
                                    const align = block.props.align ?? "center"
                                    const fontSize = block.props.fontSize ?? 14
                                    const fontWeight =
                                      block.props.fontWeight ?? "bold"
                                    const backgroundClassName =
                                      block.props.backgroundClassName
                                    const colorClassName =
                                      block.props.colorClassName
                                    const hasBackgroundClass = Boolean(
                                      backgroundClassName
                                    )
                                    const hasTextClass = Boolean(
                                      colorClassName
                                    )
                                    const resolvedBackgroundColor =
                                      block.props.backgroundColor ?? "#2563eb"
                                    const resolvedTextColor =
                                      block.props.color ?? "#ffffff"

                                    // Apply base styles with sensible defaults
                                    const style: Record<string, unknown> = {
                                      display: "inline-block",
                                      textDecoration: "none",
                                      backgroundColor:
                                        options.daisyui || hasBackgroundClass
                                          ? undefined
                                          : resolvedBackgroundColor,
                                      color:
                                        options.daisyui || hasTextClass
                                          ? undefined
                                          : resolvedTextColor,
                                      borderRadius: options.daisyui
                                        ? undefined
                                        : `${block.props.borderRadius ?? 6}px`,
                                      padding: options.daisyui
                                        ? undefined
                                        : (block.props.padding ?? "12px 24px"),
                                      fontSize: `${fontSize}px`,
                                      fontWeight:
                                        fontWeight === "medium"
                                          ? 500
                                          : fontWeight,
                                      margin: block.props.margin ?? "12px 0",
                                      lineHeight: "1.5",
                                      border: "none",
                                      outline: "none",
                                      fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                      minWidth: "120px",
                                      maxWidth: "100%",
                                    }

                                    const wrapperStyle: Record<
                                      string,
                                      unknown
                                    > = {
                                      textAlign: align,
                                      width: "100%",
                                    }

                                    // Generate responsive classes
                                    const getAlignmentClass = () => {
                                      switch (align) {
                                        case "center":
                                          return "text-center"
                                        case "right":
                                          return "text-right"
                                        case "left":
                                          return "text-left"
                                        default:
                                          return "text-center"
                                      }
                                    }

                                    const getSizeClass = () => {
                                      if (fontSize <= 12) return "text-xs"
                                      if (fontSize <= 14) return "text-sm"
                                      if (fontSize <= 16) return "text-base"
                                      if (fontSize <= 18) return "text-lg"
                                      return "text-xl"
                                    }

                                    const getFontWeightClass = () => {
                                      switch (fontWeight) {
                                        case "light":
                                          return "font-light"
                                        case "normal":
                                          return "font-normal"
                                        case "medium":
                                          return "font-medium"
                                        case "bold":
                                          return "font-bold"
                                        case "extrabold":
                                          return "font-extrabold"
                                        default:
                                          return "font-bold"
                                      }
                                    }

                                    const getPaddingClass = () => {
                                      const paddingValue = (
                                        block.props.padding ?? "12px 24px"
                                      )
                                        .replace(/px/g, "")
                                        .split(" ")
                                        .map(Number)
                                      const topBottom = paddingValue[0] ?? 12

                                      if (topBottom <= 8) return "py-1"
                                      if (topBottom <= 12) return "py-2"
                                      if (topBottom <= 16) return "py-3"
                                      if (topBottom <= 20) return "py-4"
                                      return "py-5"
                                    }

                                    const daisyUIColor = (() => {
                                      if (!options.daisyui || hasBackgroundClass)
                                        return undefined
                                      switch (resolvedBackgroundColor) {
                                        case "#2563eb":
                                          return "btn-primary"
                                        case "#6b7280":
                                          return "btn-secondary"
                                        case "#8b5cf6":
                                          return "btn-accent"
                                        case "#374151":
                                          return "btn-neutral"
                                        case "#059669":
                                          return "btn-success"
                                        case "#d97706":
                                          return "btn-warning"
                                        case "#dc2626":
                                          return "btn-error"
                                        case "#0891b2":
                                          return "btn-info"
                                        default:
                                          return "btn-ghost"
                                      }
                                    })()

                                    const className = mergeClassNames(
                                      "inline-block no-underline cursor-pointer transition-all duration-200",
                                      "hover:opacity-90 active:opacity-75",
                                      getSizeClass(),
                                      getFontWeightClass(),
                                      getPaddingClass(),
                                      options.daisyui ? "btn" : undefined,
                                      daisyUIColor,
                                      backgroundClassName,
                                      colorClassName,
                                      block.props.className
                                    )

                                    const href =
                                      substitute(block.props.href, context) ??
                                      block.props.href ??
                                      "#"
                                    const label =
                                      substitute(block.props.label, context) ??
                                      block.props.label

                                    return (
                                      <div
                                        key={block.id}
                                        style={wrapperStyle}
                                        className={getAlignmentClass()}
                                      >
                                        <REButton
                                          href={href}
                                          className={className}
                                          style={style}
                                        >
                                          {label}
                                        </REButton>
                                      </div>
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
                                    const width = block.props.width ?? 600
                                    const height = block.props.height ?? 200
                                    const align = block.props.align ?? "center"
                                    const borderRadius =
                                      block.props.borderRadius ?? 0

                                    // Apply base styles with sensible defaults
                                    const style: Record<string, unknown> = {
                                      borderRadius: options.daisyui
                                        ? undefined
                                        : `${borderRadius}px`,
                                      margin: block.props.margin ?? "12px 0",
                                      padding: block.props.padding ?? "0",
                                      display: "inline-block",
                                      maxWidth: "100%",
                                      height: "auto",
                                      border: "none",
                                      outline: "none",
                                    }

                                    const wrapperStyle: Record<
                                      string,
                                      unknown
                                    > = {
                                      textAlign: align,
                                      width: "100%",
                                    }

                                    // Generate responsive classes
                                    const getAlignmentClass = () => {
                                      switch (align) {
                                        case "center":
                                          return "text-center"
                                        case "right":
                                          return "text-right"
                                        case "left":
                                          return "text-left"
                                        default:
                                          return "text-center"
                                      }
                                    }

                                    const getBorderRadiusClass = () => {
                                      if (borderRadius === 0) return ""
                                      if (borderRadius <= 4) return "rounded-sm"
                                      if (borderRadius <= 8) return "rounded-md"
                                      if (borderRadius <= 12)
                                        return "rounded-lg"
                                      if (borderRadius <= 16)
                                        return "rounded-xl"
                                      if (borderRadius <= 24)
                                        return "rounded-2xl"
                                      return "rounded-3xl"
                                    }

                                    const getSizeClass = () => {
                                      if (width <= 200) return "max-w-xs"
                                      if (width <= 300) return "max-w-sm"
                                      if (width <= 400) return "max-w-md"
                                      if (width <= 500) return "max-w-lg"
                                      if (width <= 600) return "max-w-xl"
                                      if (width <= 800) return "max-w-2xl"
                                      if (width <= 1000) return "max-w-3xl"
                                      return "max-w-4xl"
                                    }

                                    const className = mergeClassNames(
                                      "block mx-auto",
                                      getSizeClass(),
                                      getBorderRadiusClass(),
                                      options.daisyui && borderRadius > 0
                                        ? "rounded-lg shadow-lg"
                                        : undefined,
                                      block.props.className
                                    )

                                    return (
                                      <div
                                        key={block.id}
                                        style={wrapperStyle}
                                        className={getAlignmentClass()}
                                      >
                                        <REImg
                                          src={src}
                                          alt={alt}
                                          width={width as any}
                                          height={height as any}
                                          className={className}
                                          style={style}
                                        />
                                      </div>
                                    )
                                  }
                                  case "divider": {
                                    const align = block.props.align ?? "center"
                                    const thickness = block.props.thickness ?? 1
                                    const width = block.props.width ?? "100%"
                                    const colorClassName =
                                      block.props.colorClassName
                                    const resolvedColor =
                                      block.props.color ??
                                      (colorClassName ? undefined : "#e5e7eb")

                                    // Apply base styles with sensible defaults
                                    const style: Record<string, unknown> = {
                                      margin: block.props.margin ?? "16px 0",
                                      padding: block.props.padding ?? "0",
                                      borderWidth: `${thickness}px`,
                                      width: width,
                                      border: "none",
                                      display: "inline-block",
                                      maxWidth: "100%",
                                    }

                                    if (!options.daisyui && resolvedColor) {
                                      style.borderTop = `${thickness}px solid ${resolvedColor}`
                                    }

                                    const wrapperStyle: Record<
                                      string,
                                      unknown
                                    > = {
                                      textAlign: align,
                                      width: "100%",
                                    }

                                    // Generate responsive classes
                                    const getAlignmentClass = () => {
                                      switch (align) {
                                        case "center":
                                          return "text-center"
                                        case "right":
                                          return "text-right"
                                        case "left":
                                          return "text-left"
                                        default:
                                          return "text-center"
                                      }
                                    }

                                    const getWidthClass = () => {
                                      if (width === "100%") return "w-full"
                                      if (width === "75%") return "w-3/4"
                                      if (width === "50%") return "w-1/2"
                                      if (width === "25%") return "w-1/4"
                                      return ""
                                    }

                                    const getThicknessClass = () => {
                                      if (thickness <= 1) return "border-t"
                                      if (thickness <= 2) return "border-t-2"
                                      if (thickness <= 4) return "border-t-4"
                                      return "border-t-8"
                                    }

                                    const className = mergeClassNames(
                                      "block",
                                      getWidthClass(),
                                      getThicknessClass(),
                                      options.daisyui ? "divider" : undefined,
                                      !options.daisyui && !colorClassName
                                        ? "border-gray-300"
                                        : undefined,
                                      colorClassName,
                                      block.props.className
                                    )

                                    return (
                                      <div
                                        key={block.id}
                                        style={wrapperStyle}
                                        className={getAlignmentClass()}
                                      >
                                        <REHr
                                          className={className}
                                          style={style}
                                        />
                                      </div>
                                    )
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
      </Tailwind>
    </Html>
  )
}
