---
title: Rendering Examples
sidebar_position: 3
---

The renderer example app (`packages/renderer/example`) demonstrates how to turn editor JSON into React output (or MJML/HTML, depending on the `format` you request). A representative entry renders a document that mixes built-in components with the same custom hero block used in the editor example.

```tsx title="packages/renderer/example/emails/custom-w-comp.tsx"
import { renderDocument } from '@react-email-dnd/renderer';
import { type CanvasDocument } from '@react-email-dnd/shared';
import { customBlocks } from './components/custom-blocks';
import themes from '../themes.json';
import email from '../../emails/plain-w-components.json';

const template: CanvasDocument = email as CanvasDocument;

export default function Custom({ document }: { document: CanvasDocument }) {
  const theme = themes.forest;
  const customBlocksRegistry = customBlocks.reduce((acc, definition) => {
    acc[definition.defaults.componentName] = definition;
    return acc;
  }, {} as Record<string, (typeof customBlocks)[number]>);

  const result = renderDocument({
    document,
    options: {
      format: 'react',
      theme,
      customBlocks: customBlocksRegistry,
    },
  });

  return result.format === 'react' ? result.node : null;
}

Custom.PreviewProps = {
  document: template,
};
```

Highlights:

- `renderDocument` accepts the JSON document plus render `options`. Choose `format: 'react'` for JSX output, `'html'` for static markup, or `'mjml'` if you have the MJML renderer installed.
- The example builds a `customBlocks` lookup to resolve custom block implementations during rendering. This mirrors the registry passed to the editor.
- `Custom.PreviewProps` seeds the playground UI so you can render the example immediately without manually pasting JSON.

### Custom block implementation

The renderer reuses the same `HeroBlock` definition as the editor, including default props and controlled form logic:

```tsx title="packages/renderer/example/emails/components/custom-blocks.tsx"
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

Because the renderer relies on the same defaults and IDs, authors editing the block in the editor see identical output once the campaign is rendered.

### Running the renderer playground

```bash
cd packages/renderer/example
pnpm install
pnpm dev
```

The dev server shows a gallery of email templates—including the custom block example above—so you can verify typography, layouts, and theme tokens before sending.
