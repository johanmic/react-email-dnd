# @react-email-dnd/shared

Shared JSON schema types, Zod validators, and helper utilities that keep the `@react-email-dnd` **Editor** and **Renderer** in sync. As highlighted in the [docs overview](https://react-email-dnd-docs.vercel.app/docs/intro), the entire drag-and-drop system revolves around a single Canvas document definition—this package publishes that contract.

## What lives here?

- `schema.ts` provides the canonical `CanvasDocument` schema plus helpers such as `parseCanvasDocument`, `safeParseCanvasDocument`, and `validateCanvasDocument`.
- Block prop schemas (text, button, heading, image, divider, custom) power form generation inside the editor and let renderers trust their input.
- Builder-facing helpers like `createCustomBlockDefinition` keep TypeScript inference working when you add bespoke blocks.

## Installation

```bash
pnpm add @react-email-dnd/shared
# or
npm install @react-email-dnd/shared
```

Bring it in alongside the editor and renderer packages when following the [Getting Started guide](https://react-email-dnd-docs.vercel.app/docs/getting-started).

## Basic usage

```ts
import {
  canvasDocumentSchema,
  createCustomBlockDefinition,
  parseCanvasDocument,
  type CanvasDocument,
} from "@react-email-dnd/shared"

const doc = parseCanvasDocument(input) // throws on invalid payloads

export const footerBlock = createCustomBlockDefinition({
  id: "footer",
  label: "Footer",
  icon: FooterIcon,
  defaults: {
    componentName: "Footer",
    props: { locale: "en" },
  },
  component: Footer,
})
```

## Validation helpers

- `parseCanvasDocument(input)` – validates and returns a typed `CanvasDocument` or throws with rich Zod errors.
- `safeParseCanvasDocument(input)` – same as above but returns `{ success, data | error }`.
- `validateCanvasDocument(input)` – ergonomic wrapper used by the editor/renderer to gate incoming data.

## Development

- `pnpm --filter @react-email-dnd/shared build` compiles the package via `tsup`.
- `pnpm --filter @react-email-dnd/shared test` runs the Jest suite inside `packages/shared/tests`.

Need more context? The canonical architecture and package roles are documented in `docs/docs/intro.md` and the related guides under `docs/docs/json-structure.md` and `docs/docs/variables.md`.
