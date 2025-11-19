# Renderer Props

## renderDocument

The main function for rendering a `CanvasDocument` into various output formats.

```typescript
function renderDocument({ document, options }: RenderRequest): RenderResult
```

### Parameters

| Parameter  | Type              | Description                         |
| ---------- | ----------------- | ----------------------------------- |
| `document` | `CanvasDocument`  | The canvas document to render       |
| `options`  | `RendererOptions` | Rendering options and configuration |

### Returns

Returns a `RenderResult` object that varies based on the requested format.

## RenderRequest

The request object passed to `renderDocument`.

| Property   | Type              | Description                         |
| ---------- | ----------------- | ----------------------------------- |
| `document` | `CanvasDocument`  | The canvas document to render       |
| `options`  | `RendererOptions` | Rendering options and configuration |

## RendererOptions

Configuration options for rendering documents.

| Property        | Type                      | Default | Description                                                                                     |
| --------------- | ------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `format`        | `RendererFormat`          | -       | Determines the output format (required)                                                         |
| `variables`     | `Record<string, unknown>` | -       | Optional variables used when substituting placeholders like `{{first_name}}` or `{{club.name}}` |
| `throwOnMissingVariables` | `boolean`              | `false` | When true, throw an error if a placeholder cannot be resolved with the provided variables       |
| `indent`        | `number`                  | -       | Optional indentation width for string outputs (HTML, react-text, plain-text)                    |
| `componentName` | `string`                  | -       | Optional component name used for react-text output (defaults to `EmailTemplate`)                |
| `customBlocks`  | `CustomBlockRegistry`     | -       | Optional registry of custom blocks for React rendering                                          |
| `daisyui`       | `boolean`                 | -       | When true, enable Tailwind config injection for daisyUI theming                                 |
| `theme`         | `Record<string, string>`  | -       | Optional theme colors to inject into Tailwind config when daisyui is enabled                    |
| `colors`        | `ColorOption[]`           | -       | Optional high-level color palette (hex/class/label) used to extend Tailwind theme colors        |

## RenderResult

The result object returned by `renderDocument`. The structure varies based on the requested format.

### React Format

```typescript
{
  format: "react"
  node: ReactElement
}
```

Returns a React element that can be rendered directly.

### React Text Format

```typescript
{
  format: "react-text"
  code: string
}
```

Returns the React component code as a string.

### HTML Format

```typescript
{
  format: "html"
  html: string
}
```

Returns the rendered HTML as a string. When `daisyui` is enabled, includes base styles in a `<style>` tag.

### Plain Text Format

```typescript
{
  format: "plain-text"
  text: string
}
```

Returns the plain text version of the email.

## Type Definitions

### RendererFormat

```typescript
type RendererFormat = "react" | "react-text" | "html" | "plain-text"
```

Available output formats:

- `"react"`: Returns a React element
- `"react-text"`: Returns React component code as a string
- `"html"`: Returns HTML string
- `"plain-text"`: Returns plain text string

### RenderContext

```typescript
interface RenderContext {
  variables?: Record<string, unknown>
  throwOnMissingVariables?: boolean
}
```

Internal context object used during rendering:

- `variables`: Optional variables for placeholder substitution
- `throwOnMissingVariables`: Flag inherited from options so utilities can decide whether to throw

### ColorOption

```typescript
type ColorOption =
  | string
  | {
      hex?: string
      class?: string
      tw?: string
      label?: string
    }
```

A color option can be either:

- A simple string (hex color, CSS color name, etc.)
- An object with:
  - `hex`: Hex color value
  - `class`: CSS class name (e.g., Tailwind/DaisyUI class)
  - `tw`: Tailwind CSS class name
  - `label`: Display label for the color

### CustomBlockRegistry

```typescript
type CustomBlockRegistry = Record<string, CustomBlockDefinition<any>>
```

A registry mapping component names to their custom block definitions. Used to render custom blocks in React output.

### CanvasDocument

```typescript
type CanvasDocument = {
  meta: DocumentMeta
  sections: CanvasSection[]
  variables?: Record<string, unknown>
  theme?: {
    fonts?: FontDefinition[]
    // ... other theme properties
  }
}
```

The main document structure:

- `meta`: Document metadata (title, description, etc.)
- `sections`: Array of canvas sections
- `variables`: Optional document-level variables
- `theme`: Optional theme configuration including fonts and colors

## Usage Examples

### React Output

```typescript
import { renderDocument } from "@react-email-dnd/renderer"

const result = renderDocument({
  document: myDocument,
  options: {
    format: "react",
    variables: { first_name: "John" },
    customBlocks: myCustomBlockRegistry,
  },
})

// result.node is a ReactElement
```

### HTML Output

```typescript
const result = renderDocument({
  document: myDocument,
  options: {
    format: "html",
    indent: 2,
    daisyui: true,
    colors: [
      { hex: "#3b82f6", label: "Primary Blue" },
      { hex: "#10b981", label: "Success Green" },
    ],
  },
})

// result.html is a string containing the HTML
```

### React Text Output

```typescript
const result = renderDocument({
  document: myDocument,
  options: {
    format: "react-text",
    componentName: "MyEmailTemplate",
    indent: 2,
  },
})

// result.code is a string containing the React component code
```

### Plain Text Output

```typescript
const result = renderDocument({
  document: myDocument,
  options: {
    format: "plain-text",
    variables: { company_name: "Acme Corp" },
  },
})

// result.text is a string containing the plain text
```
