---
title: Basics
sidebar_position: 1
---

> **Package:** `@react-email-dnd/editor` | **File:** `basics.md`

The Editor provides a drag-and-drop surface for assembling email layouts. At a high level it:

- loads a catalog of components the author can drop into the layout tree,
- tracks the selection state and exposes property panels for the focused node, and
- persists changes back to the shared JSON document.

### Layout shell

The UI is split across three persistent regions so authors never lose context:

- **Sidebar** — lists every available block, variable, and document outline entry. It drives drag-and-drop and quick navigation.
- **Canvas** — shows the live document with drag handles, drop indicators, and keyboard shortcuts for rearranging content.
- **Properties panel** — renders smart forms for the selected block, section, row, or column. It synchronizes with the shared schema and exposes variables, uploads, and conditional props.
- **Header** — surfaces document-level actions such as undo/redo, preview mode toggles, save state, and custom buttons you register.

Each area consumes the same store, so selections, preview mode changes, and async uploads stay synchronized regardless of where they originate.

### Core data flow

1. **Component palette** — A curated set of blocks is serialized as JSON. Each block entry contains a `type`, default props, and metadata such as visibility rules or grouping.
2. **Canvas** — Dropping a block creates a node instance. The editor normalizes props, assigns a unique `id`, and inserts the node into the JSON tree at the target index.
3. **Inspector panels** — When a node is selected, the editor renders property forms driven by component schemas. Prop updates are written back to the same JSON document incrementally.

Because everything is expressed as JSON, the editor can use optimistic updates, undo stacks, and collaborative cursors without requiring schema transforms.

### Canvas context

All editor components sit inside the `CanvasProvider`, which exposes a strongly typed React context. You can tap into it with the `useCanvasStore()` hook to:

- Inspect the current `document`, `selectedBlock`, or `selectedContainer`.
- Dispatch mutations such as `setDocument`, `updateBlockProps`, `setPreviewMode`, or `upsertVariable`.
- Wire custom buttons in the header that call `save()` or perform side-effectful actions.
- Provide your own `uploadFile` handler or inject runtime `variables` that show up in block inspectors.

Because the context is public, you can compose your own UI around the editor—render read-only previews, trigger analytics, or synchronize with collaboration backends—without forking the core package.

### Lifecycle hooks

Use editor lifecycle hooks to extend behavior:

- `onChange(document)` fires for any structural or prop change.
- `onSelect(nodeId)` exposes the currently selected node.
- `onPaletteSearch(query)` lets you inject custom search/filter logic for large catalogs.

Hooks should remain pure—returning new state or calling provided callbacks—so that the editor can orchestrate undo/redo and multi-user synchronization deterministically.
