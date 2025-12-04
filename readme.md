<video src="https://github.com/user-attachments/assets/b91f0dfa-0e3a-4fce-a516-ff56715d7ca3" width="100%" autoplay loop muted playsinline></video>

# React Email DND

A drag-and-drop email editor toolkit for React. The editor outputs a JSON schema that the renderer transforms into HTML/React Email components.

## Packages

| Package                                          | Description                                          |
| ------------------------------------------------ | ---------------------------------------------------- |
| [@react-email-dnd/editor](./packages/editor)     | Visual drag-and-drop email editor component          |
| [@react-email-dnd/renderer](./packages/renderer) | Renders JSON documents to HTML, React, or plain text |
| [@react-email-dnd/shared](./packages/shared)     | Zod schemas, types, and validation utilities         |

## Installation

```bash
pnpm add @react-email-dnd/editor
# or
npm install @react-email-dnd/editor
```

## Quick Start

```tsx
import { EmailEditor } from "@react-email-dnd/editor"
import "@react-email-dnd/editor/styles.css"

export function App() {
  return <EmailEditor onChange={(doc) => console.log(doc)} />
}
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev mode (watch all packages)
pnpm dev:packages

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Release & Versioning

All packages are versioned together using [Changesets](https://github.com/changesets/changesets) with a fixed version group.

### Creating a Release

1. **Create a changeset** (after making changes):

   ```bash
   pnpm changeset
   ```

   Select the bump type (patch/minor/major). All packages in the fixed group will receive the same version.

2. **Review pending changesets** (optional):

   ```bash
   pnpm changeset status
   ```

3. **Release to npm**:

   ```bash
   pnpm release
   ```

   This command:

   - Runs `changeset version` to bump versions and generate changelogs
   - Runs `pnpm install` to update the lockfile
   - Builds all packages in order (shared → renderer → editor)
   - Runs tests
   - Publishes to npm (converts `workspace:^` to actual versions)

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "chore: release v0.x.x"
   git push
   ```

### Workspace Protocol

Internal dependencies use `workspace:^` which pnpm automatically converts to real semver ranges (e.g., `^0.1.2.3`) during publish. This ensures:

- Local development uses workspace packages
- Published packages reference correct npm versions
