# @react-email-dnd/renderer

The rendering engine for React Email DND. This package takes the JSON document structure produced by the editor and transforms it into various formats including React components, HTML strings, and plain text.

## Installation

```bash
pnpm add @react-email-dnd/renderer
bun add @react-email-dnd/renderer
yarn add @react-email-dnd/renderer
npm install @react-email-dnd/renderer
```

## Usage

The main entry point is the `renderDocument` function. It accepts a document (JSON) and an options object.

```typescript
import { renderDocument } from '@react-email-dnd/renderer';
import type { CanvasDocument } from '@react-email-dnd/shared';

// Your JSON document from the editor
const document: CanvasDocument = { ... };

const result = renderDocument({
  document,
  options: {
    format: 'html',
    variables: {
      first_name: 'Alice',
    },
  },
});

if (result.format === 'html') {
  console.log(result.html);
}
```

## API

### `renderDocument(request: RenderRequest): RenderResult`

Transforms a `CanvasDocument` into the requested format.

#### `RenderRequest`

| Property   | Type              | Description                              |
| ---------- | ----------------- | ---------------------------------------- |
| `document` | `CanvasDocument`  | The JSON document structure to render.   |
| `options`  | `RendererOptions` | Configuration for the rendering process. |

#### `RendererOptions`

| Property                  | Type                      | Default | Description                                                                |
| ------------------------- | ------------------------- | ------- | -------------------------------------------------------------------------- |
| `format`                  | `RendererFormat`          | -       | Output format: `'react'`, `'html'`, `'plain-text'`, or `'react-text'`.     |
| `variables`               | `Record<string, unknown>` | `{}`    | Data for variable interpolation (e.g., `{{ user.name }}`).                 |
| `throwOnMissingVariables` | `boolean`                 | `false` | If `true`, throws an error when a variable is used in the doc but missing. |
| `indent`                  | `number`                  | `2`     | Indentation spaces for string outputs (`html`, `react-text`).              |
| `componentName`           | `string`                  | -       | Name of the exported component when using `react-text` format.             |
| `customBlocks`            | `CustomBlockRegistry`     | -       | Registry for rendering custom components defined in the editor.            |
| `daisyui`                 | `boolean`                 | `false` | Enables DaisyUI theming support and CSS injection.                         |
| `theme`                   | `Record<string, string>`  | -       | Key-value pairs for theme colors (extends Tailwind config).                |
| `colors`                  | `ColorOption[]`           | `[]`    | Palette of colors to generate Tailwind classes for (used with DaisyUI).    |

### `RenderResult`

The return type depends on the requested `format`:

- **`react`**: Returns `{ format: 'react', node: ReactElement }`. Useful for previewing in a React app.
- **`html`**: Returns `{ format: 'html', html: string }`. The final HTML string ready for email clients.
- **`plain-text`**: Returns `{ format: 'plain-text', text: string }`. A text-only version of the email.
- **`react-text`**: Returns `{ format: 'react-text', code: string }`. The generated React source code as a string.

## Theming & Customization

The renderer supports DaisyUI and Tailwind-based theming. You can pass a `theme` object or a list of `colors` to generate the necessary CSS styles inline.

```typescript
renderDocument({
  document,
  options: {
    format: "html",
    daisyui: true,
    theme: {
      primary: "#0ea5e9",
      secondary: "#64748b",
    },
  },
})
```

## Custom Blocks

If your document uses custom blocks, you must provide the same registry used in the editor to the renderer so it knows how to render them.

```typescript
import { renderDocument } from "@react-email-dnd/renderer"
import { MyCustomBlock } from "./components/MyCustomBlock"

const customBlocks = {
  MyCustomBlock: {
    component: MyCustomBlock,
    // ... other definition parts
  },
}

renderDocument({
  document,
  options: {
    format: "react",
    customBlocks,
  },
})
```
