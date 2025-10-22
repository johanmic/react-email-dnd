/**
 * Font Rendering Test
 *
 * This test verifies that fonts are properly rendered according to React Email documentation
 */

import { renderDocument } from "@react-email-dnd/renderer"
import { type CanvasDocument } from "@react-email-dnd/shared"

// Test document with Honk font
const testDocument: CanvasDocument = {
  version: 1,
  meta: {
    title: "Font Rendering Test",
  },
  variables: {},
  theme: {
    fonts: [
      {
        id: "honk",
        fontFamily: "Honk",
        fallbackFontFamily: "system-ui, sans-serif",
        webFont: {
          url: "https://fonts.gstatic.com/s/honk/v6/m8J7jftUea-XwTaemClumrBQbmvynOmXBji9zFhHRr8WFgV7pLFMWJEav63D.woff2",
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
                    content: "Most professional mail",
                    as: "h1",
                    align: "left",
                    fontSize: 32,
                    color: "#111827",
                    lineHeight: "1.2",
                    fontWeight: "bold",
                    margin: "0 0 16px",
                    padding: "0",
                    fontFamily: "Honk",
                  },
                },
                {
                  id: "text-1",
                  type: "text",
                  props: {
                    content: "This is a very professional mail",
                    align: "left",
                    fontSize: 16,
                    color: "#374151",
                    lineHeight: "1.6",
                    fontWeight: "normal",
                    margin: "0 0 16px",
                    padding: "0",
                    fontFamily: "Honk",
                  },
                },
                {
                  id: "button-1",
                  type: "button",
                  props: {
                    label: "Honk Font Button",
                    href: "https://example.com",
                    align: "center",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    borderRadius: 6,
                    padding: "12px 24px",
                    fontSize: 14,
                    fontWeight: "bold",
                    margin: "12px 0",
                    fontFamily: "Honk",
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

export default function FontRenderingTest() {
  const result = renderDocument({
    document: testDocument,
    options: {
      format: "react",
    },
  })

  console.log("🔍 Font rendering test result:", result)

  if (result.format === "react") {
    // Log the rendered HTML to see if Font components are present
    console.log("📧 Rendered email HTML:", result.node)
  }

  return result.format === "react" ? result.node : null
}
