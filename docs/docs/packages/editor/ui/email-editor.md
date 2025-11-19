---
title: Email Editor Shell
sidebar_position: 1
description: How the top-level `EmailEditor` component orchestrates the editor experience.
---

The `EmailEditor` component composes the entire drag-and-drop authoring surface. It wires the shared store, drag-and-drop sensors, header actions, sidebar palette, canvas viewport, and the properties panel into one cohesive workspace.

## How rendering flows

1. **State setup** – `EmailEditor` mounts `CanvasProvider`, which exposes the document store, undo history, selection state, and helpers such as `setDocument`, `save`, and `uploadFile`.
2. **UI skeleton** – The shell arranges three columns: the sidebar on the left, the canvas in the centre (via `Main`), and the properties panel anchored to the right.
3. **Drag-and-drop** – Every structural palette item and content block is registered with `@dnd-kit` sensors. Drops on the canvas trigger helpers that mutate the shared document through the provider.
4. **Persistence hooks** – Props such as `initialDocument`, `onDocumentChange`, and `onSave` bridge the editor with your own backend or collaboration layer. `EmailEditor` normalises the document before emitting changes.

## Related source modules

- `packages/editor/src/components/EmailEditor.tsx` — Sets up drag-and-drop sensors, renders the header/sidebar/canvas/properties trio, and dispatches document mutations through the store.
- `packages/editor/src/components/CanvasProvider.tsx` — Owns the document reducer, undo stack, selection state, and exposes `useCanvasStore()` for accessing editor APIs anywhere in the tree.
- `packages/editor/src/components/Main.tsx` — Sizes the preview pane, injects placeholder sections when the document is empty, and passes normalised sections into `Canvas`.
- `packages/editor/src/components/Canvas.tsx` — Renders sections, rows, columns, and blocks inside the editor, handling drag handles, drop zones, lock/visibility toggles, and live previews.
- `packages/editor/src/components/Sidebar.tsx` — Lists structure presets and content blocks; emits drag data used to create new nodes on drop.
- `packages/editor/src/components/SidebarItem.tsx` — Reusable draggable wrapper for each palette entry that also provides a droppable slot so items can be cancelled back into place.
- `packages/editor/src/components/PropertiesPanel.tsx` — Shows contextual forms for the selected block or container, handles variable insertion, and provides lock/visibility controls.
- `packages/editor/src/components/Header.tsx` — Displays global actions (title editing, preview toggles, undo, save) and launches the React Email JSX preview.
- `packages/editor/src/components/ReactTextPreviewModal.tsx` — Modal used by the header to show rendered JSX and enable copy-to-clipboard.
- `packages/editor/src/components/Modal.tsx` — Portal-aware modal primitive shared by confirmation dialogs and previews.
- `packages/editor/src/components/ConfirmModal.tsx` — Confirm/deny dialog used when deleting sections, rows, columns, or blocks.
- `packages/editor/src/components/button.tsx` — Visual preview implementation for the button block, honouring DaisyUI or inline styles when rendered on the canvas.
- `packages/editor/src/components/divider.tsx` — Displays a divider block inside the canvas, mapping schema props to Tailwind/DaisyUI-friendly classes.
- `packages/editor/src/components/heading.tsx` — Canvas preview for heading blocks with font, alignment, and colour helpers.
- `packages/editor/src/components/image.tsx` — Handles image block rendering, including optional DaisyUI styling and upload hook integration.
- `packages/editor/src/components/text.tsx` — Rich text block preview that supports variable interpolation, alignment, and typographic options.

Use this page as the high-level map—each subsystem has its own guide linked in the sidebar for deeper configuration details.

