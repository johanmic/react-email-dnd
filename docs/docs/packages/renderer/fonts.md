---
title: Fonts
sidebar_position: 2
---

Renderer font management mirrors the packs exposed in the editor so that typography stays consistent in the final output.

### Resolving editor font IDs

Each text node stores a `fontId`. The renderer should translate that into a full font stack and any required external assets:

```ts
const FONT_MAP = {
  inter: {
    stack: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    import: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
  },
  georgia: {
    stack: "Georgia, serif"
  }
};

function resolveFont(node: TextNode) {
  const font = FONT_MAP[node.props.fontId ?? "inter"];
  return {
    stack: font.stack,
    importHref: font.import
  };
}
```

- Default to a safe stack when `fontId` is missing so legacy documents remain valid.
- Cache remote font imports and inject them once per rendering pass to avoid duplication.

### Inline styles vs MJML

- When targeting raw HTML, set `style="font-family: ..."` directly on elements.
- For MJML output, create reusable classes (`<mj-class>`) from the same font stacks and reuse them across components.

### Client limitations

Remember that popular email clients (Outlook desktop, Gmail mobile) selectively block web fonts. Always specify a robust fallback stack and avoid depending on custom font weights that do not have good fallback equivalents.
