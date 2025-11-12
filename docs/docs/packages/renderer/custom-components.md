---
title: Custom Components
sidebar_position: 1
---

Renderer custom components translate JSON nodes into deliverable markup. Maintain a 1:1 mapping with editor component `type`s to avoid runtime fallbacks.

### Component registry

Create a lookup table that resolves node `type` to a render function:

```ts
const registry: Record<string, RendererComponent> = {
  section: renderSection,
  button: renderButton,
  "price-grid": renderPriceGrid
};

export function renderNode(node: JsonNode) {
  const component = registry[node.type];
  if (!component) {
    return renderFallback(node);
  }
  return component(node);
}
```

- Keep renderers pure: given a node, return markup without mutating global state.
- Support asynchronous data hydration by resolving data before calling `renderNode`.
- Provide a `renderFallback` implementation that surfaces missing component warnings in non-production environments.

### Shared utilities

- **Style helpers**: Expand tokens (colors, spacing) into raw inline styles or MJML attributes.
- **Layout guards**: Validate parent/child relationships so users cannot accidentally send emails with unsupported nesting (e.g., column inside button).
- **Analytics**: Instrument renderers in preview/staging environments to confirm new components behave as expected before production rollout.
