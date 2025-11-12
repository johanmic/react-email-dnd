---
title: Fonts
sidebar_position: 4
---

Email typography is limited by client support, so the editor surfaces only the font stacks that render reliably across providers.

### Font packs

Define a `fonts` array when instantiating the editor:

```ts
const editor = createEditor({
  fonts: [
    {
      id: "inter",
      label: "Inter",
      stack: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      weights: ["400", "600", "700"]
    },
    {
      id: "georgia",
      label: "Georgia",
      stack: "Georgia, serif",
      weights: ["400"]
    }
  ]
});
```

- `id` travels with the JSON so the renderer can resolve the same stack.
- `weights` limits the choices offered in the property panel. Unsupported weights are hidden entirely.
- To load custom web fonts, pair the editor pack with renderer-level `<style>` injections (see the Renderer > Fonts doc).

### Default typography

Specify `defaultFontId` to ensure every new text node starts with a safe stack. Nodes can override by storing `fontId` in their props.

### Fallback behaviors

When users paste rich text, sanitize incoming font declarations and map them back onto registered `fontId`s. This prevents unexpected inline styles from leaking into the document.
