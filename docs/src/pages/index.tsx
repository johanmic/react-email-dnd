import React from "react"
import Layout from "@theme/Layout"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import BrowserOnly from "@docusaurus/BrowserOnly"
import clsx from "clsx"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../../../packages/editor/package.json")

// --- Types ---
type CanvasDocument = {
  version: number
  meta: Record<string, any>
  variables: Record<string, any>
  sections: any[]
}

// --- Error Suppression ---
if (typeof window !== "undefined") {
  const originalConsoleError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    const msg = String(args.join(" "))
    if (msg.includes("ResizeObserver")) return
    originalConsoleError(...args)
  }
}

// --- Demo Document ---
const demoDocument: CanvasDocument = {
  version: 1,
  meta: { title: "Demo", previewText: "Preview" },
  variables: {},
  sections: [
    {
      id: "hero",
      type: "section",
      padding: "20px",
      rows: [
        {
          id: "r1",
          type: "row",
          columns: [
            {
              id: "c1",
              type: "column",
              blocks: [
                {
                  id: "h1",
                  type: "heading",
                  props: {
                    content: "Build perfect emails",
                    as: "h1",
                    fontSize: 32,
                    color: "#ffffff",
                  },
                },
                {
                  id: "t1",
                  type: "text",
                  props: {
                    content: "Drag, drop, and deliver.",
                    color: "#a1a1aa",
                    fontSize: 16,
                  },
                },
                {
                  id: "b1",
                  type: "button",
                  props: {
                    label: "Get Started",
                    backgroundColor: "#fff",
                    color: "#000",
                    padding: "12px 24px",
                    borderRadius: 8,
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

// --- Visual Components ---

const CODE_STRING = `import { Html, Button } from "@react-email/components";

export default function Email() {
  return (
    <Html>
      <Button
        href="https://example.com"
        style={{ color: "#fff", padding: "12px 20px" }}
      >
        Click me
      </Button>
    </Html>
  );
}`

function ReactEmailGridVisual() {
  const components = [
    {
      name: "HTML",
      icon: "ph-fill ph-bounding-box",
      link: "https://react.email/docs/components/html",
    },
    {
      name: "Container",
      icon: "ph-fill ph-bounding-box",
      link: "https://react.email/docs/components/container",
    },
    {
      name: "Section",
      icon: "ph-fill ph-rows",
      link: "https://react.email/docs/components/section",
    },
    {
      name: "Row",
      icon: "ph-fill ph-columns",
      link: "https://react.email/docs/components/row",
    },
    {
      name: "Column",
      icon: "ph-fill ph-rectangle",
      link: "https://react.email/docs/components/column",
    },
    {
      name: "Image",
      icon: "ph-fill ph-image",
      link: "https://react.email/docs/components/image",
    },
    {
      name: "Heading",
      icon: "ph-fill ph-text-h",
      link: "https://react.email/docs/components/heading",
    },
    {
      name: "Text",
      icon: "ph-fill ph-text-aa",
      link: "https://react.email/docs/components/text",
    },
    {
      name: "Divider",
      icon: "ph-fill ph-minus",
      link: "https://react.email/docs/components/divider",
    },
  ]

  return (
    <div className="relative mx-auto max-w-lg p-8">
      <div className="grid grid-cols-2 gap-4 opacity-90 sm:grid-cols-3 transform perspective-1000 rotate-x-12 rotate-z-2">
        {components.map((comp, i) => (
          <a
            href={comp.link}
            target="_blank"
            rel="noreferrer"
            key={comp.name}
            className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1e1e1e] p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary hover:bg-[#1e1e1e] hover:shadow-2xl hover:shadow-primary/20"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-px rounded-xl bg-linear-to-br from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/10">
              <i className={clsx(comp.icon, "text-2xl")} />
            </div>
            <span className="relative font-mono text-xs font-medium text-white/60 transition-colors group-hover:text-primary">
              {`<${comp.name} />`}
            </span>
          </a>
        ))}
      </div>
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 bg-linear-to-tr from-purple-500/10 via-transparent to-primary/10 blur-3xl" />
    </div>
  )
}

function DaisyUIThemeVisual() {
  const colors = [
    { name: "primary", hex: "#6419e6", bg: "bg-primary" },
    { name: "secondary", hex: "#d926a9", bg: "bg-secondary" },
    { name: "accent", hex: "#1fb2a6", bg: "bg-accent" },
    { name: "neutral", hex: "#2a323c", bg: "bg-neutral" },
  ]

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[#111] p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-white">Theme Config</span>
        </div>
        <span className="font-mono text-xs text-white/40">daisyui.json</span>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {colors.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2"
          >
            <div className={clsx("h-8 w-8 rounded-md shadow-sm", c.bg)} />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/80">
                {c.name}
              </span>
              <span className="font-mono text-[10px] text-white/40">
                {c.hex}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-3/4 bg-linear-to-r from-primary to-secondary" />
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white">
            Save
          </button>
          <button className="rounded-md border border-white/20 bg-[#111] px-4 py-1.5 text-xs font-medium text-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function CustomComponentVisual() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:gap-8">
      {/* Code Side */}
      <div className="group relative w-full flex-1">
        <div className="absolute -inset-0.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-600 blur opacity-20 transition duration-1000 group-hover:opacity-40" />
        <div className="relative rounded-lg border border-white/10 bg-[#1e1e1e] p-5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-[10px] text-white/40">
              Product.tsx
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
          </div>
          <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
            <div className="text-purple-400">
              export const <span className="text-yellow-200">Product</span> = (
              <span className="text-orange-300">props</span>) ={">"}
            </div>
            <div className="pl-2 text-white/60">{"<Container>"}</div>
            <div className="pl-4 text-blue-300">
              {"<Img src={props.img} />"}
            </div>
            <div className="pl-4 text-blue-300">
              {"<Text>{props.title}</Text>"}
            </div>
            <div className="pl-2 text-white/60">{"</Container>"}</div>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="hidden text-white/20 sm:block">
        <i className="ph-bold ph-arrow-right text-2xl" />
      </div>
      <div className="block text-white/20 sm:hidden">
        <i className="ph-bold ph-arrow-down text-2xl" />
      </div>

      {/* Editor Side */}
      <div className="w-full flex-1">
        <div className="rounded-lg border border-white/10 bg-[#111] p-1 shadow-2xl">
          <div className="group relative rounded border border-dashed border-white/20 bg-[#0d0d0d] p-4 transition-colors hover:border-primary/50">
            {/* Floating Label */}
            <div className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white shadow-lg ring-2 ring-[#0d0d0d]">
              <i className="ph-fill ph-cube" />
              <span>Custom Block</span>
            </div>

            <div className="flex items-center gap-4 opacity-90">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-white/5 bg-white/5">
                <i className="ph-fill ph-image text-2xl text-white/20" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-white/20" />
                <div className="h-2 w-1/2 rounded bg-primary/30" />
              </div>
            </div>
          </div>
          {/* Mock Properties */}
          <div className="mt-3 flex gap-2 px-2 pb-1">
            <div className="h-1.5 w-16 rounded bg-white/10" />
            <div className="h-1.5 w-8 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Live Editor Wrapper ---
function Editor() {
  const { CanvasProvider, EmailEditor } = require("@react-email-dnd/editor")
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 bg-neutral-800 px-4 py-2">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-4 font-mono text-xs text-white/30">editor.tsx</span>
      </div>
      <div className="relative flex-1 bg-neutral-900">
        <CanvasProvider
          initialDocument={demoDocument}
          onDocumentChange={() => {}}
          className="absolute inset-0 flex flex-col"
        >
          <EmailEditor
            className="flex h-full w-full flex-col"
            showHeader={false}
            daisyui={true}
            colorMode="primary"
            sideBarColumns={1}
          />
        </CanvasProvider>
      </div>
    </div>
  )
}

function LiveEditorPreview() {
  return (
    <BrowserOnly
      fallback={
        <div className="flex h-96 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 font-mono text-sm text-white/30">
          Loading...
        </div>
      }
    >
      {() => <Editor />}
    </BrowserOnly>
  )
}

// --- Sections ---
function Header() {
  return (
    <header className="relative bg-[#0d0d0d] py-24 lg:py-32" data-theme="dark">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-purple-500/20 opacity-50 blur-[120px] mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[600px] w-[800px] rounded-full bg-primary/10 opacity-30 blur-[100px]" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex cursor-default items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 transition-transform hover:scale-105 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs font-medium tracking-wide text-white/80">
              v{version} Beta Available
            </span>
          </div>

          <h1 className="mb-6 font-display text-3xl text-white drop-shadow-2xl tracking-tight md:text-4xl">
            React Email <br className="md:hidden" />
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              Drag & Drop
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl">
            A highly customizable drag and drop email editor that renders to
            React Email. Build Transactional or Marketing emails with ease.
          </p>

          <div className="w-full max-w-5xl perspective-1000">
            <div className="relative h-[500px] w-full transform rounded-xl bg-[#111] shadow-2xl ring-1 ring-white/10 transition-transform duration-500 hover:rotate-x-1 md:h-[600px]">
              <LiveEditorPreview />
            </div>
            <div className="absolute -bottom-4 left-4 right-4 -z-10 h-24 bg-gradient-to-b from-purple-500/10 to-transparent blur-2xl" />
          </div>
        </div>
      </div>
    </header>
  )
}

function FeatureSection({
  title,
  description,
  link,
  icon,
  visual,
  align = "left",
  isLast = false,
}: {
  title: string
  description: React.ReactNode
  link: string
  icon: string
  visual: React.ReactNode
  align?: "left" | "right"
  isLast?: boolean
}) {
  return (
    <section className={clsx("relative py-24 lg:py-32", "bg-[#0d0d0d]")}>
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      )}
      <div className="container mx-auto max-w-6xl px-4">
        <div
          className={clsx(
            "flex flex-col items-center gap-16 lg:gap-24",
            align === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
          )}
        >
          <div className="z-10 flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white shadow-inner">
              <i className={clsx(icon, "text-2xl")} />
            </div>
            <h2 className="mb-4 font-display text-3xl leading-tight text-white md:text-4xl">
              {title}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white/60">
              {description}
            </p>
            <Link
              to={link}
              className="group inline-flex items-center font-medium text-primary! transition-colors hover:text-white/80 hover:no-underline"
            >
              Learn more{" "}
              <i className="ph-bold ph-arrow-right ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="w-full flex-1 perspective-1000">
            <div
              className={clsx(
                "relative transform transition-all duration-700",
                align === "left" ? "rotate-y-3" : "-rotate-y-3"
              )}
            >
              <div className="absolute inset-0 -z-10 rounded-full bg-white/5 blur-[60px] opacity-20" />
              {visual}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureBlocks() {
  return (
    <div className="bg-[#0d0d0d]">
      <FeatureSection
        align="left"
        title="Built on React Email"
        icon="ph-fill ph-code"
        link="https://react.email"
        visual={<ReactEmailGridVisual />}
        description={
          <>
            The editor outputs standard{" "}
            <strong className="text-white">React Email</strong> structures that
            can be rendered with your existing render pipeline.
          </>
        }
      />
      <FeatureSection
        align="right"
        title="Theming with DaisyUI"
        icon="ph-fill ph-palette"
        link="/docs/packages/renderer/daisyui"
        visual={<DaisyUIThemeVisual />}
        description={
          <>
            Integrate with your existing DaisyUI themes both in editor and your
            outcome emails.
          </>
        }
      />
      <FeatureSection
        isLast
        align="left"
        title="Custom Components"
        icon="ph-fill ph-shapes"
        link="/docs/custom-components"
        visual={<CustomComponentVisual />}
        description="Need a complex product picker or a dynamic chart? Create custom blocks in React and expose them to the editor with a simple schema."
      />
    </div>
  )
}

function NpmPackages() {
  const packages = [
    {
      name: "@react-email-dnd/editor",
      role: "The Interface",
      desc: "A complete drag-and-drop authoring environment. Handles canvas state, drag interactions, property panels, and selection logic.",
      icon: "ph-fill ph-pencil-simple",
    },
    {
      name: "@react-email-dnd/renderer",
      role: "The Output",
      desc: "Takes the JSON document and transforms it into production-ready HTML or React components. Manages styles, fonts, and compatibility.",
      icon: "ph-fill ph-code",
    },
    {
      name: "@react-email-dnd/shared",
      role: "The Contract",
      desc: "Contains the core type definitions, validation schemas, and utility functions that ensure the editor and renderer speak the same language.",
      icon: "ph-fill ph-share-network",
    },
  ]

  return (
    <section className="border-t border-white/10 bg-[#111] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h3 className="mb-4 font-display text-3xl text-white">
            Install the primitives
          </h3>
          <p className="text-white/60">
            Everything you need to build your own email editor, split into
            modular packages.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <a
              key={pkg.name}
              href={`https://www.npmjs.com/package/${pkg.name}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-2xl border text-primary! border-white/5 bg-white/5 p-8 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:no-underline!"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary! ring-1 ring-primary/20 group-hover:bg-primary/20 group-hover:text-primary!">
                <i className={clsx(pkg.icon, "text-2xl")} />
              </div>

              <div className="mb-2 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                  {pkg.role}
                </span>
              </div>

              <h4 className="mb-3 font-mono text-sm font-semibold text-white group-hover:text-primary! transition-colors">
                {pkg.name}
              </h4>

              <p className="text-sm leading-relaxed text-white/60">
                {pkg.desc}
              </p>

              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 transition-all duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home(): JSX.Element {
  React.useEffect(() => {
    // Load icons
    const loadCSS = (href: string) => {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      document.head.appendChild(link)
    }
    loadCSS(
      "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css"
    )
    loadCSS(
      "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/bold/style.css"
    )
  }, [])

  return (
    <Layout
      title="React Email DnD"
      description="The visual builder for React Email"
    >
      <div
        id="tw-scope"
        className="min-h-screen overflow-x-hidden bg-[#0d0d0d] font-sans selection:bg-purple-500/30 selection:text-purple-200"
      >
        <Header />
        <main data-theme="dark">
          <FeatureBlocks />
          <NpmPackages />
        </main>
      </div>
    </Layout>
  )
}
