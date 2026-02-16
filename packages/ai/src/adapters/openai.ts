import OpenAI from 'openai';
import type {
  AIAdapter,
  AIRequest,
  AIResponse,
  AIStreamRequest,
  AIModelConfig,
  TemplateGenerationRequest,
  TemplateGenerationResponse,
} from '../types';
import {
  AIError,
  AIAuthError,
  AIRateLimitError,
  AINetworkError,
} from '../types';
import { generateTemplateFromDescription } from '../utils/generateTemplate';

/**
 * OpenAI adapter implementation
 */
export class OpenAIAdapter implements AIAdapter {
  readonly provider = 'openai' as const;
  readonly model: string;
  private client: OpenAI;
  private abortController: AbortController | null = null;

  constructor(config: AIModelConfig) {
    if (!config.apiKey) {
      throw new AIAuthError(
        'OpenAI API key is required',
        'openai'
      );
    }

    this.model = config.model || 'gpt-4o-mini';
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  /**
   * Complete a request using OpenAI
   */
  async complete(request: AIRequest): Promise<AIResponse> {
    try {
      this.abortController = new AbortController();

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt,
        });
      }

      if (request.context) {
        messages.push({
          role: 'system',
          content: `Context: ${request.context}`,
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt,
      });

      const response = await this.client.chat.completions.create(
        {
          model: request.model || this.model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
        },
        {
          signal: this.abortController.signal,
        }
      );

      const choice = response.choices[0];
      if (!choice || !choice.message.content) {
        throw new AIError(
          'No response content received from OpenAI',
          'EMPTY_RESPONSE',
          'openai'
        );
      }

      return {
        content: choice.message.content,
        model: response.model,
        provider: 'openai',
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
        finishReason: choice.finish_reason,
      };
    } catch (error: any) {
      this.abortController = null;
      throw this.handleError(error);
    }
  }

  /**
   * Stream a completion from OpenAI
   */
  async stream(request: AIStreamRequest): Promise<void> {
    try {
      this.abortController = new AbortController();

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt,
        });
      }

      if (request.context) {
        messages.push({
          role: 'system',
          content: `Context: ${request.context}`,
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt,
      });

      const stream = await this.client.chat.completions.create(
        {
          model: request.model || this.model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
          stream: true,
        },
        {
          signal: this.abortController.signal,
        }
      );

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          request.onChunk?.(content);
        }
      }

      request.onComplete?.(fullResponse);
      this.abortController = null;
    } catch (error: any) {
      this.abortController = null;
      const aiError = this.handleError(error);
      request.onError?.(aiError);
      throw aiError;
    }
  }

  /**
   * Generate an email template from a description
   */
  async generateTemplate(
    request: TemplateGenerationRequest
  ): Promise<TemplateGenerationResponse> {
    try {
      const systemPrompt = `You are an expert email template designer. Generate email templates in JSON format that follow the react-email-dnd schema. Focus on creating well-structured, visually appealing layouts.`;

      const prompt = this.buildTemplatePrompt(request);

      const response = await this.complete({
        prompt,
        systemPrompt,
        temperature: 0.8,
        maxTokens: 2000,
      });

      return generateTemplateFromDescription(response.content, request);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel any ongoing request
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Build a prompt for template generation
   */
  private buildTemplatePrompt(request: TemplateGenerationRequest): string {
    let prompt = `Create an email template with the following description: ${request.description}\n\n`;

    if (request.style) {
      prompt += `Style: ${request.style}\n`;
    }

    if (request.sections && request.sections.length > 0) {
      prompt += `Include these sections: ${request.sections.join(', ')}\n`;
    }

    if (request.includeImages) {
      prompt += `Include placeholder images where appropriate.\n`;
    }

    prompt += `\nGenerate a complete email template structure with appropriate sections, headings, text content, and styling. Use modern email design best practices.`;

    return prompt;
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): AIError {
    if (error.name === 'AbortError') {
      return new AIError('Request was cancelled', 'CANCELLED', 'openai');
    }

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return new AIAuthError(
          'Invalid API key or authentication failed',
          'openai'
        );
      }

      if (error.status === 429) {
        return new AIRateLimitError(
          'Rate limit exceeded. Please try again later.',
          'openai'
        );
      }

      if (error.status && error.status >= 500) {
        return new AINetworkError(
          'OpenAI service error. Please try again later.',
          'openai',
          error
        );
      }

      return new AIError(
        error.message || 'OpenAI API error',
        'API_ERROR',
        'openai',
        error
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new AINetworkError(
        'Network error. Please check your connection.',
        'openai',
        error
      );
    }

    return new AIError(
      error.message || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      'openai',
      error
    );
  }
}

/**
 * Factory function to create an OpenAI adapter
 */
export function createOpenAIAdapter(config: AIModelConfig): OpenAIAdapter {
  return new OpenAIAdapter(config);
}
