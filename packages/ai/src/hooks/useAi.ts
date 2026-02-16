import { useState, useCallback, useRef } from 'react';
import type {
  AIAdapter,
  AIRequest,
  AIResponse,
  AIStreamRequest,
  TemplateGenerationRequest,
  TemplateGenerationResponse,
  AIState,
  UseAIReturn,
} from '../types';
import { AIError } from '../types';

export interface UseAIOptions {
  adapter: AIAdapter;
  onError?: (error: Error) => void;
}

/**
 * React hook for AI interactions
 * Provides methods for completions, streaming, and template generation
 */
export function useAI(options: UseAIOptions): UseAIReturn {
  const { adapter, onError } = options;
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<AIState>({
    isLoading: false,
    error: null,
    response: null,
    isStreaming: false,
    streamedContent: '',
  });

  /**
   * Complete a request
   */
  const complete = useCallback(
    async (request: AIRequest): Promise<AIResponse | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        response: null,
      }));

      try {
        const response = await adapter.complete(request);
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          response,
        }));

        return response;
      } catch (error) {
        const aiError =
          error instanceof AIError ? error : new AIError(
            error instanceof Error ? error.message : 'Unknown error',
            'UNKNOWN_ERROR',
            adapter.provider,
            error instanceof Error ? error : undefined
          );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: aiError,
        }));

        onError?.(aiError);
        return null;
      }
    },
    [adapter, onError]
  );

  /**
   * Stream a completion
   */
  const stream = useCallback(
    async (request: AIStreamRequest): Promise<void> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isStreaming: true,
        error: null,
        streamedContent: '',
      }));

      try {
        await adapter.stream({
          ...request,
          onChunk: (chunk) => {
            setState((prev) => ({
              ...prev,
              streamedContent: prev.streamedContent + chunk,
            }));
            request.onChunk?.(chunk);
          },
          onComplete: (fullResponse) => {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isStreaming: false,
              response: {
                content: fullResponse,
                model: adapter.model,
                provider: adapter.provider,
              },
            }));
            request.onComplete?.(fullResponse);
          },
          onError: (error) => {
            const aiError =
              error instanceof AIError ? error : new AIError(
                error.message,
                'UNKNOWN_ERROR',
                adapter.provider,
                error
              );

            setState((prev) => ({
              ...prev,
              isLoading: false,
              isStreaming: false,
              error: aiError,
            }));

            onError?.(aiError);
            request.onError?.(error);
          },
        });
      } catch (error) {
        const aiError =
          error instanceof AIError ? error : new AIError(
            error instanceof Error ? error.message : 'Unknown error',
            'UNKNOWN_ERROR',
            adapter.provider,
            error instanceof Error ? error : undefined
          );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
          error: aiError,
        }));

        onError?.(aiError);
        throw aiError;
      }
    },
    [adapter, onError]
  );

  /**
   * Generate a template
   */
  const generateTemplate = useCallback(
    async (
      request: TemplateGenerationRequest
    ): Promise<TemplateGenerationResponse | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await adapter.generateTemplate(request);
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));

        return result;
      } catch (error) {
        const aiError =
          error instanceof AIError ? error : new AIError(
            error instanceof Error ? error.message : 'Unknown error',
            'UNKNOWN_ERROR',
            adapter.provider,
            error instanceof Error ? error : undefined
          );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: aiError,
        }));

        onError?.(aiError);
        return null;
      }
    },
    [adapter, onError]
  );

  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if ('cancel' in adapter && typeof adapter.cancel === 'function') {
      (adapter as any).cancel();
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
    }));
  }, [adapter]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      response: null,
      isStreaming: false,
      streamedContent: '',
    });
  }, []);

  return {
    state,
    complete,
    stream,
    generateTemplate,
    cancel,
    reset,
  };
}
