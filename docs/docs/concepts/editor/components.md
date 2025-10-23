---
title: Components
sidebar_position: 2
---

Editor components represent draggable building blocks such as sections, columns, buttons, and text blocks. Each component is described by a small manifest:

```json
{
  "type": "button",
  "label": "Button",
  "group": "Basic",
  "icon": "button",
  "defaults": {
    "text": "Call to action",
    "variant": "primary",
    "align": "center"
  },
  "schema": "./schemas/button.json"
}
```

Key ideas:

- **Type** must be stable because it is used across the editor, renderer, and JSON schema.
- **Defaults** are merged into new instances so authors always start with a valid node.
- **Schema** files describe the property panel layout, prop validations, and guard rails.
- **Groups** and **icons** help authors discover components quickly in the palette.

Use component manifests to expose additional behaviors:

- `droppable`: whether the block can contain children.
- `repeatable`: whether multiple instances are allowed in siblings (useful for layout guards).
- `experimental`: flag bleeding-edge components to hide them behind feature toggles.

When adding new components, update both the palette registry and the renderer mapping to keep parity between authoring and delivery.
