import { renderDocument } from "@react-email-dnd/renderer"
import { type CanvasDocument } from "@react-email-dnd/shared"

interface CustomProps {
  document: CanvasDocument
}

import themes from "../themes.json"
import email from "../../emails/daiyui.json"

const forest = themes.forest
const colors = [
  forest.primary,
  forest.secondary,
  forest.accent,
  forest.neutral,
  forest.info,
  forest.success,
  forest.warning,
  forest.error,
]
const textColors = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
].map((name) => ({
  hex: forest[`${name}-content` as keyof typeof forest],
  class: `text-${name}`,
}))

const t: CanvasDocument = email as CanvasDocument

export default function Custom({ document }: { document: CanvasDocument }) {
  const theme = themes.forest
  const result = renderDocument({
    document,
    options: { format: "react", theme, daisyui: true, colors },
  })
  return result.format === "react" ? result.node : null
}

Custom.PreviewProps = {
  document: t,
} as CustomProps
