# @react-email-dnd/ai

AI utilities and block generators for react-email-dnd.

## Overview

This package provides helper functions to create editor blocks from AI outputs, ensuring compatibility with the shared schema and renderer types.

## Installation

```bash
npm install @react-email-dnd/ai
```

## Usage

```typescript
import { generateTextBlock, generateButtonBlock } from '@react-email-dnd/ai';

// Generate a text block from AI output
const textBlock = generateTextBlock({
  content: 'Hello, World!',
  fontSize: 16,
  color: '#333333',
});

// Generate a button block
const buttonBlock = generateButtonBlock({
  label: 'Click me',
  href: 'https://example.com',
  backgroundColor: '#007bff',
});
```

## Features

- Generate validated blocks from AI outputs
- Full type safety with TypeScript
- Compatible with shared schema validation
- Works seamlessly with renderer types

## API

See the [documentation](https://dnd.email/docs/ai) for detailed API reference.

## License

MIT
