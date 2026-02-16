// Types
export type {
  AIProvider,
  AIModelConfig,
  AIRequest,
  AIStreamRequest,
  AIResponse,
  TemplateGenerationRequest,
  TemplateGenerationResponse,
  AIAdapter,
  AIState,
  UseAIReturn,
  ProxyConfig,
} from './types';

export {
  AIError,
  AIAuthError,
  AIRateLimitError,
  AINetworkError,
  AIRequestSchema,
  TemplateGenerationRequestSchema,
  AIModelConfigSchema,
} from './types';

// Adapters
export { OpenAIAdapter, createOpenAIAdapter } from './adapters';

// Hooks
export { useAI } from './hooks';
export type { UseAIOptions } from './hooks';

// Components
export { AIPanel, AICompactPanel } from './components';
export type { AIPanelProps, AICompactPanelProps } from './components';

// Utils
export { generateTemplateFromDescription } from './utils';
