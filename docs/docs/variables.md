# Variables

Emails often need to hydrate user-specific data such as `{{recipient.name}}` or
`{{event.location.name}}`. The editor and renderer collaborate to make these
placeholders safe and discoverable.

## Defining Variables in the Editor

1. Open the Variables section in the sidebar and create key/value pairs. Nested
   paths can be represented with dot notation (for example `event.name`).
2. In any text, heading, button, or image field, use the variable picker to
   insert a placeholder like `{{event.name}}`.
3. When a field contains placeholders, the new **Variables detected** box shows
   each key and whether it currently exists. Missing values are flagged so you
   can add them before exporting.
4. Blocks on the canvas display a curly-brace badge whenever placeholders are
   present. Hover to see all keys referenced inside that block.

These cues ensure template authors always know which variables still need
values.

<img src="/img/variables.png" alt="Variable validation in the editor" width="300" />

## Rendering With Variables

At render-time you pass data via `options.variables`. The resolver supports
nested paths, arrays, and can enforce strict guarantees using the
`throwOnMissingVariables` flag.

```ts
import { renderDocument } from "@react-email-dnd/renderer"

const { html } = renderDocument({
  document,
  options: {
    format: "html",
    variables: {
      recipient: { name: "Riley" },
      event: { name: "React Summit" },
    },
    throwOnMissingVariables: true,
  },
})
```

- `variables` can contain any serializable data. Arrays and nested objects can
  be accessed with dot notation (`{{recipient.name}}`, `{{agenda.0.topic}}`).
- When `throwOnMissingVariables` is `true`, the renderer raises an error if any
  placeholder lacks a value. Disable it to keep unresolved placeholders intact.

## Runtime Variables and Custom Blocks

Dynamic variables passed to `CanvasProvider` override the saved document
variables and are also exposed to custom block components. This lets you preview
and render templates with live data without mutating the document itself.

```tsx
<CanvasProvider initialDocument={doc} variables={{ preview_only: "Hello" }}>
  <EmailEditor />
</CanvasProvider>
```

Combine runtime variables with the renderer options to keep previews and final
output in sync.
