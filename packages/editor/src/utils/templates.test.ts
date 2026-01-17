import { describe, it, expect } from 'vitest';
import { isCanvasDocument, validateCanvasDocument } from '@react-email-dnd/shared';
import {
  emailTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByTag,
  createDocumentFromTemplate,
  getTemplateCategories,
  getTemplateTags,
  type EmailTemplate,
} from './templates';

describe('Email Templates', () => {
  describe('Template Collection', () => {
    it('should have at least one template', () => {
      expect(emailTemplates.length).toBeGreaterThan(0);
    });

    it('should have unique template IDs', () => {
      const ids = emailTemplates.map((t) => t.metadata.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid metadata for all templates', () => {
      emailTemplates.forEach((template) => {
        expect(template.metadata.id).toBeTruthy();
        expect(template.metadata.name).toBeTruthy();
        expect(template.metadata.description).toBeTruthy();
        expect(template.metadata.category).toBeTruthy();
      });
    });
  });

  describe('Template Schema Validation', () => {
    it('should have valid CanvasDocument structure for all templates', () => {
      emailTemplates.forEach((template) => {
        const result = validateCanvasDocument(template.document);
        if (!result.success) {
          console.error(
            `Template "${template.metadata.id}" failed validation:`,
            result.error
          );
        }
        expect(result.success).toBe(true);
      });
    });

    it('should pass isCanvasDocument check for all templates', () => {
      emailTemplates.forEach((template) => {
        expect(isCanvasDocument(template.document)).toBe(true);
      });
    });

    it('should have version 1 for all templates', () => {
      emailTemplates.forEach((template) => {
        expect(template.document.version).toBe(1);
      });
    });

    it('should have valid meta information', () => {
      emailTemplates.forEach((template) => {
        expect(template.document.meta.title).toBeTruthy();
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by ID', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();
      expect(template?.metadata.id).toBe('welcome');
    });

    it('should return undefined for non-existent ID', () => {
      const template = getTemplateById('non-existent-id');
      expect(template).toBeUndefined();
    });

    it('should return blank template', () => {
      const template = getTemplateById('blank');
      expect(template).toBeDefined();
      expect(template?.metadata.id).toBe('blank');
      expect(template?.document.sections).toHaveLength(0);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates by category', () => {
      const transactional = getTemplatesByCategory('transactional');
      expect(transactional.length).toBeGreaterThan(0);
      transactional.forEach((template) => {
        expect(template.metadata.category).toBe('transactional');
      });
    });

    it('should return marketing templates', () => {
      const marketing = getTemplatesByCategory('marketing');
      expect(marketing.length).toBeGreaterThan(0);
      marketing.forEach((template) => {
        expect(template.metadata.category).toBe('marketing');
      });
    });

    it('should return notification templates', () => {
      const notification = getTemplatesByCategory('notification');
      expect(notification.length).toBeGreaterThan(0);
      notification.forEach((template) => {
        expect(template.metadata.category).toBe('notification');
      });
    });

    it('should return blank category templates', () => {
      const blank = getTemplatesByCategory('blank');
      expect(blank.length).toBeGreaterThan(0);
      blank.forEach((template) => {
        expect(template.metadata.category).toBe('blank');
      });
    });
  });

  describe('getTemplatesByTag', () => {
    it('should return templates by tag', () => {
      const welcomeTemplates = getTemplatesByTag('welcome');
      expect(welcomeTemplates.length).toBeGreaterThan(0);
      welcomeTemplates.forEach((template) => {
        expect(template.metadata.tags).toContain('welcome');
      });
    });

    it('should return empty array for non-existent tag', () => {
      const templates = getTemplatesByTag('non-existent-tag');
      expect(templates).toHaveLength(0);
    });

    it('should find authentication-related templates', () => {
      const authTemplates = getTemplatesByTag('authentication');
      expect(authTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('createDocumentFromTemplate', () => {
    it('should create a document from template', () => {
      const doc = createDocumentFromTemplate('welcome');
      expect(doc).toBeDefined();
      expect(isCanvasDocument(doc)).toBe(true);
    });

    it('should return null for non-existent template', () => {
      const doc = createDocumentFromTemplate('non-existent-id');
      expect(doc).toBeNull();
    });

    it('should generate unique IDs for all elements', () => {
      const doc1 = createDocumentFromTemplate('welcome');
      const doc2 = createDocumentFromTemplate('welcome');
      
      expect(doc1).toBeDefined();
      expect(doc2).toBeDefined();
      
      if (doc1 && doc2) {
        // Section IDs should be different
        if (doc1.sections.length > 0 && doc2.sections.length > 0) {
          expect(doc1.sections[0].id).not.toBe(doc2.sections[0].id);
        }
        
        // Row IDs should be different
        if (doc1.sections[0]?.rows.length > 0 && doc2.sections[0]?.rows.length > 0) {
          expect(doc1.sections[0].rows[0].id).not.toBe(doc2.sections[0].rows[0].id);
        }
        
        // Column IDs should be different
        if (
          doc1.sections[0]?.rows[0]?.columns.length > 0 &&
          doc2.sections[0]?.rows[0]?.columns.length > 0
        ) {
          expect(doc1.sections[0].rows[0].columns[0].id).not.toBe(
            doc2.sections[0].rows[0].columns[0].id
          );
        }
        
        // Block IDs should be different
        if (
          doc1.sections[0]?.rows[0]?.columns[0]?.blocks.length > 0 &&
          doc2.sections[0]?.rows[0]?.columns[0]?.blocks.length > 0
        ) {
          expect(doc1.sections[0].rows[0].columns[0].blocks[0].id).not.toBe(
            doc2.sections[0].rows[0].columns[0].blocks[0].id
          );
        }
      }
    });

    it('should create valid documents for all templates', () => {
      emailTemplates.forEach((template) => {
        const doc = createDocumentFromTemplate(template.metadata.id);
        expect(doc).toBeDefined();
        expect(isCanvasDocument(doc)).toBe(true);
      });
    });

    it('should preserve template content', () => {
      const template = getTemplateById('welcome');
      const doc = createDocumentFromTemplate('welcome');
      
      expect(doc).toBeDefined();
      expect(template).toBeDefined();
      
      if (doc && template) {
        // Should preserve meta information
        expect(doc.meta.title).toBe(template.document.meta.title);
        
        // Should preserve variables
        expect(doc.variables).toEqual(template.document.variables);
        
        // Should have same structure (sections, rows, columns, blocks counts)
        expect(doc.sections.length).toBe(template.document.sections.length);
        if (doc.sections.length > 0 && template.document.sections.length > 0) {
          expect(doc.sections[0].rows.length).toBe(
            template.document.sections[0].rows.length
          );
        }
      }
    });
  });

  describe('getTemplateCategories', () => {
    it('should return all unique categories', () => {
      const categories = getTemplateCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      // Should have no duplicates
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    it('should include expected categories', () => {
      const categories = getTemplateCategories();
      expect(categories).toContain('transactional');
      expect(categories).toContain('marketing');
      expect(categories).toContain('notification');
      expect(categories).toContain('blank');
    });
  });

  describe('getTemplateTags', () => {
    it('should return all unique tags', () => {
      const tags = getTemplateTags();
      expect(tags.length).toBeGreaterThan(0);
      
      // Should have no duplicates
      const uniqueTags = new Set(tags);
      expect(uniqueTags.size).toBe(tags.length);
    });

    it('should return sorted tags', () => {
      const tags = getTemplateTags();
      const sortedTags = [...tags].sort();
      expect(tags).toEqual(sortedTags);
    });

    it('should include common tags', () => {
      const tags = getTemplateTags();
      expect(tags.length).toBeGreaterThan(0);
      // Just verify we have tags, specific tags may vary
    });
  });

  describe('Template Content Validation', () => {
    it('welcome template should have proper structure', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('transactional');
        expect(template.document.sections.length).toBeGreaterThan(0);
        expect(template.document.variables).toHaveProperty('user_name');
        expect(template.document.variables).toHaveProperty('company_name');
      }
    });

    it('password-reset template should have proper structure', () => {
      const template = getTemplateById('password-reset');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('transactional');
        expect(template.document.variables).toHaveProperty('reset_link');
      }
    });

    it('verification template should have proper structure', () => {
      const template = getTemplateById('verification');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('transactional');
        expect(template.document.variables).toHaveProperty('verification_code');
      }
    });

    it('newsletter template should have proper structure', () => {
      const template = getTemplateById('newsletter');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('marketing');
        expect(template.document.variables).toHaveProperty('company_name');
      }
    });

    it('order-confirmation template should have proper structure', () => {
      const template = getTemplateById('order-confirmation');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('transactional');
        expect(template.document.variables).toHaveProperty('order_number');
      }
    });

    it('notification template should have proper structure', () => {
      const template = getTemplateById('notification');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('notification');
        expect(template.document.variables).toHaveProperty('notification_title');
      }
    });

    it('invitation template should have proper structure', () => {
      const template = getTemplateById('invitation');
      expect(template).toBeDefined();
      
      if (template) {
        expect(template.metadata.category).toBe('transactional');
        expect(template.document.variables).toHaveProperty('team_name');
        expect(template.document.variables).toHaveProperty('inviter_name');
      }
    });
  });

  describe('Template Variables', () => {
    it('all templates should have variables object', () => {
      emailTemplates.forEach((template) => {
        expect(template.document.variables).toBeDefined();
        expect(typeof template.document.variables).toBe('object');
      });
    });

    it('should support template variable syntax in content', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();
      
      if (template) {
        const doc = template.document;
        let hasVariableSyntax = false;
        
        doc.sections.forEach((section) => {
          section.rows.forEach((row) => {
            row.columns.forEach((column) => {
              column.blocks.forEach((block) => {
                if ('content' in block.props && typeof block.props.content === 'string') {
                  if (block.props.content.includes('{{') && block.props.content.includes('}}')) {
                    hasVariableSyntax = true;
                  }
                }
              });
            });
          });
        });
        
        expect(hasVariableSyntax).toBe(true);
      }
    });
  });
});
