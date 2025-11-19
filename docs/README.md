# React Email DnD Docs

The documentation site for the React Email drag-and-drop toolkit is powered by [Docusaurus 2](https://docusaurus.io/).

## Prerequisites

- Node.js 16.14 or newer (matches the current repository toolchain)
- pnpm 9 (managed via `corepack`; run `corepack enable` once if needed)

Install workspace dependencies from the repository root:

```bash
pnpm install
```

## Local Development

From the repository root:

```bash
pnpm docs
```

You can also use the shorthand:

```bash
pnpm dev
```

This launches the dev server at <http://localhost:3000>. File edits hot-reload automatically.

## Production Build

```bash
pnpm docs:build
```

The generated static assets are emitted to `docs/build`. Preview the result with:

```bash
pnpm docs:serve
```

## Project Structure

- `docs/` &mdash; MDX/Markdown sources grouped by sidebar category.
- `src/` &mdash; Custom React pages and UI overrides.
- `static/` &mdash; Files copied verbatim into the final build (favicons, images, etc.).

Deployments can target any static hosting provider. Configure environment-specific URLs inside `docusaurus.config.js`.
