# EmailEditor Props

## EmailEditorProps

The main props interface for the `EmailEditor` component.

### Basic Props

| Prop         | Type      | Default | Description                                    |
| ------------ | --------- | ------- | ---------------------------------------------- |
| `showHeader` | `boolean` | `true`  | Show the header bar with actions               |
| `className`  | `string`  | -       | Additional CSS class name for the root element |
| `daisyui`    | `boolean` | `false` | Use DaisyUI styling                            |

### Visual Configuration

| Prop             | Type                                             | Default       | Description                                                                                                                    |
| ---------------- | ------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `colorMode`      | `'hierarchy' \| 'primary' \| 'none' \| 'output'` | `'hierarchy'` | Color highlighting mode for canvas elements                                                                                    |
| `colorModeDepth` | `number \| null`                                 | `null`        | Controls how deep the visual highlighting goes (1=Section, 2=Section+Row, 3=Section+Row+Column). Default null shows all levels |
| `unlockable`     | `boolean`                                        | `true`        | When false, locked items cannot be unlocked and will not accept any drops                                                      |
| `showHidden`     | `boolean`                                        | `false`       | When false, hidden items are not shown in the editor                                                                           |

### Document Management

| Prop               | Type                                 | Default | Description                                                          |
| ------------------ | ------------------------------------ | ------- | -------------------------------------------------------------------- |
| `initialDocument`  | `CanvasDocument`                     | -       | Initial JSON document to load into the editor                        |
| `onDocumentChange` | `(document: CanvasDocument) => void` | -       | Callback fired whenever the document changes (for real-time updates) |
| `onSave`           | `(document: CanvasDocument) => void` | -       | Callback fired when the user clicks the save button                  |

### Color Configuration

| Prop         | Type            | Default | Description                                                                              |
| ------------ | --------------- | ------- | ---------------------------------------------------------------------------------------- |
| `colors`     | `ColorOption[]` | -       | Array of predefined colors for color picker                                              |
| `textColors` | `ColorOption[]` | -       | Optional palette specifically for text colors; falls back to `colors` when omitted       |
| `bgColors`   | `ColorOption[]` | -       | Optional palette specifically for background colors; falls back to `colors` when omitted |

### Sidebar Configuration

| Prop              | Type                           | Default | Description                                                                                                                             |
| ----------------- | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `sideBarColumns`  | `1 \| 2 \| 3`                  | `2`     | Number of columns to display in the sidebar                                                                                             |
| `customBlocks`    | `CustomBlockDefinition<any>[]` | `[]`    | Custom content blocks that should be available from the sidebar                                                                         |
| `blocks`          | `string[]`                     | -       | Filter which blocks to show in sidebar. Only blocks matching these IDs will be visible. Empty array shows all blocks                    |
| `variablesLocked` | `boolean`                      | `false` | When true, variables cannot be edited and only existing variables are displayed. If no variables exist, the variables section is hidden |

### Styling Configuration

| Prop      | Type                      | Default | Description                                                       |
| --------- | ------------------------- | ------- | ----------------------------------------------------------------- |
| `padding` | `Record<string, Padding>` | -       | Preset padding options displayed as quick-select buttons          |
| `fonts`   | `FontDefinition[]`        | -       | Available fonts for selection in text, heading, and button blocks |

### Header Configuration

| Prop          | Type           | Default | Description                                                                                              |
| ------------- | -------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `headerItems` | `HeaderItem[]` | -       | Filter which header items to show. Only items matching these types will be visible. Default is all items |

### Layout Configuration

| Prop                          | Type      | Default | Description                                                                                   |
| ----------------------------- | --------- | ------- | --------------------------------------------------------------------------------------------- |
| `mobileBreakpoint`            | `number`  | `768`   | Breakpoint in pixels for mobile/desktop detection                                             |
| `forceMobileLayout`           | `boolean` | -       | Force mobile layout regardless of viewport size                                               |
| `forceDesktopLayout`          | `boolean` | -       | Force desktop layout regardless of viewport size                                              |
| `showInlineInsertionControls` | `boolean` | -       | Show inline insertion controls (plus buttons). Defaults to auto-detect based on mobile layout |
| `alwaysShowSidebar`           | `boolean` | `false` | Always show sidebar even on mobile                                                            |

## Type Definitions

### HeaderItem

```typescript
type HeaderItem = "title" | "preview" | "codeview" | "undo" | "save"
```

Available header item types that can be shown in the editor header.

### ColorOption

```typescript
type ColorOption =
  | string
  | {
      hex?: string
      class?: string
      tw?: string
      label?: string
    }
```

A color option can be either:

- A simple string (hex color, CSS color name, etc.)
- An object with:
  - `hex`: Hex color value
  - `class`: CSS class name (e.g., Tailwind/DaisyUI class)
  - `tw`: Tailwind CSS class name
  - `label`: Display label for the color

### Padding

```typescript
type Padding = string | number | Record<string, string | number>
```

Padding can be:

- A string (e.g., `"16px"`, `"1rem"`)
- A number (treated as pixels)
- A responsive object mapping breakpoint names to values (e.g., `{ mobile: "8px", desktop: "16px" }`)

### FontDefinition

```typescript
type FontDefinition = {
  id: string
  fontFamily: string
  fallbackFontFamily?: string
  webFont?: {
    url: string
    format:
      | "woff"
      | "woff2"
      | "truetype"
      | "opentype"
      | "embedded-opentype"
      | "svg"
  }
  fontWeight?: number
  fontStyle?: "normal" | "italic" | "oblique"
}
```

Font definition for custom fonts:

- `id`: Unique identifier for the font
- `fontFamily`: CSS font family name
- `fallbackFontFamily`: Optional fallback font family
- `webFont`: Optional web font configuration with URL and format
- `fontWeight`: Optional font weight (number)
- `fontStyle`: Optional font style

### CustomBlockDefinition

```typescript
interface CustomBlockDefinition<ComponentProps extends Record<string, unknown>>
  extends BlockDefinition<CustomBlock> {
  type: "custom"
  defaults: {
    componentName: string
    props: ComponentProps
  }
  component: ComponentType<ComponentProps>
  propEditor?: ComponentType<CustomBlockPropEditorProps<ComponentProps>>
}
```

Custom block definition for extending the editor with custom components:

- `type`: Must be `'custom'`
- `defaults`: Default props for the block including component name and initial props
- `component`: React component used to render the custom block
- `propEditor`: Optional prop editor component for editing block properties in the editor

### CanvasDocument

```typescript
type CanvasDocument = {
  meta: DocumentMeta
  sections: CanvasSection[]
  variables?: Record<string, unknown>
  theme?: {
    fonts?: FontDefinition[]
  }
}
```

The main document structure:

- `meta`: Document metadata (title, description, etc.)
- `sections`: Array of canvas sections
- `variables`: Optional document-level variables
- `theme`: Optional theme configuration including fonts

### CanvasSection

```typescript
type CanvasSection = {
  id: string
  rows: CanvasRow[]
  padding?: Padding
  margin?: string
  align?: "left" | "center" | "right" | "justify"
  backgroundColor?: string
  backgroundClassName?: string
  className?: string
  locked?: boolean
  hidden?: boolean
}
```

A section container that holds rows.

### CanvasRow

```typescript
type CanvasRow = {
  id: string
  columns: CanvasColumn[]
  gutter?: number
  padding?: Padding
  margin?: string
  align?: "left" | "center" | "right" | "justify"
  backgroundColor?: string
  backgroundClassName?: string
  className?: string
  locked?: boolean
  hidden?: boolean
}
```

A row container that holds columns.

### CanvasColumn

```typescript
type CanvasColumn = {
  id: string
  blocks: CanvasContentBlock[]
  padding?: Padding
  margin?: string
  align?: "left" | "center" | "right" | "justify"
  backgroundColor?: string
  backgroundClassName?: string
  className?: string
  locked?: boolean
  hidden?: boolean
}
```

A column container that holds content blocks.

### CanvasContentBlock

```typescript
type CanvasContentBlock =
  | ButtonBlock
  | TextBlock
  | HeadingBlock
  | DividerBlock
  | ImageBlock
  | CustomBlock
```

Union type representing all available content block types.
