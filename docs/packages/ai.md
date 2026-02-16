# @react-email-dnd/ai

AI-powered content generation and template utilities for react-email-dnd. Generate email templates using natural language descriptions with support for OpenAI and other AI providers.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Server Integration](#server-integration)
- [Security](#security)
- [Examples](#examples)
- [Roadmap](#roadmap)

## Installation

```bash
# npm
npm install @react-email-dnd/ai

# pnpm
pnpm add @react-email-dnd/ai

# yarn
yarn add @react-email-dnd/ai
```

## Quick Start

### Basic Usage

```typescript
import { createOpenAIAdapter, useAI, AIPanel } from '@react-email-dnd/ai';

// Create an adapter
const adapter = createOpenAIAdapter({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
});

// Use in a React component
function MyComponent() {
  const ai = useAI({ adapter });

  const handleGenerate = async () => {
    const result = await ai.generateTemplate({
      description: 'Create a welcome email with header, content, and CTA',
      style: 'modern',
    });
    
    console.log(result.document);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Template</button>
      {ai.state.isLoading && <p>Generating...</p>}
      {ai.state.error && <p>Error: {ai.state.error.message}</p>}
    </div>
  );
}
```

### Using the AI Panel Component

```typescript
import { createOpenAIAdapter, useAI, AIPanel } from '@react-email-dnd/ai';

function EmailEditor() {
  const adapter = createOpenAIAdapter({
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
  });

  const ai = useAI({ adapter });

  const handleTemplateGenerated = (result) => {
    // Use the generated template
    console.log('Generated template:', result.document);
    // Update your editor state with the new template
  };

  return (
    <AIPanel 
      ai={ai} 
      onTemplateGenerated={handleTemplateGenerated}
    />
  );
}
```

## Core Concepts

### Adapters

Adapters provide a unified interface for different AI providers. Currently supported:

- **OpenAI** - GPT-4, GPT-3.5, and other OpenAI models
- **Custom** - Implement your own adapter for other providers

```typescript
import { OpenAIAdapter } from '@react-email-dnd/ai';

const adapter = new OpenAIAdapter({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: 'your-api-key',
  temperature: 0.7,
  maxTokens: 2000,
});
```

### Hooks

The `useAI` hook provides a React-friendly interface for AI operations:

```typescript
const ai = useAI({
  adapter: myAdapter,
  onError: (error) => console.error(error),
});

// Generate a completion
const response = await ai.complete({
  prompt: 'What makes a good email?',
});

// Stream a response
await ai.stream({
  prompt: 'Write email copy...',
  onChunk: (chunk) => console.log(chunk),
  onComplete: (full) => console.log('Done:', full),
});

// Generate a template
const template = await ai.generateTemplate({
  description: 'Welcome email',
  style: 'modern',
  includeImages: true,
});
```

### Components

Pre-built UI components for AI interactions:

**AIPanel** - Full-featured template generation panel
**AICompactPanel** - Compact single-input version

```typescript
import { AIPanel, AICompactPanel } from '@react-email-dnd/ai';

// Full panel
<AIPanel 
  ai={ai}
  onTemplateGenerated={handleGenerated}
  styles={['minimal', 'modern', 'classic', 'bold']}
/>

// Compact version
<AICompactPanel 
  ai={ai}
  onTemplateGenerated={handleGenerated}
/>
```

## API Reference

### Types

#### AIModelConfig

```typescript
interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number; // 0-2, default 0.7
  maxTokens?: number;
}
```

#### AIRequest

```typescript
interface AIRequest {
  prompt: string;
  context?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}
```

#### TemplateGenerationRequest

```typescript
interface TemplateGenerationRequest {
  description: string;
  style?: 'minimal' | 'modern' | 'classic' | 'bold';
  includeImages?: boolean;
  sections?: string[];
}
```

#### AIResponse

```typescript
interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}
```

### OpenAIAdapter

#### Methods

**complete(request: AIRequest): Promise<AIResponse>**

Generate a completion from OpenAI.

```typescript
const response = await adapter.complete({
  prompt: 'Create email subject lines',
  temperature: 0.8,
});
```

**stream(request: AIStreamRequest): Promise<void>**

Stream a completion with real-time chunks.

```typescript
await adapter.stream({
  prompt: 'Write email body...',
  onChunk: (chunk) => console.log(chunk),
  onComplete: (full) => console.log(full),
});
```

**generateTemplate(request: TemplateGenerationRequest): Promise<TemplateGenerationResponse>**

Generate an email template from a description.

```typescript
const result = await adapter.generateTemplate({
  description: 'Product launch email with hero and features',
  style: 'modern',
  includeImages: true,
  sections: ['Hero', 'Features', 'CTA', 'Footer'],
});
```

**cancel(): void**

Cancel any ongoing request.

```typescript
adapter.cancel();
```

### useAI Hook

Returns an object with:

- **state**: Current AI state (loading, error, response, streaming)
- **complete**: Function to generate a completion
- **stream**: Function to stream a completion
- **generateTemplate**: Function to generate a template
- **cancel**: Function to cancel ongoing requests
- **reset**: Function to reset state

```typescript
const {
  state,
  complete,
  stream,
  generateTemplate,
  cancel,
  reset,
} = useAI({ adapter });
```

## Server Integration

For secure API key management, use the server proxy:

### Express Example

```typescript
import express from 'express';
import { createAIProxyMiddleware } from '@react-email-dnd/ai/server';

const app = express();
app.use(express.json());

const aiProxy = createAIProxyMiddleware({
  apiKey: process.env.OPENAI_API_KEY,
  allowedOrigins: ['https://yourdomain.com'],
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
});

app.post('/api/ai/completion', aiProxy.completion);
app.post('/api/ai/template', aiProxy.template);

app.listen(3000);
```

### Next.js API Route

```typescript
// pages/api/ai/template.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createAIProxy } from '@react-email-dnd/ai/server';

const proxy = createAIProxy({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await proxy.handleTemplateGeneration(req, req.body);
  
  const headers = proxy.getCORSHeaders(req.headers.origin);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  res.status(result.status).json(result.data);
}
```

### Client-side with Server Proxy

```typescript
import { useAI } from '@react-email-dnd/ai';

// Create a custom adapter that calls your server
const serverAdapter = {
  provider: 'openai' as const,
  model: 'gpt-4o-mini',
  
  async generateTemplate(request) {
    const response = await fetch('/api/ai/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  },
  
  async complete(request) {
    const response = await fetch('/api/ai/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  },
  
  async stream(request) {
    // Implement streaming if needed
  },
};

const ai = useAI({ adapter: serverAdapter });
```

## Security

### Best Practices

1. **Never expose API keys in client-side code**
   - Always use a server proxy for production
   - Store API keys in environment variables
   - Use secret management services (AWS Secrets Manager, etc.)

2. **Implement rate limiting**
   - Prevent abuse and manage costs
   - The built-in proxy includes rate limiting

3. **Validate origins**
   - Restrict which domains can use your proxy
   - Use CORS headers appropriately

4. **Sanitize inputs**
   - The package uses Zod schemas for validation
   - Additional validation may be needed for your use case

5. **Monitor usage**
   - Track API usage and costs
   - Set up alerts for unusual activity

### Security Review Checklist

- [ ] API keys stored securely
- [ ] Server proxy implemented
- [ ] Rate limiting configured
- [ ] CORS origins restricted
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive info
- [ ] Monitoring and logging enabled

## Examples

### Style Variations

```typescript
// Minimal style
const minimal = await ai.generateTemplate({
  description: 'Newsletter signup',
  style: 'minimal',
});

// Modern style with images
const modern = await ai.generateTemplate({
  description: 'Product showcase',
  style: 'modern',
  includeImages: true,
});

// Bold style for marketing
const bold = await ai.generateTemplate({
  description: 'Limited time offer',
  style: 'bold',
});
```

### Custom Sections

```typescript
const result = await ai.generateTemplate({
  description: 'Weekly digest email',
  sections: [
    'Header',
    'This Week\'s Highlights',
    'Top Articles',
    'Community Spotlight',
    'Upcoming Events',
    'Footer',
  ],
});
```

### Error Handling

```typescript
const ai = useAI({
  adapter,
  onError: (error) => {
    if (error.code === 'AUTH_ERROR') {
      console.error('Authentication failed');
    } else if (error.code === 'RATE_LIMIT_ERROR') {
      console.error('Rate limit exceeded');
    } else {
      console.error('An error occurred:', error.message);
    }
  },
});
```

## Roadmap

### Epic: Add /packages/ai Package

#### Phase 1: Core Infrastructure ✅
- [x] Package scaffolding
- [x] TypeScript configuration
- [x] Build setup (tsup)
- [x] Test infrastructure (vitest)

#### Phase 2: Core Features ✅
- [x] Type definitions and schemas
- [x] OpenAI adapter implementation
- [x] React hooks (useAI)
- [x] Template generation utilities
- [x] Server proxy for secure API calls

#### Phase 3: UI Components ✅
- [x] AIPanel component
- [x] AICompactPanel component
- [x] Component styles

#### Phase 4: Testing & Documentation ✅
- [x] Unit tests
- [x] Integration tests
- [x] API documentation
- [x] Usage examples
- [x] Security guidelines

#### Phase 5: CI/CD & Release 🚧
- [ ] CI workflow integration
- [ ] Build validation
- [ ] Security scanning
- [ ] Package publishing
- [ ] Version management

#### Phase 6: Future Enhancements 📋
- [ ] Anthropic (Claude) adapter
- [ ] Custom adapter guide
- [ ] Streaming UI components
- [ ] Template preview component
- [ ] Batch generation support
- [ ] Template refinement (iterative improvement)
- [ ] Multi-language support
- [ ] A/B testing suggestions
- [ ] Analytics integration

### Rollout Plan

1. **Alpha Release (Internal)**
   - Core team testing
   - Gather initial feedback
   - Iterate on API design

2. **Beta Release (Early Adopters)**
   - Select users get access
   - Monitor usage patterns
   - Refine documentation

3. **Stable Release (General Availability)**
   - Public npm release
   - Full documentation
   - Example projects
   - Migration guides

4. **Post-Release**
   - Monitor issues and feedback
   - Regular updates
   - Community contributions
   - Feature requests

## Contributing

Contributions are welcome! Please see the main repository's contributing guidelines.

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: [react-email-dnd/issues](https://github.com/johanmic/react-email-dnd/issues)
- Documentation: [dnd.email](https://dnd.email)
- Discord: [Community Server](#)

---

**Note**: This package is currently in active development. APIs may change before the 1.0 release.
