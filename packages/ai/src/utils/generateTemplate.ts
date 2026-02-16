import type { CanvasDocument } from '@react-email-dnd/shared';
import type {
  TemplateGenerationRequest,
  TemplateGenerationResponse,
} from '../types';

/**
 * Generate a unique ID for blocks
 */
function generateId(prefix: string = 'block'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse AI response and generate a template document
 * This function attempts to extract structured content from AI response
 * and convert it into a valid CanvasDocument structure
 */
export function generateTemplateFromDescription(
  aiResponse: string,
  request: TemplateGenerationRequest
): TemplateGenerationResponse {
  try {
    // Try to parse JSON if the AI returned structured data
    const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (isValidDocument(parsed)) {
        return {
          document: parsed,
          description: request.description,
        };
      }
    }
  } catch (e) {
    // If parsing fails, fall through to generate from scratch
  }

  // Generate template based on request parameters
  const document = createTemplateFromRequest(request, aiResponse);

  return {
    document,
    description: request.description,
    suggestions: extractSuggestions(aiResponse),
  };
}

/**
 * Create a template document from the request parameters
 */
function createTemplateFromRequest(
  request: TemplateGenerationRequest,
  aiResponse: string
): CanvasDocument {
  const sections = request.sections || extractSectionsFromResponse(aiResponse);
  const style = request.style || 'modern';

  const canvasSections = sections.map((sectionName) => {
    return createSection(sectionName, style, request.includeImages);
  });

  return {
    version: 1,
    meta: {
      title: extractTitle(request.description, aiResponse),
      description: request.description,
      tags: ['ai-generated', style],
    },
    sections: canvasSections,
  };
}

/**
 * Create a section based on type and style
 */
function createSection(
  name: string,
  style: string,
  includeImages?: boolean
): any {
  const sectionId = generateId('section');
  const rowId = generateId('row');
  const columnId = generateId('column');

  const lowerName = name.toLowerCase();

  // Header section
  if (lowerName.includes('header') || lowerName.includes('hero')) {
    return {
      id: sectionId,
      type: 'section',
      backgroundColor: getBackgroundColorForStyle(style, 'header'),
      padding: { top: 40, right: 20, bottom: 40, left: 20 },
      rows: [
        {
          id: rowId,
          type: 'row',
          columns: [
            {
              id: columnId,
              type: 'column',
              align: 'center',
              blocks: [
                {
                  id: generateId('heading'),
                  type: 'heading',
                  props: {
                    content: extractHeadingFromName(name),
                    as: 'h1',
                    align: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: getTextColorForStyle(style),
                  },
                },
                {
                  id: generateId('text'),
                  type: 'text',
                  props: {
                    content: 'Welcome to our email newsletter',
                    align: 'center',
                    fontSize: 16,
                    color: getTextColorForStyle(style, 'secondary'),
                    margin: '16px 0 0 0',
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  // Footer section
  if (lowerName.includes('footer')) {
    return {
      id: sectionId,
      type: 'section',
      backgroundColor: getBackgroundColorForStyle(style, 'footer'),
      padding: { top: 32, right: 20, bottom: 32, left: 20 },
      rows: [
        {
          id: rowId,
          type: 'row',
          columns: [
            {
              id: columnId,
              type: 'column',
              align: 'center',
              blocks: [
                {
                  id: generateId('text'),
                  type: 'text',
                  props: {
                    content: '© 2026 Your Company. All rights reserved.',
                    align: 'center',
                    fontSize: 12,
                    color: getTextColorForStyle(style, 'muted'),
                  },
                },
                {
                  id: generateId('text'),
                  type: 'text',
                  props: {
                    content: 'Unsubscribe | Privacy Policy',
                    align: 'center',
                    fontSize: 12,
                    color: getTextColorForStyle(style, 'muted'),
                    margin: '8px 0 0 0',
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  // Content section (default)
  const blocks: any[] = [
    {
      id: generateId('heading'),
      type: 'heading',
      props: {
        content: extractHeadingFromName(name),
        as: 'h2',
        fontSize: 24,
        fontWeight: 'bold',
        color: getTextColorForStyle(style),
      },
    },
    {
      id: generateId('text'),
      type: 'text',
      props: {
        content: generatePlaceholderText(name),
        fontSize: 14,
        lineHeight: '1.6',
        color: getTextColorForStyle(style, 'body'),
        margin: '16px 0 0 0',
      },
    },
  ];

  if (includeImages && !lowerName.includes('footer')) {
    blocks.unshift({
      id: generateId('image'),
      type: 'image',
      props: {
        src: 'https://via.placeholder.com/600x300',
        alt: `${name} image`,
        width: 600,
        height: 300,
        margin: '0 0 16px 0',
      },
    });
  }

  // Add CTA button for certain sections
  if (
    lowerName.includes('cta') ||
    lowerName.includes('call to action') ||
    lowerName.includes('action')
  ) {
    blocks.push({
      id: generateId('button'),
      type: 'button',
      props: {
        label: 'Learn More',
        href: 'https://example.com',
        align: 'center',
        backgroundColor: getButtonColorForStyle(style),
        color: '#ffffff',
        borderRadius: 4,
        padding: { top: 12, right: 24, bottom: 12, left: 24 },
        fontSize: 16,
        fontWeight: 'medium',
        margin: '24px 0 0 0',
      },
    });
  }

  return {
    id: sectionId,
    type: 'section',
    backgroundColor: getBackgroundColorForStyle(style, 'content'),
    padding: { top: 32, right: 20, bottom: 32, left: 20 },
    rows: [
      {
        id: rowId,
        type: 'row',
        columns: [
          {
            id: columnId,
            type: 'column',
            blocks,
          },
        ],
      },
    ],
  };
}

/**
 * Extract sections from AI response
 */
function extractSectionsFromResponse(response: string): string[] {
  const sections = ['Header', 'Content', 'Footer'];
  
  // Look for section mentions in the response
  const sectionKeywords = [
    'hero',
    'header',
    'introduction',
    'content',
    'body',
    'features',
    'benefits',
    'testimonial',
    'cta',
    'call to action',
    'footer',
  ];

  const foundSections: string[] = [];
  for (const keyword of sectionKeywords) {
    const regex = new RegExp(keyword, 'i');
    if (regex.test(response)) {
      foundSections.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  return foundSections.length > 0 ? foundSections : sections;
}

/**
 * Extract title from description or response
 */
function extractTitle(description: string, response: string): string {
  // Try to find a title in the response
  const titleMatch = response.match(/title:?\s*["']?([^"'\n]+)["']?/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Generate from description
  const words = description.split(' ').slice(0, 5);
  return words.join(' ') + (words.length < description.split(' ').length ? '...' : '');
}

/**
 * Extract heading from section name
 */
function extractHeadingFromName(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate placeholder text based on section name
 */
function generatePlaceholderText(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('intro')) {
    return 'Welcome! This is an introduction section where you can provide an overview of your content.';
  }
  
  if (lowerName.includes('feature')) {
    return 'Discover our amazing features that will help you achieve your goals more efficiently.';
  }
  
  if (lowerName.includes('benefit')) {
    return 'Experience the benefits of our solution designed to make your life easier.';
  }
  
  if (lowerName.includes('testimonial')) {
    return '"This product has completely transformed the way we work. Highly recommended!" - Happy Customer';
  }
  
  return 'This is placeholder text for your email content. Replace this with your actual content to engage your audience.';
}

/**
 * Get background color based on style
 */
function getBackgroundColorForStyle(
  style: string,
  section: 'header' | 'content' | 'footer' = 'content'
): string {
  const colors: Record<string, Record<string, string>> = {
    minimal: {
      header: '#ffffff',
      content: '#ffffff',
      footer: '#f8f9fa',
    },
    modern: {
      header: '#f8f9fa',
      content: '#ffffff',
      footer: '#2c3e50',
    },
    classic: {
      header: '#ffffff',
      content: '#ffffff',
      footer: '#f5f5f5',
    },
    bold: {
      header: '#1a1a1a',
      content: '#ffffff',
      footer: '#1a1a1a',
    },
  };

  return colors[style]?.[section] || colors.modern[section];
}

/**
 * Get text color based on style
 */
function getTextColorForStyle(
  style: string,
  variant: 'primary' | 'secondary' | 'body' | 'muted' = 'primary'
): string {
  const colors: Record<string, Record<string, string>> = {
    minimal: {
      primary: '#1a1a1a',
      secondary: '#666666',
      body: '#333333',
      muted: '#999999',
    },
    modern: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      body: '#34495e',
      muted: '#95a5a6',
    },
    classic: {
      primary: '#000000',
      secondary: '#555555',
      body: '#333333',
      muted: '#888888',
    },
    bold: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      body: '#f5f5f5',
      muted: '#cccccc',
    },
  };

  return colors[style]?.[variant] || colors.modern[variant];
}

/**
 * Get button color based on style
 */
function getButtonColorForStyle(style: string): string {
  const colors: Record<string, string> = {
    minimal: '#000000',
    modern: '#3498db',
    classic: '#2c5f8d',
    bold: '#e74c3c',
  };

  return colors[style] || colors.modern;
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(response: string): string[] {
  const suggestions: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletPattern = /[•\-\*]\s*(.+)/g;
  let match;
  
  while ((match = bulletPattern.exec(response)) !== null) {
    if (match[1].length > 10 && match[1].length < 200) {
      suggestions.push(match[1].trim());
    }
  }
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Check if a parsed object is a valid document
 */
function isValidDocument(obj: any): obj is CanvasDocument {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.version === 'number' &&
    obj.meta &&
    typeof obj.meta.title === 'string' &&
    Array.isArray(obj.sections)
  );
}
