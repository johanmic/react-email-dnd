---
title: Canvas
sidebar_position: 2
description: Understand how sections, rows, columns, and blocks render inside the editor viewport.
---

The canvas combines layout structure with block previews so authors can drag, drop, and manipulate content in-place. It is responsible for translating the JSON document into interactive React elements while keeping the shared state in sync.

## Responsibilities

- Render the current document tree (sections → rows → columns → blocks) with live previews of each block type.
- Register droppable zones so sidebar items and existing blocks can be reordered or inserted at precise positions.
- Surface tooling around each node—lock toggles, visibility controls, delete confirmations, and drag handles.
- Respect editor options such as DaisyUI mode, colour highlighting depth, hidden block visibility, and unlockable settings.

## Key pieces

- `Canvas` (`packages/editor/src/components/Canvas.tsx`) unwraps the document into nested React components and wires up the `@dnd-kit` integrations.
- `CanvasProvider` (`packages/editor/src/components/CanvasProvider.tsx`) supplies the canvas with selection state, document mutations, undo history, and utilities such as `updateBlockProps`.
- Content block previews (`button.tsx`, `text.tsx`, `heading.tsx`, `divider.tsx`, `image.tsx`) render the authoring-time view for each block type while respecting DaisyUI or inline styles.
- `ConfirmModal.tsx` provides the delete confirmation dialog that appears when removing sections, rows, columns, or blocks.

## Working with the context

Use `useCanvasStore()` anywhere under `CanvasProvider` to:

- Read the latest `document`, `selectedBlock`, or `selectedContainer`.
- Dispatch mutations like `setDocument`, `updateBlockProps`, `updateContainerProps`, or `upsertVariable`.
- Control editor behaviour (`selectBlock`, `setPreviewMode`, `save`, `undo`, etc.).

Reusing the shared context ensures selections stay in sync and all mutations go through the undo stack.

