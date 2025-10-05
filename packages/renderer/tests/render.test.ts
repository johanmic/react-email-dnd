import { describe, expect, it } from "vitest"
import type { CanvasDocument } from "@react-email-dnd/shared"
import { renderDocument } from "../src"

const sampleDocument: CanvasDocument = {
  version: 1,
  meta: { title: "Sample", description: "Test doc" },
  sections: [
    {
      id: "section-1",
      type: "section",
      rows: [
        {
          id: "row-1",
          type: "row",
          columns: [
            {
              id: "column-1",
              type: "column",
              blocks: [
                {
                  id: "block-1",
                  type: "heading",
                  props: { content: "Welcome", as: "h1" },
                },
                {
                  id: "block-2",
                  type: "text",
                  props: { content: "Thanks for joining us, {{name}}!" },
                },
                {
                  id: "block-3",
                  type: "button",
                  props: { label: "Get Started", href: "https://example.com" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

describe("renderDocument", () => {
  it("returns a React node for react format", () => {
    const result = renderDocument({
      document: sampleDocument,
      options: { format: "react", variables: { name: "Alice" } },
    })

    expect(result.format).toBe("react")
    expect(result.node).toBeDefined()
  })

  it("returns HTML for html format", () => {
    const result = renderDocument({
      document: sampleDocument,
      options: { format: "html", indent: 2 },
    })

    expect(result.format).toBe("html")
    expect(result.html).toContain("<section")
  })

  it("returns React Email JSX for react-text", () => {
    const result = renderDocument({
      document: sampleDocument,
      options: {
        format: "react-text",
        variables: { name: "Alice" },
        componentName: "SampleEmail",
      },
    })
    expect(result.format).toBe("react-text")
    expect(result.code).toContain("SampleEmail")
    expect(result.code).toContain("<Html>")
    expect(result.code).toContain("Thanks for joining us, Alice!")
  })

  it("returns plain text", () => {
    const result = renderDocument({
      document: sampleDocument,
      options: { format: "plain-text", variables: { name: "Alice" } },
    })

    expect(result.format).toBe("plain-text")
    expect(result.text).toContain("Alice")
  })
})
