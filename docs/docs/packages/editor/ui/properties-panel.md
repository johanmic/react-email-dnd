---
title: Properties Panel
sidebar_position: 4
description: Configure how block and container settings are edited inside the inspector.
---

The properties panel appears when a block, section, row, or column is selected. It renders context-sensitive controls driven by each block schema and exposes advanced layout settings for containers.

## Responsibilities

- Display readable forms for the selected node (text inputs, colour pickers, padding presets, variable insertion helpers).
- Respect lock and visibility status, disabling form fields when a parent is locked or the block is template-owned.
- Offer destructive actions—delete with confirmation, hide/show toggles—and synchronise changes through `useCanvasStore()`.

## Key pieces

- `PropertiesPanel.tsx` — Top-level inspector implementation. Chooses the correct form for the selected node, handles lock/hidden toggles, and routes prop updates via `updateBlockProps` or `updateContainerProps`.
- `ConfirmModal.tsx` + `Modal.tsx` — Shared modal primitives used when confirming deletions or presenting advanced dialogs.
- Block-specific editors live in-line within `PropertiesPanel` (e.g. button, text, heading, image forms) and map schema props to form elements.

## Extending the inspector

- Provide `customBlockRegistry` entries with a `propEditor` component to render custom forms for your bespoke blocks.
- Supply `paddingOptions`, `colors`, `textColors`, or `bgColors` to map presets and theming tokens into the pickers.
- Set `variablesLocked` on `EmailEditor` when you want to expose variables without allowing edits.

