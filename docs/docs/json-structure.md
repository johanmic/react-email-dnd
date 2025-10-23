---
title: JSON Structure
sidebar_position: 3
---

The document JSON is the contract between the editor and renderer. Every change made in the editor mutates this structure, and the renderer uses it to produce HTML/MJML.

```json
{
  "version": 1,
  "metadata": {
    "locale": "en-US",
    "subject": "Welcome!"
  },
  "document": {
    "id": "root",
    "type": "section",
    "props": {
      "backgroundColor": "brand.primary",
      "padding": "lg"
    },
    "children": [
      {
        "id": "cta-button",
        "type": "button",
        "props": {
          "text": "Confirm email",
          "href": "https://example.com/verify",
          "fontId": "inter",
          "paddingX": "md",
          "paddingY": "sm"
        }
      }
    ]
  }
}
```

### Top-level fields

- `version`: Increment when introducing breaking schema changes so clients can migrate safely.
- `metadata`: Optional contextual info (subject line, preview text, experiment ids). Keep this shallow and renderer-agnostic.
- `document`: Root node that contains the layout tree.

### Nodes

Each node has a consistent shape:

| Field | Purpose |
| --- | --- |
| `id` | Unique identifier used for selection, diffing, and collaboration. |
| `type` | Matches a registered component type in both editor and renderer. |
| `props` | Serializes component inputs. Types are primitives, tokens, or small objects only. |
| `children` | Optional array of child nodes for droppable components. |

### Extensions

- **Data bindings**: Store data source references under `props.data` or a dedicated namespace. Keep remote payloads out of the document to avoid size bloat.
- **Experiments**: Add a `flags` map to nodes when you need conditional rendering. The renderer can read the map and decide whether to include a node.
- **Auditing**: Track modifications with `document.changelog` entries (e.g., `[{ "nodeId": "...", "userId": "...", "timestamp": "..." }]`) for compliance workflows.

When evolving the schema, ship migration code that upgrades older documents in memory before handing them to the renderer. This keeps historic campaigns editable without blocking new functionality.
