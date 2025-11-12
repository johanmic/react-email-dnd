---
title: Sidebar Palette
sidebar_position: 3
description: Customise the structure presets and content blocks available to authors.
---

The sidebar is the entry point for building emails. It exposes reusable structure presets (sections, rows, column layouts) and the block catalogue that designers drag onto the canvas.

## Palette anatomy

- **Structure cards** come from `StructurePaletteItem` definitions. Dropping them onto the canvas inserts sections or rows with predefined column counts.
- **Content cards** come from block manifests (`BlockDefinition`). They hydrate their default props when dropped into a column.
- **Variables inspector** mirrors document variables so authors can inspect the dynamic data available during rendering.

## Key pieces

- `Sidebar.tsx` — Renders the palette, variable list, and determines the grid layout per breakpoint. It uses `useCanvasStore()` to read live variables so the list stays in sync.
- `SidebarItem.tsx` — Wraps each palette card with draggable and droppable behaviour so items can be cancelled back into place if needed.
- Content block previews (`button.tsx`, `text.tsx`, `heading.tsx`, `divider.tsx`, `image.tsx`) supply icons and defaults, and are re-exported through the block registry so the sidebar can list them.

## Customisation tips

- Pass a filtered `blocks` array to `EmailEditor` to limit which block types appear.
- Provide custom `structureItems` or `customBlocks` to introduce layouts or bespoke components tailored to your product.
- Use `sideBarColumns` to control the responsive grid (1, 2, or 3 columns).

