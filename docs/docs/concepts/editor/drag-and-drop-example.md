---
title: Drag-and-Drop Example
sidebar_position: 6
---

The `@react-email-dnd` example app (`packages/editor/example`) showcases how to wire the editor into a production-ready shell. The `Vanilla` route is a minimal drag-and-drop configuration that uses the shared Canvas document format, custom blocks, and live change callbacks.

```tsx title="packages/editor/example/src/Vanilla.tsx"
import { CanvasDocument, CanvasProvider, EmailEditor } from '@react-email-dnd';
import { customBlocks } from './components/custom-blocks';
import { advancedFonts as fonts } from './font-examples';

const testDocument: CanvasDocument = {
  version: 1,
  meta: { title: 'Font Rendering Test' },
  variables: {},
  theme: {
    fonts: [
      {
        id: 'honk',
        fontFamily: 'Honk',
        fallbackFontFamily: 'system-ui, sans-serif',
        webFont: {
          url: 'https://fonts.gstatic.com/s/honk/v6/m8J7jftUea-XwTaemClumrBQbmvynOmXBji9zFhHRr8WFgV7pLFMWJEav63D.woff2',
          format: 'woff2',
        },
        fontWeight: 400,
        fontStyle: 'normal',
      },
    ],
  },
  sections: [
    {
      id: 'section-1',
      type: 'section',
      rows: [
        {
          id: 'row-1',
          type: 'row',
          gutter: 16,
          padding: '6',
          columns: [
            {
              id: 'column-1',
              type: 'column',
              padding: '4',
              blocks: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  props: {
                    content: 'Most professional mail',
                    as: 'h1',
                    fontFamily: 'Honk',
                  },
                },
                {
                  id: 'text-1',
                  type: 'text',
                  props: {
                    content: 'This is a very professional mail',
                    fontFamily: 'Honk',
                  },
                },
                {
                  id: 'button-1',
                  type: 'button',
                  props: {
                    label: 'Honk Font Button',
                    backgroundColor: '#2563eb',
                    fontFamily: 'Honk',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const Vanilla = () => {
  return (
    <CanvasProvider
      initialDocument={testDocument}
      onSave={() => console.log('save')}
      onDocumentChange={(document) => console.log('updated document', document)}
    >
      <EmailEditor customBlocks={customBlocks} fonts={fonts} showHidden />
    </CanvasProvider>
  );
};
```

Key pieces to replicate in your own host application:

- **CanvasProvider** wraps the editor with undo/redo history, change events, and persistence helpers.
- **EmailEditor** renders the palette, canvas, and property panels. Pass your `customBlocks` registry and `fonts` array to keep the editor aligned with renderer capabilities.
- **Initial document** seeds the canvas so users see an existing email instead of a blank slate.

### Custom block registry

The example exposes a `HeroBanner` custom block that combines layout primitives from `@react-email/components`. It registers both the rendered output and the property editor form in one definition:

```tsx title="packages/editor/example/src/components/custom-blocks.tsx"
export const heroBlockDefinition: CustomBlockDefinition<HeroBlockProps> = {
  id: 'hero-banner',
  type: 'custom',
  label: 'Hero Banner',
  icon: SparkleIcon,
  defaults: {
    componentName: 'HeroBlock',
    props: {
      title: 'Launch something delightful',
      description:
        'Announce a promotion, product update, or new feature with a bold hero.',
      ctaLabel: 'Shop now',
      ctaHref: 'https://example.com',
      backgroundColor: '#0ea5e9',
      textColor: '#ffffff',
    },
  },
  component: HeroBlock,
  propEditor: HeroBlockPropsEditor,
};
```

The `HeroBlockPropsEditor` implements a controlled form that pipes changes back into the editor JSON. Preview output is rendered directly in the canvas, so authors get instant feedback while adjusting settings.

### Running the example locally

```bash
cd packages/editor/example
pnpm install
pnpm dev
```

The dev server exposes `/daisyui` and `/vanilla` routes that you can adapt for your own design system and typography stacks.
