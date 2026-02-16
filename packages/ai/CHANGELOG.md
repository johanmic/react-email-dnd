# @react-email-dnd/ai

## 0.1.0

### Minor Changes

- Initial release of the AI utilities package
- Added block generator helpers to create editor blocks from AI outputs
- Generated blocks validate against `@react-email-dnd/shared` schema
- Blocks render correctly via `@react-email-dnd/renderer` types

### Features

- `generateTextBlock()` - Generate text blocks
- `generateHeadingBlock()` - Generate heading blocks (h1-h6)
- `generateButtonBlock()` - Generate button blocks with links
- `generateImageBlock()` - Generate image blocks
- `generateDividerBlock()` - Generate divider blocks
- `generateCustomBlock()` - Generate custom component blocks
- `generateColumnBlock()` - Generate column layout blocks
- `generateRowBlock()` - Generate row layout blocks
- `generateSectionBlock()` - Generate section layout blocks
- `generateDocument()` - Generate complete canvas documents
- `generateSimpleLayout()` - Utility for single-column layouts
- `generateMultiColumnLayout()` - Utility for multi-column layouts
- Automatic ID generation with customizable prefixes
- Schema validation for all generated blocks
- Full TypeScript support with type inference
- Comprehensive test coverage (47 tests)
