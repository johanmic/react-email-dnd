import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIAdapter } from '../adapters/openai';
import { generateTemplateFromDescription } from '../utils/generateTemplate';
import {
  AIRequestSchema,
  TemplateGenerationRequestSchema,
  AIModelConfigSchema,
  AIError,
  AIAuthError,
} from '../types';

describe('AI Package', () => {
  describe('Types and Schemas', () => {
    it('should validate AIRequest schema', () => {
      const validRequest = {
        prompt: 'Create an email template',
        temperature: 0.7,
        maxTokens: 1000,
      };

      const result = AIRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid AIRequest', () => {
      const invalidRequest = {
        prompt: '', // Empty prompt should fail
        temperature: 3, // Out of range
      };

      const result = AIRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should validate TemplateGenerationRequest schema', () => {
      const validRequest = {
        description: 'Create a welcome email',
        style: 'modern',
        includeImages: true,
      };

      const result = TemplateGenerationRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate AIModelConfig schema', () => {
      const validConfig = {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'sk-test-key',
        temperature: 0.8,
      };

      const result = AIModelConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('OpenAI Adapter', () => {
    it('should throw error when API key is missing', () => {
      expect(() => {
        new OpenAIAdapter({
          provider: 'openai',
          model: 'gpt-4o-mini',
        });
      }).toThrow(AIAuthError);
    });

    it('should create adapter with valid config', () => {
      const adapter = new OpenAIAdapter({
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'sk-test-key',
      });

      expect(adapter.provider).toBe('openai');
      expect(adapter.model).toBe('gpt-4o-mini');
    });

    it('should use default model when not specified', () => {
      const adapter = new OpenAIAdapter({
        provider: 'openai',
        model: '',
        apiKey: 'sk-test-key',
      });

      expect(adapter.model).toBe('gpt-4o-mini');
    });
  });

  describe('Template Generator', () => {
    it('should generate template from description', () => {
      const request = {
        description: 'Create a welcome email with header and footer',
        style: 'modern' as const,
        includeImages: false,
      };

      const aiResponse = 'Here is your email template with header and footer sections.';
      const result = generateTemplateFromDescription(aiResponse, request);

      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.document.version).toBe(1);
      expect(result.document.meta.title).toBeDefined();
      expect(result.document.sections).toBeInstanceOf(Array);
      expect(result.document.sections.length).toBeGreaterThan(0);
    });

    it('should extract sections from AI response', () => {
      const request = {
        description: 'Email with hero, features, and CTA',
      };

      const aiResponse = 'Creating an email with hero section, features list, and call to action.';
      const result = generateTemplateFromDescription(aiResponse, request);

      expect(result.document.sections.length).toBeGreaterThan(0);
    });

    it('should handle custom sections', () => {
      const request = {
        description: 'Newsletter email',
        sections: ['Header', 'Article', 'Subscribe', 'Footer'],
      };

      const aiResponse = 'Creating a newsletter email template.';
      const result = generateTemplateFromDescription(aiResponse, request);

      expect(result.document.sections.length).toBe(4);
    });

    it('should apply style preferences', () => {
      const request = {
        description: 'Marketing email',
        style: 'bold' as const,
      };

      const aiResponse = 'Creating a bold marketing email.';
      const result = generateTemplateFromDescription(aiResponse, request);

      expect(result.document.meta.tags).toContain('bold');
    });

    it('should include images when requested', () => {
      const request = {
        description: 'Product showcase email',
        includeImages: true,
        sections: ['Header', 'Products'],
      };

      const aiResponse = 'Creating product showcase with images.';
      const result = generateTemplateFromDescription(aiResponse, request);

      // Check if any section has image blocks
      let hasImages = false;
      for (const section of result.document.sections) {
        for (const row of section.rows) {
          for (const column of row.columns) {
            if (column.blocks.some((block: any) => block.type === 'image')) {
              hasImages = true;
              break;
            }
          }
        }
      }

      expect(hasImages).toBe(true);
    });

    it('should parse JSON response when available', () => {
      const request = {
        description: 'Simple email',
      };

      const jsonDocument = {
        version: 1,
        meta: {
          title: 'Test Email',
          description: 'Test',
        },
        sections: [
          {
            id: 'section-1',
            type: 'section',
            rows: [],
          },
        ],
      };

      const aiResponse = `Here's your template:\n\`\`\`json\n${JSON.stringify(jsonDocument)}\n\`\`\``;
      const result = generateTemplateFromDescription(aiResponse, request);

      expect(result.document.meta.title).toBe('Test Email');
    });
  });

  describe('Error Classes', () => {
    it('should create AIError with proper fields', () => {
      const error = new AIError('Test error', 'TEST_CODE', 'openai');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.provider).toBe('openai');
      expect(error.name).toBe('AIError');
    });

    it('should create AIAuthError', () => {
      const error = new AIAuthError('Auth failed', 'openai');

      expect(error.code).toBe('AUTH_ERROR');
      expect(error.name).toBe('AIAuthError');
    });

    it('should preserve original error', () => {
      const originalError = new Error('Original');
      const aiError = new AIError('Wrapped', 'TEST', 'openai', originalError);

      expect(aiError.originalError).toBe(originalError);
    });
  });

  describe('Document Structure', () => {
    it('should generate valid document structure', () => {
      const request = {
        description: 'Test email',
      };

      const result = generateTemplateFromDescription('Test response', request);
      const doc = result.document;

      // Check version
      expect(typeof doc.version).toBe('number');

      // Check meta
      expect(doc.meta).toBeDefined();
      expect(typeof doc.meta.title).toBe('string');

      // Check sections
      expect(Array.isArray(doc.sections)).toBe(true);
      
      // Check section structure
      doc.sections.forEach((section: any) => {
        expect(section.id).toBeDefined();
        expect(section.type).toBe('section');
        expect(Array.isArray(section.rows)).toBe(true);

        section.rows.forEach((row: any) => {
          expect(row.id).toBeDefined();
          expect(row.type).toBe('row');
          expect(Array.isArray(row.columns)).toBe(true);

          row.columns.forEach((column: any) => {
            expect(column.id).toBeDefined();
            expect(column.type).toBe('column');
            expect(Array.isArray(column.blocks)).toBe(true);
          });
        });
      });
    });

    it('should generate different content for different sections', () => {
      const request = {
        description: 'Multi-section email',
        sections: ['Header', 'Content', 'Footer'],
      };

      const result = generateTemplateFromDescription('Test response', request);

      expect(result.document.sections.length).toBe(3);
      
      // Each section should have unique IDs
      const ids = result.document.sections.map((s: any) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
