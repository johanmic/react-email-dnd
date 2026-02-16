# @react-email-dnd/ai

AI-powered content generation and template utilities for react-email-dnd.

## Installation

```bash
npm install @react-email-dnd/ai
```

## Quick Start

```typescript
import { createOpenAIAdapter, useAI } from '@react-email-dnd/ai';

const adapter = createOpenAIAdapter({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
});

function MyComponent() {
  const ai = useAI({ adapter });

  const handleGenerate = async () => {
    const result = await ai.generateTemplate({
      description: 'Create a welcome email',
      style: 'modern',
    });
    console.log(result.document);
  };

  return <button onClick={handleGenerate}>Generate Template</button>;
}
```

## Documentation

Full documentation is available at [dnd.email/docs/packages/ai](https://dnd.email/docs/packages/ai)

## Features

- 🤖 Multiple AI provider support (OpenAI, custom adapters)
- ⚛️ React hooks for easy integration
- 🎨 Pre-built UI components
- 🔒 Secure server proxy for API keys
- 📝 Template generation from natural language
- ⚡ Streaming support for real-time responses
- 🛡️ Built-in rate limiting and CORS protection

## Usage

### Generate Templates

```typescript
const result = await ai.generateTemplate({
  description: 'Newsletter with header, articles, and footer',
  style: 'modern',
  includeImages: true,
  sections: ['Header', 'Articles', 'Footer'],
});
```

### Use UI Components

```typescript
import { AIPanel } from '@react-email-dnd/ai';

<AIPanel 
  ai={ai}
  onTemplateGenerated={(result) => {
    // Handle generated template
  }}
/>
```

### Server Proxy (Recommended for Production)

```typescript
// server.js
import { createAIProxyMiddleware } from '@react-email-dnd/ai/server';

const aiProxy = createAIProxyMiddleware({
  apiKey: process.env.OPENAI_API_KEY,
  allowedOrigins: ['https://yourdomain.com'],
});

app.post('/api/ai/template', aiProxy.template);
```

## Security

⚠️ **Important**: Never expose API keys in client-side code. Always use a server proxy in production.

See [Security Documentation](../../SECURITY/ai-security-review.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Links

- [Documentation](https://dnd.email/docs/packages/ai)
- [GitHub](https://github.com/johanmic/react-email-dnd)
- [Issues](https://github.com/johanmic/react-email-dnd/issues)
