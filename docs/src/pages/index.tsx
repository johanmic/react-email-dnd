import React from "react"
import type { JSX } from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
// import CodeBlock from "@theme/CodeBlock"
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

function LiveEditor() {
  const React = require("react") as typeof import("react")
  const { CanvasProvider, EmailEditor } = require("@react-email-dnd/editor")

  type ThemeName = "light" | "dark" | "synthwave" | "dim" | "lofi" | "retro"

  const themeOptions: Array<{ label: string; value: ThemeName }> = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "Synthwave", value: "synthwave" },
    { label: "Dim", value: "dim" },
    { label: "Lo-fi", value: "lofi" },
    { label: "Retro", value: "retro" },
  ]
  const [theme, setTheme] = React.useState<ThemeName>("dark")

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
      <div className="w-full  overflow-auto rounded-2xl border border-base-300 bg-primary/10 p-3 shadow-inner">
        <div className="rounded-2xl border border-base-300 bg-primary/10 p-2">
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
}

function LiveEditorPreview() {
  return (
    <BrowserOnly
      fallback={
        <div className="flex h-128 items-center justify-center rounded-xl border border-dashed border-base-300 text-sm text-base-content/70">
          Loading live editor...
        </div>
      }
    >
      {() => <LiveEditor />}
    </BrowserOnly>
  )
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  const themeConfig = siteConfig.themeConfig as {
    navbar?: { logo?: { src?: string; srcDark?: string } }
  }
  return (
    <header className="bg-primary py-[clamp(3.5rem,8vw,6rem)]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-[clamp(2.5rem,6vw,4rem)]">
          <div className="mx-auto flex flex-col items-center px-3 text-center">
            <h1 className="mb-4 inline-flex flex-wrap items-center justify-center gap-2 text-white text-5xl md:text-6xl font-display">
              {themeConfig.navbar?.logo?.src && (
                <img
                  src={themeConfig.navbar.logo.src}
                  alt={siteConfig.title}
                  className="h-auto w-16 md:w-28"
                />
              )}
              {siteConfig.title}
            </h1>
            <div className="mb-6 text-xs font-bold text-primary-content/80 uppercase tracking-widest border border-primary-content/30 rounded-full px-3 py-1">
              Beta Release
            </div>
            <p className="mb-8 text-center max-w-2xl mx-auto leading-[1.7] text-xl text-primary-content/90">
              The drag-and-drop email editor for React applications. 
              Built on React Email, powered by standard JSON, and styled with DaisyUI.
            </p>
            <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row no-underline!">
              <Link
                className="btn btn-lg btn-neutral rounded-full text-neutral-content! no-underline! px-8"
                to="/docs/quickstart"
              >
                Get Started
              </Link>
              <Link
                className="btn btn-lg! btn-outline! text-white! hover:bg-white! hover:text-primary! no-underline! rounded-full border-white!"
                to="/docs/intro"
              >
                Read Documentation
              </Link>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-3 px-3 lg:px-0">
            <p className="w-full text-center text-sm uppercase tracking-widest text-primary-content/60 font-semibold">
              Interactive Demo
            </p>
            <div className="w-full overflow-hidden rounded-2xl border border-white/20 bg-base-100 p-[clamp(0.75rem,3vw,1.25rem)] shadow-2xl">
              <div className="h-192 md:h-128 overflow-hidden rounded-xl bg-linear-to-br from-base-200 to-base-300">
                <LiveEditorPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
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
    type: "Shared",
    description: "Shared types, schema validation, and padding/color helpers.",
    href: "https://www.npmjs.com/package/@react-email-dnd/shared",
  },
]

function NpmPackages() {
  return (
    <section className="bg-base-100 py-16 text-base-content border-t border-base-200">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="mb-12 text-center text-3xl font-display text-primary">Packages</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {npmPackages.map((pkg) => (
            <a
              key={pkg.name}
              className="card card-compact bg-base-200 hover:bg-base-300 transition-colors border border-base-300 p-6 no-underline! group"
              href={pkg.href}
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 group-hover:text-primary transition-colors">
                  {pkg.type}
                </span>
                <i className="ph-bold ph-arrow-up-right text-base-content/30 group-hover:text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-base-content group-hover:text-primary transition-colors font-mono text-sm">
                {pkg.name}
              </h3>
              <p className="text-sm text-base-content/70">
                {pkg.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: "ph-fill ph-atom",
      title: "Built on React Email",
      link: "https://react.email",
      external: true,
      description: (
        <>
          The output uses standard{" "}
          <span className="font-semibold text-primary">React Email</span>{" "}
          components. Generate clean, responsive email code that works across clients.
        </>
      ),
    },
    {
      icon: "ph-fill ph-palette",
      title: "DaisyUI Themes",
      link: "/docs/packages/renderer/daisyui",
      description: (
        <>
          Customize the editor and use{" "}
          <span className="font-semibold text-secondary">DaisyUI</span> themes in
          your emails. Bring your design system directly into the email builder.
        </>
      ),
    },
    {
      icon: "ph-fill ph-cube-transparent",
      title: "Custom Components",
      link: "/docs/custom-components",
      description: (
        <>
          Create custom components from any React Email component or existing email.
          Extend the editor with your own blocks.
        </>
      ),
    },
  ]

  return (
    <section className="bg-base-200 py-24 text-base-content">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display mb-6">
            Why React Email DnD?
          </h2>
          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            A complete toolkit for building visual email editors.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              to={feature.link}
              key={feature.title}
              target={feature.external ? "_blank" : undefined}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 no-underline! text-inherit border border-base-300"
            >
              <div className="card-body items-center text-center p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <i
                    className={clsx(feature.icon, "text-4xl")}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="card-title text-2xl mb-3 font-display">{feature.title}</h3>
                <p className="text-base leading-relaxed text-base-content/70">
                  {feature.description}
                </p>
                <div className="card-actions mt-6">
                  <span className="btn btn-ghost btn-sm text-primary gap-2">
                    Learn more <i className="ph-bold ph-arrow-right" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home(): JSX.Element {
  // Load Phosphor Icons web font
  React.useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.type = "text/css"
    link.href =
      "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css"
    document.head.appendChild(link)
    
    const linkBold = document.createElement("link")
    linkBold.rel = "stylesheet"
    linkBold.type = "text/css"
    linkBold.href =
      "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/bold/style.css"
    document.head.appendChild(linkBold)

    // return () => {
    //   document.head.removeChild(link)
    // }
  }, [])

  return (
    <Layout
      title="React Email DnD"
      description="Drag-and-drop email builder for React applications"
    >
      <div data-theme="dark" className="font-sans">
        <HomepageHeader />
        <main>
          <Features />
          <NpmPackages />
        </main>
      </div>
    </Layout>
  )
}