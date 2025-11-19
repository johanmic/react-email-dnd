# Custom Components

Custom components let you create reusable email blocks with editable properties. Each component has three parts: a React component, a block definition, and an optional property editor for the sidebar.

## Basic Structure

```typescript
// 1. Define props interface
interface HeroBlockProps extends Record<string, unknown> {
  title: string;
  backgroundColor?: string;
}

// 2. Create React component using @react-email/components
function HeroBlock({ title, backgroundColor }: HeroBlockProps) {
  return <Section style={{ backgroundColor }}>{title}</Section>;
}

// 3. Register with block definition
export const heroBlockDefinition: CustomBlockDefinition<HeroBlockProps> = {
  id: 'hero-banner',
  type: 'custom',
  label: 'Hero Banner',
  icon: SparkleIcon,
  defaults: {
    componentName: 'HeroBlock',
    props: { title: 'Welcome', backgroundColor: '#0ea5e9' },
  },
  component: HeroBlock,
  propEditor: HeroBlockPropsEditor, // optional
};
```

See the [full example in custom-blocks.tsx](../../packages/editor/example/src/components/custom-blocks.tsx) for a complete implementation.

## Props and Variables

Your component props can be **simple strings** or **complex objects**:

```typescript
// Simple values
props: {
  title: "Welcome",
  count: 42
}

// Complex nested objects
props: {
  user: {
    name: "John",
    email: "john@example.com",
    preferences: {
      theme: "dark",
      notifications: ["email", "push"]
    }
  }
}
```

When rendering emails, you can pass dynamic data through the `variables` prop, which will be merged into your component props. This allows for personalization and dynamic content injection at render time.
