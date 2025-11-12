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

import styles from "./index.module.css"

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
                    content: "Build monochrome-perfect campaigns",
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
                      "Drag, customize, and ship email layouts with the exact tokens your brand approves - no green gradients, ever.",
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
        <div className={styles.exampleFallback}>Loading live editor...</div>
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
          <div id="tw-scope">
            <div
              className={styles.themeControls}
              role="toolbar"
              aria-label="Theme selector"
            >
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={clsx(styles.themeButton, {
                    [styles.themeButtonActive]: theme === option.value,
                  })}
                  aria-pressed={theme === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div
              className="max-h-[600px] bg-base-300 overflow-y-auto"
              data-theme={theme}
            >
              <div className="bg-base-300">
                <CanvasProvider
                  initialDocument={demoDocument}
                  onDocumentChange={() => {}}
                  className={styles.canvasProvider}
                >
                  <EmailEditor
                    // className={styles.embeddedEditor}
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
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {siteConfig.themeConfig.navbar?.logo?.srcDark && (
                <img
                  src={siteConfig.themeConfig.navbar.logo.srcDark}
                  alt={siteConfig.title}
                  className={styles.heroLogo}
                />
              )}
              {siteConfig.title}
            </h1>
            <p className={styles.heroSubtitle}>
              Editor, Renderer and utilities to make visual email editing for
              React Email and the Resend framework
            </p>
            <div className={styles.heroButtons}>
              <Link
                className={clsx("button button--lg", styles.ctaButton)}
                to="/docs/quickstart"
              >
                Get Started
              </Link>
              <Link
                className={clsx("button button--lg", styles.ghostButton)}
                to="/docs/json-structure"
              >
                Read the docs
              </Link>
            </div>
            <p className={styles.heroMeta}>
              Ships as separate packages for editor, renderer, and shared
              utilities.
            </p>
          </div>
          <div className={styles.heroExample}>
            <p className={styles.heroExampleLabel}>Working example</p>
            <div className={styles.exampleShell}>
              <LiveEditorPreview />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function CustomizationExamples() {
  return (
    <section className={clsx(styles.section, styles.sectionDark)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Basic Usage</h2>
        <p className={styles.sectionSubtitle}>
          The Vanilla playground in{" "}
          <code>packages/editor/example/src/Vanilla.tsx</code> wires fonts and
          custom blocks together. These snippets condense that setup for quick
          copy/paste usage.
        </p>
        <div className={styles.codeSplit}>
          <div className={styles.codePanel}>
            <h3>EmailEditor with monochrome palettes</h3>
            <CodeBlock
              language="tsx"
              title="/src/components/MarketingEditor.tsx"
              children={editorExample}
            />
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
    <section className={clsx(styles.section, styles.sectionDark)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Packages on npm</h2>
        <p className={styles.sectionSubtitle}>
          Explore the full toolkit under the <code>@react-email-dnd</code>{" "}
          scope. Mix the editor, renderer, and shared contracts in any project.
        </p>
        <div className={styles.npmGrid}>
          {npmPackages.map((pkg) => (
            <a
              key={pkg.name}
              className={styles.npmCard}
              href={pkg.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.npmEyebrow}>{pkg.type}</span>
              <h3 className={styles.npmTitle}>{pkg.name}</h3>
              <p className={styles.npmDescription}>{pkg.description}</p>
              <span className={styles.npmLink}>View on npm →</span>
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
    <section className={clsx(styles.section, styles.sectionDark)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Custom Components</h2>
        <p className={styles.sectionSubtitle}>
          Bring your own packages or convert any existing React Email components
          to be drag-and-droppable.
        </p>

        <div className={styles.codePanel}>
          <h3>Custom Components</h3>
          <CodeBlock
            language="tsx"
            title="/src/components/CustomComponents.tsx"
            children={customComponentsExample}
          />
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
      <HomepageHeader />
      <main>
        <NpmPackages />
        <CustomComponents />
        {/* ´<CustomizationExamples /> */}
      </main>
    </Layout>
  )
}
