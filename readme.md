# React Email DND

## Packages

- [@react-email-dnd/editor](./packages/editor): The editor component.
- [@react-email-dnd/renderer](./packages/renderer): The renderer component.
- [@react-email-dnd/shared](./packages/shared): The shared utilities.

## Example

````tsx

```tsx

import { EmailEditor } from '@react-email-dnd/editor';

export function App() {
  return <EmailEditor />;
}
````

## Release & versioning

All packages are versioned and published together through [Changesets](https://github.com/changesets/changesets) and `pnpm`.

1. After making code changes, run `pnpm changeset` to record the bump; every package shares the same semantic version because the repo is configured as a fixed group.
2. To ship everything, run `pnpm release` from the repo root. This bumps versions, rebuilds every workspace, and publishes all packages to npm with public access.
3. Commit and push the generated changelog entries plus updated manifests so the release metadata stays in sync with what went to npm.
