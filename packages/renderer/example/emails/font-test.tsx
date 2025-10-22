/**
 * Test Font Loading
 *
 * This file tests if fonts are being loaded correctly according to React Email documentation
 */

import { renderDocument } from "@react-email-dnd/renderer"
import { type CanvasDocument } from "@react-email-dnd/shared"

// Test document with proper font configuration
const testDocument: CanvasDocument = {
  version: 1,
  meta: {
    title: "Font Test",
  },
  variables: {},
  theme: {
    fonts: [
      {
        id: "geist",
        fontFamily: "Geist",
        fallbackFontFamily: "system-ui, sans-serif",
        webFont: {
          url: "https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2",
          format: "woff2",
        },
        fontWeight: 400,
        fontStyle: "normal",
      },
    ],
  },
  sections: [
    {
      id: "section-1",
      type: "section",
      rows: [
        {
          id: "row-1",
          type: "row",
          gutter: 16,
          padding: "6",
          margin: "0",
          align: "left",
          columns: [
            {
              id: "column-1",
              type: "column",
              padding: "4",
              margin: "0",
              align: "left",
              blocks: [
                {
                  id: "heading-1",
                  type: "heading",
                  props: {
                    content: "Geist Font Test",
                    as: "h1",
                    align: "left",
                    fontSize: 32,
                    color: "#111827",
                    lineHeight: "1.2",
                    fontWeight: "bold",
                    margin: "0 0 16px",
                    padding: "0",
                    fontFamily: "Geist",
                  },
                },
                {
                  id: "text-1",
                  type: "text",
                  props: {
                    content: "This should be using the Geist font family.",
                    align: "left",
                    fontSize: 16,
                    color: "#374151",
                    lineHeight: "1.6",
                    fontWeight: "normal",
                    margin: "0 0 16px",
                    padding: "0",
                    fontFamily: "Geist",
                  },
                },
              ],
            },
          ],
        },
      ],
      padding: "8",
      margin: "0",
      align: "left",
    },
  ],
}

export default function FontTest() {
  const result = renderDocument({
    document: testDocument,
    options: {
      format: "react",
    },
  })

  console.log("🔍 Rendered document:", result)

  return result.format === "react" ? result.node : null
}
