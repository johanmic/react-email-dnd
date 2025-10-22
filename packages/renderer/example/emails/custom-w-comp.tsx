import { renderDocument } from "@react-email-dnd/renderer"
import { type CanvasDocument } from "@react-email-dnd/shared"
import { customBlocks } from "./components/custom-blocks"

interface CustomProps {
  document: CanvasDocument
}

import themes from "../themes.json"
import email from "../../emails/plain-w-components.json"

const t: CanvasDocument = email as CanvasDocument

export default function Custom({ document }: { document: CanvasDocument }) {
  const theme = themes.forest
  const customBlocksRegistry = customBlocks.reduce((acc, def) => {
    acc[def.defaults.componentName] = def
    return acc
  }, {} as any)

  const result = renderDocument({
    document,
    options: {
      format: "react",
      customBlocks: customBlocksRegistry,
    },
  })
  return result.format === "react" ? result.node : null
}

Custom.PreviewProps = {
  document: t,
} as CustomProps
