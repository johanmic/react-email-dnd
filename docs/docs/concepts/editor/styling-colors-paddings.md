---
title: Colors and Paddings
sidebar_position: 3
---

Consistency across email clients demands a constrained styling system. The editor exposes curated controls for colors, spacing, and alignment instead of free-form CSS.

### Color tokens

- **Palette definition**: Provide an array of token objects like `{ "id": "brand.primary", "label": "Brand / Primary", "value": "#5046e5" }`.
- **Usage**: Property schemas reference token `id`s rather than raw hex strings. This keeps the document compact and lets you swap palettes globally.
- **Locking**: Set `locked: true` on mission-critical tokens to prevent edits in the UI. Designers can still override the palette at build time.

### Spacing controls

- **Padding presets**: Expose select controls with values (`none`, `xs`, `sm`, `md`, `lg`) that map to pixel values. The renderer later expands these into inline styles.
- **Directional padding**: When necessary, allow advanced editors to toggle individual sides. The schema can reveal extra fields (`paddingTop`, etc.) behind a "Custom" switch.
- **Minimum targets**: Many email clients strip zero padding on touch devices. Enforce sensible minimums (e.g., 12px vertical) to keep tap targets accessible.

### Responsive hints

Email clients offer limited responsive behavior, but you can still store hints in the JSON:

- `stackMobile`: Signals that multi-column blocks should stack on smaller viewports.
- `hideOnDesktop` / `hideOnMobile`: Booleans handled by the renderer via conditional `<mj-class>` or inline styles.

By constraining colors and paddings at the editor layer, authors get a polished experience without accidentally breaking downstream renderer rules.
