---
title: Basics
sidebar_position: 1
---

The Editor provides a drag-and-drop surface for assembling email layouts. At a high level it:

- loads a catalog of components the author can drop into the layout tree,
- tracks the selection state and exposes property panels for the focused node, and
- persists changes back to the shared JSON document.

### Core data flow

1. **Component palette** — A curated set of blocks is serialized as JSON. Each block entry contains a `type`, default props, and metadata such as visibility rules or grouping.
2. **Canvas** — Dropping a block creates a node instance. The editor normalizes props, assigns a unique `id`, and inserts the node into the JSON tree at the target index.
3. **Inspector panels** — When a node is selected, the editor renders property forms driven by component schemas. Prop updates are written back to the same JSON document incrementally.

Because everything is expressed as JSON, the editor can use optimistic updates, undo stacks, and collaborative cursors without requiring schema transforms.

### Lifecycle hooks

Use editor lifecycle hooks to extend behavior:

- `onChange(document)` fires for any structural or prop change.
- `onSelect(nodeId)` exposes the currently selected node.
- `onPaletteSearch(query)` lets you inject custom search/filter logic for large catalogs.

Hooks should remain pure—returning new state or calling provided callbacks—so that the editor can orchestrate undo/redo and multi-user synchronization deterministically.
