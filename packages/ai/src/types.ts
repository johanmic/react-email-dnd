import { z } from 'zod';
import type { EmailDocument } from '@react-email-dnd/shared';

/**
 * AI Provider types - can be extended to support multiple providers
 */
export type AIProvider = 'openai' | 'anthropic' | 'custom';

/**
 * AI Model configuration
 */
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * AI Request types
 */
export interface AIRequest {
  prompt: string;
  context?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIStreamRequest extends AIRequest {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * AI Response types
 */
export interface AIResponse {
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

/**
 * Template Generation types
 */
export interface TemplateGenerationRequest {
  description: string;
  style?: 'minimal' | 'modern' | 'classic' | 'bold';
  includeImages?: boolean;
  sections?: string[];
}

export interface TemplateGenerationResponse {
  document: EmailDocument;
  description: string;
  suggestions?: string[];
}

/**
 * AI Adapter interface - to be implemented by provider-specific adapters
 */
export interface AIAdapter {
  readonly provider: AIProvider;
  readonly model: string;
  
  /**
   * Generate a completion from the AI
   */
  complete(request: AIRequest): Promise<AIResponse>;
  
  /**
   * Stream a completion from the AI
   */
  stream(request: AIStreamRequest): Promise<void>;
  
  /**
   * Generate an email template from a description
   */
  generateTemplate(request: TemplateGenerationRequest): Promise<TemplateGenerationResponse>;
}

/**
 * AI Hook state
 */
export interface AIState {
  isLoading: boolean;
  error: Error | null;
  response: AIResponse | null;
  isStreaming: boolean;
  streamedContent: string;
}

/**
 * AI Hook return type
 */
export interface UseAIReturn {
  state: AIState;
  complete: (request: AIRequest) => Promise<AIResponse | null>;
  stream: (request: AIStreamRequest) => Promise<void>;
  generateTemplate: (request: TemplateGenerationRequest) => Promise<TemplateGenerationResponse | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Server proxy configuration
 */
export interface ProxyConfig {
  apiKey?: string;
  allowedOrigins?: string[];
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Zod schemas for runtime validation
 */
export const AIRequestSchema = z.object({
  prompt: z.string().min(1),
  context: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  systemPrompt: z.string().optional(),
});

export const TemplateGenerationRequestSchema = z.object({
  description: z.string().min(1),
  style: z.enum(['minimal', 'modern', 'classic', 'bold']).optional(),
  includeImages: z.boolean().optional(),
  sections: z.array(z.string()).optional(),
});

export const AIModelConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'custom']),
  model: z.string(),
  apiKey: z.string().optional(),
  baseURL: z.string().url().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

/**
 * Error types
 */
export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: AIProvider,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class AIAuthError extends AIError {
  constructor(message: string, provider?: AIProvider) {
    super(message, 'AUTH_ERROR', provider);
    this.name = 'AIAuthError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(message: string, provider?: AIProvider) {
    super(message, 'RATE_LIMIT_ERROR', provider);
    this.name = 'AIRateLimitError';
  }
}

export class AINetworkError extends AIError {
  constructor(message: string, provider?: AIProvider, originalError?: Error) {
    super(message, 'NETWORK_ERROR', provider, originalError);
    this.name = 'AINetworkError';
  }
}
