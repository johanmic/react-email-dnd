import { describe, it, expect } from 'vitest';
import {
  generateTemplatePreview,
  generateTemplatePreviews,
  generatePlainTextSummary,
  generateHtmlPreview,
  generateTemplateStatistics,
} from './template-previews';
import { emailTemplates, getTemplateById } from './templates';

describe('Template Previews', () => {
  describe('generateTemplatePreview', () => {
    it('should generate a preview for a template', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const preview = generateTemplatePreview(template);

        expect(preview.id).toBe('welcome');
        expect(preview.name).toBe('Welcome Email');
        expect(preview.description).toBeTruthy();
        expect(preview.category).toBe('transactional');
        expect(preview.blockCount).toBeGreaterThan(0);
        expect(preview.sectionCount).toBeGreaterThan(0);
        expect(preview.hasVariables).toBe(true);
        expect(preview.variableCount).toBeGreaterThan(0);
      }
    });

    it('should extract preview text from template', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const preview = generateTemplatePreview(template);
        expect(preview.previewText).toBeTruthy();
        expect(preview.previewText.length).toBeGreaterThan(0);
      }
    });

    it('should handle blank template', () => {
      const template = getTemplateById('blank');
      expect(template).toBeDefined();

      if (template) {
        const preview = generateTemplatePreview(template);

        expect(preview.id).toBe('blank');
        expect(preview.blockCount).toBe(0);
        expect(preview.sectionCount).toBe(0);
        expect(preview.previewText).toBe('');
      }
    });

    it('should count blocks correctly', () => {
      const template = getTemplateById('newsletter');
      expect(template).toBeDefined();

      if (template) {
        const preview = generateTemplatePreview(template);
        expect(preview.blockCount).toBeGreaterThan(5);
      }
    });
  });

  describe('generateTemplatePreviews', () => {
    it('should generate previews for all templates', () => {
      const previews = generateTemplatePreviews(emailTemplates);

      expect(previews.length).toBe(emailTemplates.length);
      expect(previews.length).toBeGreaterThan(0);

      previews.forEach((preview) => {
        expect(preview.id).toBeTruthy();
        expect(preview.name).toBeTruthy();
        expect(preview.description).toBeTruthy();
        expect(preview.category).toBeTruthy();
      });
    });

    it('should maintain template order', () => {
      const previews = generateTemplatePreviews(emailTemplates);

      emailTemplates.forEach((template, index) => {
        expect(previews[index].id).toBe(template.metadata.id);
      });
    });
  });

  describe('generatePlainTextSummary', () => {
    it('should generate plain text summary', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const summary = generatePlainTextSummary(template.document);

        expect(summary).toContain('Title:');
        expect(summary).toContain('Sections:');
        expect(summary).toContain('Blocks:');
        expect(summary).toContain('Content Preview:');
      }
    });

    it('should include variables in summary', () => {
      const template = getTemplateById('password-reset');
      expect(template).toBeDefined();

      if (template) {
        const summary = generatePlainTextSummary(template.document);

        expect(summary).toContain('Variables:');
        expect(summary).toContain('reset_link');
      }
    });

    it('should show content snippets', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const summary = generatePlainTextSummary(template.document);
        expect(summary.length).toBeGreaterThan(100);
      }
    });

    it('should handle different block types', () => {
      const template = getTemplateById('newsletter');
      expect(template).toBeDefined();

      if (template) {
        const summary = generatePlainTextSummary(template.document);

        // Should have at least some content from various block types
        expect(summary.length).toBeGreaterThan(50);
      }
    });
  });

  describe('generateHtmlPreview', () => {
    it('should generate HTML preview', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const html = generateHtmlPreview(template.document);

        expect(html).toContain('<div class="template-preview">');
        expect(html).toContain('</div>');
      }
    });

    it('should include heading styles', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const html = generateHtmlPreview(template.document);
        expect(html).toContain('<h3');
        expect(html).toContain('font-size:');
      }
    });

    it('should include text content', () => {
      const template = getTemplateById('verification');
      expect(template).toBeDefined();

      if (template) {
        const html = generateHtmlPreview(template.document);
        expect(html).toContain('<p');
      }
    });

    it('should generate valid HTML structure', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();

      if (template) {
        const html = generateHtmlPreview(template.document);
        expect(html).toContain('<div class="template-preview">');
        expect(html).toContain('</div>');
        // Should contain some content (headings, text, etc.)
        expect(html.length).toBeGreaterThan(50);
      }
    });

    it('should limit preview length', () => {
      const template = getTemplateById('newsletter');
      expect(template).toBeDefined();

      if (template) {
        const html = generateHtmlPreview(template.document);

        // Should not include all content, just a preview
        const headingCount = (html.match(/<h3/g) || []).length;
        const paragraphCount = (html.match(/<p/g) || []).length;
        const buttonCount = (html.match(/<button/g) || []).length;

        // Total elements should be limited (3 blocks max per section, 2 rows max, 1 section)
        expect(headingCount + paragraphCount + buttonCount).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('generateTemplateStatistics', () => {
    it('should generate statistics for all templates', () => {
      const stats = generateTemplateStatistics(emailTemplates);

      expect(stats.totalTemplates).toBe(emailTemplates.length);
      expect(stats.totalCategories).toBeGreaterThan(0);
      expect(stats.totalTags).toBeGreaterThan(0);
      expect(stats.averageBlockCount).toBeGreaterThan(0);
      expect(stats.averageSectionCount).toBeGreaterThan(0);
    });

    it('should count templates with variables', () => {
      const stats = generateTemplateStatistics(emailTemplates);

      // Most templates should have variables (blank template doesn't)
      expect(stats.templatesWithVariables).toBeGreaterThan(0);
      expect(stats.templatesWithVariables).toBeLessThanOrEqual(stats.totalTemplates);
    });

    it('should provide category breakdown', () => {
      const stats = generateTemplateStatistics(emailTemplates);

      expect(stats.categoryBreakdown).toBeDefined();
      expect(Object.keys(stats.categoryBreakdown).length).toBeGreaterThan(0);

      // Sum of category breakdown should equal total templates
      const sum = Object.values(stats.categoryBreakdown).reduce(
        (acc, count) => acc + count,
        0
      );
      expect(sum).toBe(stats.totalTemplates);
    });

    it('should calculate accurate averages', () => {
      const stats = generateTemplateStatistics(emailTemplates);

      // Averages should be reasonable
      expect(stats.averageBlockCount).toBeGreaterThan(0);
      expect(stats.averageSectionCount).toBeGreaterThan(0);
      expect(stats.averageSectionCount).toBeLessThan(10); // Reasonable upper bound
    });

    it('should handle empty template list', () => {
      const stats = generateTemplateStatistics([]);

      expect(stats.totalTemplates).toBe(0);
      expect(stats.totalCategories).toBe(0);
      expect(stats.totalTags).toBe(0);
      expect(stats.averageBlockCount).toBe(0);
      expect(stats.averageSectionCount).toBe(0);
      expect(stats.templatesWithVariables).toBe(0);
      expect(Object.keys(stats.categoryBreakdown).length).toBe(0);
    });

    it('should count unique categories and tags', () => {
      const stats = generateTemplateStatistics(emailTemplates);

      // Should have multiple categories
      expect(stats.totalCategories).toBeGreaterThanOrEqual(3);

      // Should have many tags
      expect(stats.totalTags).toBeGreaterThan(stats.totalCategories);
    });
  });

  describe('Edge Cases', () => {
    it('should handle templates without tags', () => {
      const template = getTemplateById('blank');
      expect(template).toBeDefined();

      if (template) {
        const preview = generateTemplatePreview(template);
        expect(preview.tags).toEqual(expect.any(Array));
      }
    });

    it('should handle templates without variables', () => {
      const template = getTemplateById('blank');
      expect(template).toBeDefined();

      if (template) {
        const preview = generateTemplatePreview(template);
        expect(preview.hasVariables).toBe(false);
        expect(preview.variableCount).toBe(0);
      }
    });

    it('should handle empty sections gracefully', () => {
      const template = getTemplateById('blank');
      expect(template).toBeDefined();

      if (template) {
        const html = generateHtmlPreview(template.document);
        expect(html).toContain('<div class="template-preview">');
        expect(html).toContain('</div>');
      }
    });
  });
});
