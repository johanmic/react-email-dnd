import type { CanvasDocument } from '@react-email-dnd/shared';
import type { EmailTemplate } from './templates';

/**
 * Preview metadata for a template
 */
export interface TemplatePreview {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  blockCount: number;
  sectionCount: number;
  hasVariables: boolean;
  variableCount: number;
  previewText: string;
}

/**
 * Extract preview text from the first text or heading block in the document
 */
function extractPreviewText(document: CanvasDocument): string {
  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if ((block.type === 'text' || block.type === 'heading') && 'content' in block.props) {
            const content = block.props.content as string;
            return content.substring(0, 100) + (content.length > 100 ? '...' : '');
          }
        }
      }
    }
  }
  return '';
}

/**
 * Count total blocks in a document
 */
function countBlocks(document: CanvasDocument): number {
  let count = 0;
  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        count += column.blocks.length;
      }
    }
  }
  return count;
}

/**
 * Generate a preview for a template
 */
export function generateTemplatePreview(template: EmailTemplate): TemplatePreview {
  const { document, metadata } = template;
  const variableCount = document.variables ? Object.keys(document.variables).length : 0;

  return {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    tags: metadata.tags || [],
    blockCount: countBlocks(document),
    sectionCount: document.sections.length,
    hasVariables: variableCount > 0,
    variableCount,
    previewText: extractPreviewText(document),
  };
}

/**
 * Generate previews for multiple templates
 */
export function generateTemplatePreviews(templates: EmailTemplate[]): TemplatePreview[] {
  return templates.map(generateTemplatePreview);
}

/**
 * Generate a plain text summary of a document
 */
export function generatePlainTextSummary(document: CanvasDocument): string {
  const lines: string[] = [];

  lines.push(`Title: ${document.meta.title}`);
  if (document.meta.description) {
    lines.push(`Description: ${document.meta.description}`);
  }
  lines.push(`Sections: ${document.sections.length}`);
  lines.push(`Blocks: ${countBlocks(document)}`);

  if (document.variables && Object.keys(document.variables).length > 0) {
    lines.push(`Variables: ${Object.keys(document.variables).join(', ')}`);
  }

  lines.push('');
  lines.push('Content Preview:');

  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if ((block.type === 'text' || block.type === 'heading') && 'content' in block.props) {
            const content = block.props.content as string;
            lines.push(`  ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`);
          } else if (block.type === 'button' && 'label' in block.props) {
            lines.push(`  [Button: ${block.props.label}]`);
          } else if (block.type === 'image' && 'alt' in block.props) {
            lines.push(`  [Image: ${block.props.alt || 'No alt text'}]`);
          } else if (block.type === 'divider') {
            lines.push('  ---');
          }
        }
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate HTML preview snippet (for use in template picker UI)
 */
export function generateHtmlPreview(document: CanvasDocument): string {
  const parts: string[] = [];

  parts.push('<div class="template-preview">');

  for (const section of document.sections.slice(0, 1)) {
    // Only first section
    for (const row of section.rows.slice(0, 2)) {
      // Only first 2 rows
      for (const column of row.columns) {
        for (const block of column.blocks.slice(0, 3)) {
          // Only first 3 blocks
          if (block.type === 'heading' && 'content' in block.props) {
            const content = block.props.content as string;
            const fontSize = 'fontSize' in block.props ? block.props.fontSize : 24;
            const color = 'color' in block.props ? block.props.color : '#000000';
            parts.push(
              `<h3 style="font-size: ${fontSize}px; color: ${color}; margin: 0 0 8px 0;">${content}</h3>`
            );
          } else if (block.type === 'text' && 'content' in block.props) {
            const content = block.props.content as string;
            const fontSize = 'fontSize' in block.props ? block.props.fontSize : 16;
            const color = 'color' in block.props ? block.props.color : '#333333';
            const truncated = content.substring(0, 100) + (content.length > 100 ? '...' : '');
            parts.push(
              `<p style="font-size: ${fontSize}px; color: ${color}; margin: 0 0 8px 0;">${truncated}</p>`
            );
          } else if (block.type === 'button' && 'label' in block.props) {
            const label = block.props.label as string;
            const bgColor =
              'backgroundColor' in block.props
                ? block.props.backgroundColor
                : '#007bff';
            const color = 'color' in block.props ? block.props.color : '#ffffff';
            parts.push(
              `<button style="background-color: ${bgColor}; color: ${color}; padding: 8px 16px; border: none; border-radius: 4px; margin: 8px 0;">${label}</button>`
            );
          }
        }
      }
    }
  }

  parts.push('</div>');

  return parts.join('');
}

/**
 * Get template statistics
 */
export interface TemplateStatistics {
  totalTemplates: number;
  totalCategories: number;
  totalTags: number;
  averageBlockCount: number;
  averageSectionCount: number;
  templatesWithVariables: number;
  categoryBreakdown: Record<string, number>;
}

/**
 * Generate statistics for a collection of templates
 */
export function generateTemplateStatistics(templates: EmailTemplate[]): TemplateStatistics {
  const categories = new Set<string>();
  const tags = new Set<string>();
  let totalBlocks = 0;
  let totalSections = 0;
  let templatesWithVariables = 0;
  const categoryBreakdown: Record<string, number> = {};

  templates.forEach((template) => {
    categories.add(template.metadata.category);
    template.metadata.tags?.forEach((tag) => tags.add(tag));
    totalBlocks += countBlocks(template.document);
    totalSections += template.document.sections.length;

    if (
      template.document.variables &&
      Object.keys(template.document.variables).length > 0
    ) {
      templatesWithVariables++;
    }

    const category = template.metadata.category;
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  return {
    totalTemplates: templates.length,
    totalCategories: categories.size,
    totalTags: tags.size,
    averageBlockCount: templates.length > 0 ? totalBlocks / templates.length : 0,
    averageSectionCount: templates.length > 0 ? totalSections / templates.length : 0,
    templatesWithVariables,
    categoryBreakdown,
  };
}
