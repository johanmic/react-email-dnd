import React from "react"
import type { JSX } from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import CodeBlock from "@theme/CodeBlock"
import BrowserOnly from "@docusaurus/BrowserOnly"
// @ts-expect-error -- workspace path alias resolved via pnpm workspaces
import type { CanvasDocument, Padding } from "@react-email-dnd/shared"

// Suppress ResizeObserver loop errors at module level
// This harmless error occurs during drag operations when ResizeObserver
// callbacks trigger layout changes. We catch it early before webpack-dev-server's overlay.
if (typeof window !== "undefined") {
  // Store original methods before any other code can modify them
  const originalConsoleError = console.error.bind(console)
  const originalConsoleWarn = console.warn.bind(console)
  const originalConsoleLog = console.log.bind(console)

  // Intercept all console methods that might log the error
  console.error = (...args: unknown[]) => {
    const message = String(args.join(" "))
    if (
      message.includes("ResizeObserver loop") ||
      message.includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      // Silently ignore - don't log, don't throw
      return
    }
    originalConsoleError(...args)
  }

  console.warn = (...args: unknown[]) => {
    const message = String(args.join(" "))
    if (
      message.includes("ResizeObserver loop") ||
      message.includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      return
    }
    originalConsoleWarn(...args)
  }

  // Also catch in console.log just in case
  console.log = (...args: unknown[]) => {
    const message = String(args.join(" "))
    if (
      message.includes("ResizeObserver loop") ||
      message.includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      return
    }
    originalConsoleLog(...args)
  }

  // Handle window error events - catch in capture phase (before bubbling)
  const handleError = (e: ErrorEvent) => {
    const errorMessage = e.message || String(e.error || "")
    if (
      errorMessage.includes("ResizeObserver loop") ||
      errorMessage.includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      return false
    }
  }

  // Handle unhandled promise rejections
  const handleRejection = (e: PromiseRejectionEvent) => {
    const reason = String(e.reason || "")
    if (
      reason.includes("ResizeObserver loop") ||
      reason.includes(
        "ResizeObserver loop completed with undelivered notifications"
      )
    ) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      return false
    }
  }

  // Register listeners in capture phase to intercept before other handlers
  window.addEventListener("error", handleError, true)
  window.addEventListener("unhandledrejection", handleRejection, true)

  // Also listen to 'error' event on document
  document.addEventListener("error", handleError, true)
}

const packageCards = [
  {
    name: "@react-email-dnd/editor",
    summary:
      "Drag-and-drop React primitives plus the ready-to-ship EmailEditor experience.",
    highlights: [
      "CanvasProvider for document/state orchestration",
      "EmailEditor for fully opinionated UI",
      "Canvas for headless rendering of sections/rows/columns",
    ],
  },
  {
    name: "@react-email-dnd/renderer",
    summary:
      "Pure rendering helpers that convert a CanvasDocument into React, HTML, or text.",
    highlights: [
      "renderDocument entry point with format switching",
      "DaisyUI-aware theme merging and palette normalization",
      "Supports custom block registries when rendering React",
    ],
  },
  {
    name: "@react-email-dnd/shared",
    summary:
      "Schemas, TypeScript contracts, and utilities reused by editor + renderer.",
    highlights: [
      "CanvasDocument, CanvasSection, and block typings",
      "Validation helpers for bespoke pipelines",
      "Shared color/font/padding helpers to keep UIs aligned",
    ],
  },
]

const editorExample = `import {
  CanvasDocument,
  CanvasProvider,
  EmailEditor,
} from '@react-email-dnd/editor';

import { customBlocks } from './custom-blocks';
import { advancedFonts as fonts } from './fonts';

const initialDocument: CanvasDocument = {
  version: 1,
  sections: [],
};

const paddingPresets = {
  compact: { top: 8, right: 16, bottom: 8, left: 16 },
  relaxed: { top: 24, right: 24, bottom: 24, left: 24 },
};

export function MarketingEditor() {
  return (
    <CanvasProvider initialDocument={initialDocument}>
      <EmailEditor
        daisyui
        colorMode="hierarchy"
        colorModeDepth={2}
        customBlocks={customBlocks}
        colors={[
          { hex: '#000000', label: 'Carbon' },
          { hex: '#ffffff', label: 'Paper' },
        ]}
        textColors={[{ hex: '#111111', label: 'Body' }]}
        bgColors={[{ hex: '#f5f5f5', label: 'Panel' }]}
        fonts={fonts}
        padding={paddingPresets}
        blocks={['heading', 'text', 'image', 'button', '2-col', '3-col']}
        headerItems={['title', 'preview', 'save']}
      />
    </CanvasProvider>
  );
}`

const rendererExample = `import { renderDocument } from '@react-email-dnd/renderer';
import { customBlocks } from './custom-blocks';

const { html } = renderDocument({
  document,
  options: {
    format: 'html',
    daisyui: false,
    colors: [
      { hex: '#000000', label: 'ink' },
      { hex: '#ffffff', label: 'paper' },
    ],
    theme: { primary: '#000000' },
    variables: { firstName: 'Lee' },
    customBlocks,
  },
});

// html contains the rendered email markup in a monochrome palette.`

const editorCssExample = `@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, forest, lofi;
}

@source "./**/*.{ts,tsx}";
@source "../../src/**/*.{ts,tsx}";
@source "../../shared/src/**/*.{ts,tsx}";
@source "../../renderer/src/**/*.{ts,tsx}";
`

const livePaddingPresets: Record<string, Padding> = {
  snug: { top: 12, right: 16, bottom: 12, left: 16 },
  airy: { top: 28, right: 28, bottom: 28, left: 28 },
}

const demoDocument: CanvasDocument = {
  version: 1,
  meta: {
    title: "Monochrome welcome",
    previewText: "Minimal palettes, maximal control.",
  },
  variables: {},
  sections: [
    {
      id: "section-hero",
      type: "section",
      align: "left",
      padding: "8",
      margin: "0",
      rows: [
        {
          id: "row-hero",
          type: "row",
          gutter: 16,
          padding: "0",
          margin: "0",
          align: "left",
          columns: [
            {
              id: "column-hero",
              type: "column",
              align: "left",
              padding: "0",
              margin: "0",
              blocks: [
                {
                  id: "heading-hero",
                  type: "heading",
                  props: {
                    content: "Build perfect emails",
                    as: "h2",
                    align: "left",
                    fontSize: 26,
                    color: "#FFFFFF",
                    lineHeight: "1.4",
                    fontWeight: "600",
                    margin: "0 0 16px",
                  },
                },
                {
                  id: "text-hero",
                  type: "text",
                  props: {
                    content:
                      "Drag, customize, and ship email layouts with the exact tokens your brand approves",
                    align: "left",
                    fontSize: 16,
                    color: "#FFFFFF",
                    lineHeight: "1.6",
                    margin: "0 0 20px",
                  },
                },
                {
                  id: "button-hero",
                  type: "button",
                  props: {
                    label: "Send in black & white",
                    href: "#",
                    align: "left",
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    borderRadius: 4,
                    padding: "12px 24px",
                    fontSize: 14,
                    fontWeight: "600",
                    margin: "0",
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

function LiveEditorPreview() {
  return (
    <BrowserOnly
      fallback={
        <div className="flex h-[32rem] items-center justify-center rounded-xl border border-dashed border-base-300 text-sm text-base-content/70">
          Loading live editor...
        </div>
      }
    >
      {() => {
        const React = require("react") as typeof import("react")
        type ThemeName =
          | "light"
          | "dark"
          | "synthwave"
          | "dim"
          | "lofi"
          | "retro"
        const themeOptions: Array<{ label: string; value: ThemeName }> = [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "Synthwave", value: "synthwave" },
          { label: "Dim", value: "dim" },
          { label: "Lo-fi", value: "lofi" },
          { label: "Retro", value: "retro" },
        ]
        const [theme, setTheme] = React.useState<ThemeName>("dark")
        const {
          CanvasProvider,
          EmailEditor,
        } = require("@react-email-dnd/editor")

        return (
          <div
            id="tw-scope"
            className="flex w-full flex-col gap-3"
            data-theme={theme}
          >
            <div
              className="flex w-full flex-wrap justify-center gap-2 p-2"
              role="toolbar"
              aria-label="Theme selector"
            >
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={clsx(
                    "min-w-[120px] flex-1 basis-[140px] btn btn-sm rounded-full px-4 py-1 text-sm tracking-wide text-neutral transition-colors",
                    {
                      "bg-primary text-primary-content": theme === option.value,
                    },
                    {
                      "bg-neutral text-neutral-content": theme !== option.value,
                    }
                  )}
                  aria-pressed={theme === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="w-full max-h-[32rem] overflow-auto rounded-2xl border border-base-300 bg-primary/10 p-3 shadow-inner">
              <div className="rounded-2xl border border-base-300 bg-primary/10">
                <CanvasProvider
                  initialDocument={demoDocument}
                  onDocumentChange={() => {}}
                  className="flex h-full w-full min-w-0 flex-col"
                >
                  <EmailEditor
                    className="flex h-full w-full flex-col"
                    showHeader={true}
                    daisyui={true}
                    colorMode="primary"
                    // padding={livePaddingPresets}
                    sideBarColumns={1}
                    // colors={["#000000", "#ffffff"]}
                    // textColors={[
                    //   { hex: "#000000", label: "Ink" },
                    //   { hex: "#ffffff", label: "Paper" },
                    // ]}
                    // bgColors={[
                    //   { hex: "#ffffff", label: "Paper" },
                    //   { hex: "#000000", label: "Carbon" },
                    // ]}
                  />
                </CanvasProvider>
              </div>
            </div>
          </div>
        )
      }}
    </BrowserOnly>
  )
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  const themeConfig = siteConfig.themeConfig as {
    navbar?: { logo?: { srcDark?: string } }
  }
  return (
    <header className="bg-primary py-[clamp(3.5rem,8vw,6rem)]">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col gap-[clamp(2.5rem,6vw,4rem)]">
          <div className="mx-auto flex flex-col items-center px-3 text-center lg:mx-0 lg:items-start lg:px-0 lg:text-left">
            <h1 className="mb-4 inline-flex flex-wrap items-center justify-center gap-3 text-[clamp(2.5rem,4vw,3.75rem)] text-white lg:justify-start">
              {themeConfig.navbar?.logo?.srcDark && (
                <img
                  src={themeConfig.navbar.logo.srcDark}
                  alt={siteConfig.title}
                  className="h-auto w-[clamp(2.25rem,4vw,3rem)] flex-shrink-0"
                />
              )}
              {siteConfig.title}
            </h1>
            <p className="mb-8 text-[clamp(1rem,2.5vw,1.1rem)] leading-[1.7] text-base-content/80">
              Editor, Renderer and utilities to make visual email editing for
              React Email and the Resend framework
            </p>
            <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:items-center lg:justify-start">
              <Link
                className="btn btn-lg btn-neutral text-neutral-content!"
                to="/docs/quickstart"
              >
                Get Started
              </Link>
              <Link
                className="btn btn-lg btn-neutral btn-outline bg-transparent normal-case text-neutral!"
                to="/docs/json-structure"
              >
                Read the docs
              </Link>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-3 px-3 lg:px-0">
            <p className="w-full text-center text-sm uppercase tracking-widest text-base-content/70">
              Working example
            </p>
            <div className="w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-[clamp(0.75rem,3vw,1.25rem)] shadow-2xl">
              <div className="h-[32rem] overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300">
                <LiveEditorPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function CustomizationExamples() {
  return (
    <section className="bg-primary py-[clamp(3rem,7vw,4.5rem)] text-base-content">
      <div className="container mx-auto max-w-screen-xl px-4">
        <h2 className="mb-4 text-3xl">Basic Usage</h2>
        <p className="mb-8 text-center text-base-content/60 md:text-left">
          The Vanilla playground in{" "}
          <code>packages/editor/example/src/Vanilla.tsx</code> wires fonts and
          custom blocks together. These snippets condense that setup for quick
          copy/paste usage.
        </p>
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-6 text-base-content">
            <h3 className="mb-4 mt-0 text-base">
              EmailEditor with monochrome palettes
            </h3>
            <BrowserOnly>
              {() => (
                <CodeBlock
                  language="tsx"
                  title="/src/components/MarketingEditor.tsx"
                  children={editorExample}
                />
              )}
            </BrowserOnly>
          </div>
        </div>
      </div>
    </section>
  )
}

const npmPackages = [
  {
    name: "@react-email-dnd/editor",
    type: "Editor",
    description:
      "Drag-and-drop editor surface, Canvas orchestration, ready UI.",
    href: "https://www.npmjs.com/package/@react-email-dnd/editor",
  },
  {
    name: "@react-email-dnd/renderer",
    type: "Renderer",
    description:
      "Render Canvas documents to HTML, React trees, or text output.",
    href: "https://www.npmjs.com/package/@react-email-dnd/renderer",
  },
  {
    name: "@react-email-dnd/shared",
    type: "Validation & Utilities",
    description: "Shared types, schema validation, and padding/color helpers.",
    href: "https://www.npmjs.com/package/@react-email-dnd/shared",
  },
]

function NpmPackages() {
  return (
    <section className="bg-base-100 py-[clamp(3rem,7vw,4.5rem)] text-base-content">
      <div className="container mx-auto max-w-screen-xl px-4">
        <h2 className="mb-4 text-3xl">Packages on npm</h2>
        <p className="mb-8 text-center text-base-content/60 md:text-left">
          <code>@react-email-dnd</code> is divided up in to multiple packages.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {npmPackages.map((pkg) => (
            <a
              key={pkg.name}
              className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-gradient-to-br from-base-200 to-base-100 p-6 text-base-content no-underline transition hover:-translate-y-1 hover:border-base-300 hover:shadow-2xl"
              href={pkg.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="text-xs uppercase tracking-widest text-base-content/60">
                {pkg.type}
              </span>
              <h3 className="m-0 text-lg text-base-content">{pkg.name}</h3>
              <p className="m-0 text-sm leading-relaxed text-base-content/80">
                {pkg.description}
              </p>
              <span className="mt-auto text-sm text-primary">
                View on npm →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

const customComponentsExample = `import { registerComponent } from '@react-email-dnd/editor';

registerComponent({
  type: 'custom-component',
  label: 'Custom Component',
  icon: 'custom-component',
  component: CustomComponent,
})
`
function CustomComponents() {
  return (
    <section className="bg-base-100 py-[clamp(3rem,7vw,4.5rem)] text-base-content">
      <div className="container mx-auto max-w-screen-xl px-4">
        <h2 className="mb-4 text-3xl">Custom Components</h2>
        <p className="mb-8 text-center text-base-content/60 md:text-left">
          Bring your own packages or convert any existing React Email components
          to be drag-and-droppable.
        </p>

        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-6 text-base-content">
          <h3 className="mb-4 mt-0 text-base">Custom Components</h3>
          <BrowserOnly>
            {() => (
              <CodeBlock
                language="tsx"
                title="/src/components/CustomComponents.tsx"
                children={customComponentsExample}
              />
            )}
          </BrowserOnly>
        </div>
      </div>
    </section>
  )
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="React Email DnD docs"
      description="Authoring and rendering documentation for the React Email drag-and-drop toolkit"
    >
      <div data-theme="dark">
        <HomepageHeader />
        <main>
          <NpmPackages />
          <CustomComponents />
          {/* ´<CustomizationExamples /> */}
        </main>
      </div>
    </Layout>
  )
}
