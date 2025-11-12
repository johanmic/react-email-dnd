id: getting-started
title: Getting Started
description: Install dependencies and run the React Email DnD workspace locally.
sidebar_position: 2

---

Follow these steps to set up the monorepo on your machine and explore the editor.

## Prerequisites

- Node.js 18 or later
- `pnpm` 9 (`npm install -g pnpm@9`)

## Install dependencies

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/johanmickelin/react-email-dnd.git
cd react-email-dnd
pnpm install
```

The workspace uses a single lockfile, so this command restores every package (docs, editor, renderer, shared).

## Run the docs playground

Start the Docusaurus site, which embeds the latest editor build:

```bash
pnpm --filter docs dev
```

This boots the site at `http://localhost:3000` with hot reloading.

## Work on individual packages

When iterating on a specific package, scope the command with a filter. For example:

```bash
pnpm --filter @react-email-dnd/editor dev
pnpm --filter @react-email-dnd/renderer build
```

Refer to each package's README for package-specific commands or scripts.

## Build everything

To produce production bundles for every workspace package:

```bash
pnpm build
```

This runs the appropriate builder for each package (Vite for the editor, tsup for shared utilities and renderer).

## Quickstart

Need the short version? Clone the repo, install once, and launch the docs playground:

```bash
git clone https://github.com/johanmickelin/react-email-dnd.git
cd react-email-dnd
pnpm install
pnpm --filter docs dev
```

You now have the editor, renderer previews, and documentation running at `http://localhost:3000`.

## Next steps

- Read the [`intro`](./intro) for a high-level overview.
- Dive into the [`editor basics`](./packages/editor/basics) guide to understand the editor workflow.
- Explore the [`renderer examples`](./packages/renderer/rendering-examples) to see how emails render in different contexts.
