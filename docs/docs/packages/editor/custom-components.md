---
title: Custom Components
sidebar_position: 5
---

Custom components let teams extend the editor beyond the stock palette while reusing the same drag-and-drop infrastructure.

### Registration flow

1. Implement the component in your renderer (React, MJML, or another output target).
2. Describe the component in the editor registry with a unique `type` and prop defaults.
3. Provide a schema file that lists the editable props plus any validation rules.

```ts
registerComponent({
  type: "price-grid",
  manifest: priceGridManifest,
  schema: priceGridSchema
});
```

### Schema-driven property panels

- Use field types (`text`, `number`, `select`, `color`, `switch`, `repeatable`) to control the UI.
- Add conditional fields with `visibleWhen` so advanced settings stay hidden until needed.
- Attach validation rules (`min`, `max`, `pattern`, `required`) to prevent invalid documents from being persisted.

### Preview rendering

Custom components can provide a lightweight preview renderer that runs inside the editor canvas:

```ts
registerComponent({
  type: "price-grid",
  preview: ({ priceTiers }) => <PriceGridPreview tiers={priceTiers} />
});
```

- Keep previews fast: expensive data fetching should be mocked or memoized.
- Provide sensible fallback states so authors can see what the component looks like before configuring data.

This approach keeps the authoring workflow flexible while guaranteeing that every new component stays compatible with the renderer and JSON schema.
