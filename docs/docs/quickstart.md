---
title: Getting Started
sidebar_position: 1
description: Embed the editor and renderer in a project with minimal setup.
---

Jump straight into using the packages without cloning the whole monorepo.

## 1. Install the packages

Add the editor, shared schema helpers, and renderer to your app:

```bash
pnpm add @react-email-dnd/editor @react-email-dnd/shared @react-email-dnd/renderer
```

If you prefer npm or yarn, swap the command accordingly—all packages ship ESM builds.

## 2. Mount the editor

Wrap the editor UI with the `CanvasProvider` to supply state and callbacks:

```tsx
import { CanvasProvider, EmailEditor } from "@react-email-dnd/editor"

export function Builder() {
  return (
    <CanvasProvider onDocumentChange={console.log}>
      <EmailEditor />
    </CanvasProvider>
  )
}
```

This renders the full authoring environment with the sidebar, header, canvas, and properties panel.

## 3. Render the output

The editor emits an email document as JSON. Use the renderer to turn it into responsive HTML:

```tsx
import { renderDocument } from "@react-email-dnd/renderer"
import { type CanvasDocument } from "@react-email-dnd/shared"
import resend from "resend"

const result = renderDocument({
  document: testDocument,
  options: {
    format: "react",
  },
})

resend.emails.send({
  from: "hello@email.com",
  to: "hello@email.com",
  subject: "hello world",
  html: result.node,
})
```

## 4. Persist documents

Listen to `onDocumentChange` or call `save()` from the `useCanvasStore` hook to sync the JSON document to your API. Because the document is pure data, you can store it in any database or send it over WebSockets for collaboration.

## 5. Explore further

- Review the [`basics`](./packages/editor/basics) guide for a deeper look at the editor layout and APIs.
- Browse the [`components`](./packages/editor/components) manifest format to create new draggable blocks.
- Visit the [`renderer`](./packages/renderer/rendering-examples) examples to see how themes and typography apply during rendering.
