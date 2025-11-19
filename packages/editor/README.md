# @react-email-dnd/editor

A powerful drag-and-drop email editor for React with visual editing capabilities, custom block support, and extensive theming options.

> **Note:** This is the editor package only. For rendering emails from the generated JSON, see [@react-email-dnd/renderer](../renderer). For complete documentation, visit the [documentation site](../../docs).

## Installation

```bash
# bun (recommended)
bun add @react-email-dnd/editor @react-email-dnd/shared

# pnpm
pnpm add @react-email-dnd/editor @react-email-dnd/shared

# npm
npm install @react-email-dnd/editor @react-email-dnd/shared
```

## Quick Start

```tsx
import { EmailEditor, CanvasProvider } from '@react-email-dnd/editor';
import type { CanvasDocument } from '@react-email-dnd/shared';
import '@react-email-dnd/editor/styles.css';
import { useState } from 'react';

function App() {
  const [document, setDocument] = useState<CanvasDocument | undefined>();

  const handleSave = (data: CanvasDocument) => {
    console.log('Saved:', data);
    // Send to your backend
  };

  const handleDocumentChange = (data: CanvasDocument) => {
    setDocument(data);
  };

  const uploadFile = async (file: File) => {
    // Upload to your storage service
    const url = await uploadToYourService(file);
    return url;
  };

  return (
    <CanvasProvider
      initialDocument={document}
      onSave={handleSave}
      onDocumentChange={handleDocumentChange}
      uploadFile={uploadFile}
    >
      <EmailEditor />
    </CanvasProvider>
  );
}
```

## Features

- 🎨 **Visual Drag & Drop** - Intuitive interface for building emails
- 🧩 **Custom Blocks** - Extend with your own components
- 🎭 **Theming Support** - Full color and styling customization
- 📱 **Responsive Preview** - See how emails look on different devices
- 🔤 **Custom Fonts** - Web font support with automatic loading
- 🖼️ **Image Upload** - Built-in file upload integration
- 🎯 **DaisyUI Support** - Optional DaisyUI styling integration
- 📝 **JSON Output** - Structured, portable email definitions

## Basic Usage

### With DaisyUI Theme

```tsx
import { EmailEditor, CanvasProvider } from '@react-email-dnd/editor';
import '@react-email-dnd/editor/styles.css';

function DaisyUIEditor() {
  return (
    <div data-theme="forest">
      <CanvasProvider
        initialDocument={undefined}
        onSave={(doc) => console.log(doc)}
        onDocumentChange={(doc) => console.log(doc)}
      >
        <EmailEditor
          daisyui={true}
          colors={['#1fb2a6', '#2d3748', '#f97316']}
          padding={{
            small: '4',
            medium: '8',
            large: '12'
          }}
        />
      </CanvasProvider>
    </div>
  );
}
```

### With Custom Fonts

```tsx
import type { FontDefinition } from '@react-email-dnd/shared';

const fonts: FontDefinition[] = [
  {
    name: 'Inter',
    weights: [400, 500, 700],
    fallback: 'sans-serif',
    webFont: {
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700',
      format: 'woff2'
    }
  }
];

<EmailEditor fonts={fonts} />
```

### With Custom Blocks

```tsx
import type { CustomBlock } from '@react-email-dnd/editor';

const customBlocks: CustomBlock[] = [
  {
    type: 'footer',
    label: 'Footer',
    icon: '🦶',
    category: 'custom',
    defaultProps: {
      text: 'Company Footer',
      year: new Date().getFullYear()
    }
  }
];

<EmailEditor customBlocks={customBlocks} />
```

## API Reference

### CanvasProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Child components (typically `EmailEditor`) |
| `initialDocument` | `CanvasDocument \| undefined` | Initial email document to load |
| `onSave` | `(doc: CanvasDocument) => void` | Callback when save is triggered |
| `onDocumentChange` | `(doc: CanvasDocument) => void` | Callback on any document change |
| `uploadFile` | `(file: File) => Promise<string>` | File upload handler, returns URL |
| `variables` | `Record<string, unknown> \| undefined` | Dynamic variables that override document variables. These are not saved and are available to custom blocks. |

### EmailEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showHeader` | `boolean` | `true` | Show the header bar with actions |
| `className` | `string` | `undefined` | Additional CSS class name for the root element |
| `daisyui` | `boolean` | `false` | Use DaisyUI styling |
| `variableChecks` | `boolean` | `false` | When true, shows variable checks in the properties panel |
| `headerVariableCheck` | `boolean` | `false` | When true, shows variable checks in the header |
| `colorMode` | `'hierarchy' \| 'primary' \| 'none' \| 'output'` | `'hierarchy'` | Color highlighting mode for canvas elements |
| `colorModeDepth` | `number \| null` | `null` | Controls how deep the visual highlighting goes (1=Section, 2=Section+Row, 3=Section+Row+Column). Default null shows all levels. |
| `unlockable` | `boolean` | `true` | When false, locked items cannot be unlocked and will not accept any drops |
| `showHidden` | `boolean` | `false` | When false, hidden items are not shown in the editor |
| `initialDocument` | `CanvasDocument \| undefined` | `undefined` | Initial JSON document to load into the editor |
| `onDocumentChange` | `(document: CanvasDocument) => void` | `undefined` | Callback fired whenever the document changes (for real-time updates) |
| `onSave` | `(document: CanvasDocument) => void` | `undefined` | Callback fired when the user clicks the save button |
| `colors` | `ColorOption[]` | `undefined` | Array of predefined colors for color picker |
| `textColors` | `ColorOption[]` | `undefined` | Optional palette specifically for text colors; falls back to `colors` when omitted |
| `bgColors` | `ColorOption[]` | `undefined` | Optional palette specifically for background colors; falls back to `colors` when omitted |
| `sideBarColumns` | `1 \| 2 \| 3` | `2` | Number of columns to display in the sidebar |
| `customBlocks` | `CustomBlockDefinition<any>[]` | `[]` | Custom content blocks that should be available from the sidebar |
| `padding` | `Record<string, Padding>` | `undefined` | Preset padding options displayed as quick-select buttons |
| `fonts` | `FontDefinition[]` | `undefined` | Available fonts for selection in text, heading, and button blocks |
| `blocks` | `string[]` | `undefined` | Filter which blocks to show in sidebar. Only blocks matching these IDs will be visible. Empty array shows all blocks. |
| `variablesLocked` | `boolean` | `false` | When true, variables cannot be edited and only existing variables are displayed. If no variables exist, the variables section is hidden. |
| `headerItems` | `HeaderItem[]` | `undefined` | Filter which header items to show. Only items matching these types will be visible. Default is all items. |
| `mobileBreakpoint` | `number` | `768` | Breakpoint in pixels for mobile/desktop detection |
| `forceMobileLayout` | `boolean` | `undefined` | Force mobile layout regardless of viewport size |
| `forceDesktopLayout` | `boolean` | `undefined` | Force desktop layout regardless of viewport size |
| `showInlineInsertionControls` | `boolean` | `undefined` | Show inline insertion controls (plus buttons). Defaults to auto-detect based on mobile layout. |
| `alwaysShowSidebar` | `boolean` | `false` | Always show sidebar even on mobile |

## Related Packages

- **[@react-email-dnd/renderer](../renderer)** - Render email JSON to HTML/React Email components
- **[@react-email-dnd/shared](../shared)** - Shared types and schemas

## Documentation

For complete documentation, examples, and guides, visit:
- [Getting Started Guide](../../docs/docs/getting-started.md)
- [Editor Documentation](../../docs/docs/packages/editor/basics.md)
- [Custom Components](../../docs/docs/packages/editor/custom-components.md)
- [Fonts Guide](../../docs/docs/packages/editor/fonts.md)

## Examples

Check out the [example directory](./example) for a complete working example with:
- DaisyUI integration
- Custom fonts
- Custom blocks
- File uploads
- Theme customization

## Development

```bash
# Install dependencies
pnpm install

# Run example app
pnpm dev

# Build package
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## TypeScript

This package includes TypeScript definitions. Import types from `@react-email-dnd/shared`:

```tsx
import type { 
  CanvasDocument, 
  FontDefinition,
  Block,
  Theme 
} from '@react-email-dnd/shared';
```

## License

MIT

## Contributing

Contributions are welcome! Please follow the [repository guidelines](../../AGENTS.md).

