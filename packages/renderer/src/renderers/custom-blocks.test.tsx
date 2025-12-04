import { renderDocument } from "../index"
import type { CanvasDocument } from "@react-email-dnd/shared"
import { describe, it, expect } from "vitest"
import { Cube } from "@phosphor-icons/react"

const mockDocument: CanvasDocument = {
  version: 1,
  meta: {
    title: "Test Document",
    description: "Test Description",
  },
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
              id: "col-1",
              type: "column",
              blocks: [
                {
                  id: "block-1",
                  type: "custom",
                  props: {
                    componentName: "MyCustomBlock",
                    props: { foo: "bar" },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

describe("throwOnMissingCustomBlocks", () => {
  it("should throw by default when custom block is missing (react)", () => {
    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react",
        },
      })
    }).toThrow('Custom block "MyCustomBlock" not found in registry')
  })

  it("should throw when throwOnMissingCustomBlocks is true and custom block is missing (react)", () => {
    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react",
          throwOnMissingCustomBlocks: true,
        },
      })
    }).toThrow('Custom block "MyCustomBlock" not found in registry')
  })

  it("should NOT throw when throwOnMissingCustomBlocks is false and custom block is missing (react)", () => {
    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react",
          throwOnMissingCustomBlocks: false,
        },
      })
    }).not.toThrow()
  })

  it("should throw by default when custom block is missing (react-text)", () => {
    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react-text",
        },
      })
    }).toThrow('Custom block "MyCustomBlock" not found in registry')
  })

  it("should throw when throwOnMissingCustomBlocks is true and custom block is missing (react-text)", () => {
    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react-text",
          throwOnMissingCustomBlocks: true,
        },
      })
    }).toThrow('Custom block "MyCustomBlock" not found in registry')
  })

  it("should NOT throw when throwOnMissingCustomBlocks is false and custom block is missing (react-text)", () => {
    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react-text",
          throwOnMissingCustomBlocks: false,
        },
      })
    }).not.toThrow()
  })

  it("should work correctly when custom block is present", () => {
    const MyCustomBlock = ({ foo }: { foo: string }) => <div>Custom Block: {foo}</div>

    expect(() => {
      renderDocument({
        document: mockDocument,
        options: {
          format: "react",
          customBlocks: {
            MyCustomBlock: {
              type: "custom",
              label: "My Custom Block",
              icon: Cube,
              defaults: {
                componentName: "MyCustomBlock",
                props: { foo: "default" },
              },
              component: MyCustomBlock,
            },
          },
        },
      })
    }).not.toThrow()
  })
})
