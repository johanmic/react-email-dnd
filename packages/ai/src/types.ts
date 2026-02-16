/**
 * AI-related type definitions for react-email-dnd
 */

/**
 * Configuration options for AI providers
 */
export interface AIProviderConfig {
  /**
   * API key for the AI provider
   */
  apiKey?: string;
  /**
   * Base URL for the AI provider API
   */
  baseUrl?: string;
  /**
   * Model identifier to use
   */
  model?: string;
}

/**
 * AI generation request
 */
export interface AIGenerationRequest {
  /**
   * Prompt for AI generation
   */
  prompt: string;
  /**
   * Optional context or additional parameters
   */
  context?: Record<string, unknown>;
}

/**
 * AI generation response
 */
export interface AIGenerationResponse {
  /**
   * Generated content
   */
  content: string;
  /**
   * Optional metadata about the generation
   */
  metadata?: Record<string, unknown>;
}
