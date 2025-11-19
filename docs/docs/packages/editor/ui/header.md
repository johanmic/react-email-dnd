---
title: Header Bar
sidebar_position: 5
description: Control global editor actions such as title editing, preview toggles, undo, and save.
---

The header collects document-level actions so authors can name their work, preview different breakpoints, review generated JSX, undo changes, and persist the document.

## Responsibilities

- Expose a document title field bound to `CanvasProvider` via `updateTitle`.
- Toggle between desktop and mobile preview modes by calling `setPreviewMode`.
- Trigger undo and save operations, reflecting button disabled states when the undo stack is empty or the document is clean.
- Launch supplemental modals such as the React Email JSX preview.

## Key pieces

- `Header.tsx` — Renders the UI, wires button clicks to store helpers (`undo`, `save`, `setPreviewMode`), and invokes the JSX preview modal.
- `ReactTextPreviewModal.tsx` — Shows the generated `react-email` JSX, supports copy-to-clipboard, and relies on the core `Modal` primitive.
- `Modal.tsx` — Portal-aware modal container that ensures overlays render inside the editor portal root supplied by `CanvasProvider`.

## Customising actions

- Filter `headerItems` on `EmailEditor` to hide built-in controls (e.g. omit `'save'` if you manage persistence externally).
- Add your own buttons by composing the store hooks in a custom header and passing `showHeader={false}` to `EmailEditor` to hide the default bar.

