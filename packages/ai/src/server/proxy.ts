import type {
  AIRequest,
  AIStreamRequest,
  TemplateGenerationRequest,
  ProxyConfig,
} from '../types';
import {
  AIRequestSchema,
  TemplateGenerationRequestSchema,
} from '../types';

/**
 * Server-side proxy for AI requests
 * Handles secure forwarding of requests to AI providers
 */
export class AIProxy {
  private config: Required<ProxyConfig>;
  private requestCounts: Map<string, { count: number; resetAt: number }>;

  constructor(config: ProxyConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
      allowedOrigins: config.allowedOrigins || ['*'],
      rateLimit: config.rateLimit || {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
      },
    };

    this.requestCounts = new Map();
  }

  /**
   * Check if origin is allowed
   */
  private isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return false;
    if (this.config.allowedOrigins.includes('*')) return true;
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Check rate limit for client
   */
  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now > clientData.resetAt) {
      this.requestCounts.set(clientId, {
        count: 1,
        resetAt: now + this.config.rateLimit.windowMs,
      });
      return true;
    }

    if (clientData.count >= this.config.rateLimit.maxRequests) {
      return false;
    }

    clientData.count++;
    return true;
  }

  /**
   * Get client identifier (IP or session ID)
   */
  private getClientId(request: any): string {
    // Try to get from various sources
    const ip =
      request.ip ||
      request.headers?.['x-forwarded-for'] ||
      request.headers?.['x-real-ip'] ||
      request.connection?.remoteAddress ||
      'unknown';

    return Array.isArray(ip) ? ip[0] : ip;
  }

  /**
   * Validate and sanitize request
   */
  private validateRequest(
    body: unknown,
    type: 'completion' | 'template'
  ): AIRequest | TemplateGenerationRequest {
    try {
      if (type === 'completion') {
        return AIRequestSchema.parse(body);
      } else {
        return TemplateGenerationRequestSchema.parse(body);
      }
    } catch (error) {
      throw new Error('Invalid request body');
    }
  }

  /**
   * Handle completion request
   */
  async handleCompletion(
    request: any,
    body: unknown
  ): Promise<{ status: number; data: any }> {
    // Check origin
    const origin = request.headers?.origin;
    if (!this.isOriginAllowed(origin)) {
      return {
        status: 403,
        data: { error: 'Origin not allowed' },
      };
    }

    // Check rate limit
    const clientId = this.getClientId(request);
    if (!this.checkRateLimit(clientId)) {
      return {
        status: 429,
        data: { error: 'Rate limit exceeded' },
      };
    }

    // Validate request
    let aiRequest: AIRequest;
    try {
      aiRequest = this.validateRequest(body, 'completion') as AIRequest;
    } catch (error) {
      return {
        status: 400,
        data: { error: 'Invalid request body' },
      };
    }

    // Check API key
    if (!this.config.apiKey) {
      return {
        status: 500,
        data: { error: 'API key not configured' },
      };
    }

    // Forward to OpenAI (or other provider)
    try {
      const { OpenAIAdapter } = await import('../adapters/openai');
      const adapter = new OpenAIAdapter({
        provider: 'openai',
        model: aiRequest.model || 'gpt-4o-mini',
        apiKey: this.config.apiKey,
      });

      const response = await adapter.complete(aiRequest);

      return {
        status: 200,
        data: response,
      };
    } catch (error: any) {
      return {
        status: error.status || 500,
        data: {
          error: error.message || 'Internal server error',
          code: error.code,
        },
      };
    }
  }

  /**
   * Handle template generation request
   */
  async handleTemplateGeneration(
    request: any,
    body: unknown
  ): Promise<{ status: number; data: any }> {
    // Check origin
    const origin = request.headers?.origin;
    if (!this.isOriginAllowed(origin)) {
      return {
        status: 403,
        data: { error: 'Origin not allowed' },
      };
    }

    // Check rate limit
    const clientId = this.getClientId(request);
    if (!this.checkRateLimit(clientId)) {
      return {
        status: 429,
        data: { error: 'Rate limit exceeded' },
      };
    }

    // Validate request
    let templateRequest: TemplateGenerationRequest;
    try {
      templateRequest = this.validateRequest(
        body,
        'template'
      ) as TemplateGenerationRequest;
    } catch (error) {
      return {
        status: 400,
        data: { error: 'Invalid request body' },
      };
    }

    // Check API key
    if (!this.config.apiKey) {
      return {
        status: 500,
        data: { error: 'API key not configured' },
      };
    }

    // Forward to OpenAI (or other provider)
    try {
      const { OpenAIAdapter } = await import('../adapters/openai');
      const adapter = new OpenAIAdapter({
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: this.config.apiKey,
      });

      const response = await adapter.generateTemplate(templateRequest);

      return {
        status: 200,
        data: response,
      };
    } catch (error: any) {
      return {
        status: error.status || 500,
        data: {
          error: error.message || 'Internal server error',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get CORS headers
   */
  getCORSHeaders(origin?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (origin && this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else if (this.config.allowedOrigins.includes('*')) {
      headers['Access-Control-Allow-Origin'] = '*';
    }

    return headers;
  }
}

/**
 * Factory function to create a proxy instance
 */
export function createAIProxy(config?: ProxyConfig): AIProxy {
  return new AIProxy(config);
}

/**
 * Express-like middleware for AI proxy
 */
export function createAIProxyMiddleware(config?: ProxyConfig) {
  const proxy = createAIProxy(config);

  return {
    completion: async (req: any, res: any) => {
      if (req.method === 'OPTIONS') {
        const headers = proxy.getCORSHeaders(req.headers?.origin);
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.status(200).end();
        return;
      }

      const result = await proxy.handleCompletion(req, req.body);
      
      const headers = proxy.getCORSHeaders(req.headers?.origin);
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(result.status).json(result.data);
    },

    template: async (req: any, res: any) => {
      if (req.method === 'OPTIONS') {
        const headers = proxy.getCORSHeaders(req.headers?.origin);
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.status(200).end();
        return;
      }

      const result = await proxy.handleTemplateGeneration(req, req.body);
      
      const headers = proxy.getCORSHeaders(req.headers?.origin);
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(result.status).json(result.data);
    },
  };
}
