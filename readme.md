<img src="https://private-user-images.githubusercontent.com/879900/516528405-ccffdd16-0499-40b3-ae10-5721dccdadcb.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM1OTA4MTksIm5iZiI6MTc2MzU5MDUxOSwicGF0aCI6Ii84Nzk5MDAvNTE2NTI4NDA1LWNjZmZkZDE2LTA0OTktNDBiMy1hZTEwLTU3MjFkY2NkYWRjYi5naWY_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTE5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTExOVQyMjE1MTlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00NjVlYmE3ZjQwYzlmYzI0YzAyNGYxNzBiOTNmNDg5OGQ3N2E5YWJiMGIwMjA3MGMyNWU2YWY3MzZlOTkxYTU1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.TO0FWbQ-Z858LbB835PY1v74RuyKASl5w9DzZmW-JnY" alt="React Email DND Demo" width="100%" />

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
