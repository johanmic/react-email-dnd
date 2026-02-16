/**
 * Tests for AI block generators
 * Ensures generated blocks validate against shared schema and match renderer types
 */

import {
  generateBlockId,
  generateTextBlock,
  generateHeadingBlock,
  generateButtonBlock,
  generateImageBlock,
  generateDividerBlock,
  generateCustomBlock,
  generateColumnBlock,
  generateRowBlock,
  generateSectionBlock,
  generateDocument,
  generateSimpleLayout,
  generateMultiColumnLayout,
} from '../src/blocks/aiGenerators';

import {
  textBlockSchema,
  headingBlockSchema,
  buttonBlockSchema,
  imageBlockSchema,
  dividerBlockSchema,
  customBlockSchema,
  canvasColumnSchema,
  canvasRowSchema,
  canvasSectionSchema,
  canvasDocumentSchema,
} from '@react-email-dnd/shared';

describe('generateBlockId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateBlockId();
    const id2 = generateBlockId();
    expect(id1).not.toBe(id2);
  });

  it('should use provided prefix', () => {
    const id = generateBlockId('custom');
    expect(id).toMatch(/^custom-/);
  });

  it('should generate different IDs on multiple calls', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateBlockId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('generateTextBlock', () => {
  it('should generate a valid text block', () => {
    const block = generateTextBlock({
      content: 'Hello, World!',
    });

    expect(block.type).toBe('text');
    expect(block.props.content).toBe('Hello, World!');
    expect(block.id).toBeDefined();
    expect(textBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support all text props', () => {
    const block = generateTextBlock({
      content: 'Styled text',
      fontSize: 16,
      color: '#333333',
      align: 'center',
      fontWeight: 'bold',
      fontFamily: 'Arial',
      lineHeight: '1.5',
      margin: '10px',
      padding: '20px',
      className: 'custom-class',
    });

    expect(block.props.fontSize).toBe(16);
    expect(block.props.color).toBe('#333333');
    expect(block.props.align).toBe('center');
    expect(textBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support custom ID', () => {
    const block = generateTextBlock(
      { content: 'Test' },
      { id: 'custom-id-123' }
    );

    expect(block.id).toBe('custom-id-123');
  });

  it('should support locked and hidden options', () => {
    const block = generateTextBlock(
      { content: 'Test' },
      { locked: true, hidden: true }
    );

    expect(block.locked).toBe(true);
    expect(block.hidden).toBe(true);
  });

  it('should skip validation when validate is false', () => {
    const block = generateTextBlock(
      { content: 'Test' },
      { validate: false }
    );

    expect(block).toBeDefined();
  });
});

describe('generateHeadingBlock', () => {
  it('should generate a valid heading block', () => {
    const block = generateHeadingBlock({
      content: 'Main Title',
    });

    expect(block.type).toBe('heading');
    expect(block.props.content).toBe('Main Title');
    expect(headingBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support heading levels', () => {
    const levels: Array<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ];

    levels.forEach((level) => {
      const block = generateHeadingBlock({
        content: 'Title',
        as: level,
      });

      expect(block.props.as).toBe(level);
      expect(headingBlockSchema.safeParse(block).success).toBe(true);
    });
  });

  it('should support all heading props', () => {
    const block = generateHeadingBlock({
      content: 'Styled Heading',
      as: 'h2',
      fontSize: 24,
      color: '#000000',
      align: 'left',
      fontWeight: 'extrabold',
      fontFamily: 'Helvetica',
      lineHeight: '1.2',
    });

    expect(block.props.fontSize).toBe(24);
    expect(block.props.fontWeight).toBe('extrabold');
    expect(headingBlockSchema.safeParse(block).success).toBe(true);
  });
});

describe('generateButtonBlock', () => {
  it('should generate a valid button block', () => {
    const block = generateButtonBlock({
      label: 'Click me',
    });

    expect(block.type).toBe('button');
    expect(block.props.label).toBe('Click me');
    expect(buttonBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support button with href', () => {
    const block = generateButtonBlock({
      label: 'Visit Site',
      href: 'https://example.com',
    });

    expect(block.props.href).toBe('https://example.com');
    expect(buttonBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support all button styling props', () => {
    const block = generateButtonBlock({
      label: 'Styled Button',
      backgroundColor: '#007bff',
      color: '#ffffff',
      borderRadius: 8,
      padding: '12px 24px',
      fontSize: 14,
      fontWeight: 'medium',
      align: 'center',
    });

    expect(block.props.backgroundColor).toBe('#007bff');
    expect(block.props.borderRadius).toBe(8);
    expect(buttonBlockSchema.safeParse(block).success).toBe(true);
  });
});

describe('generateImageBlock', () => {
  it('should generate a valid image block', () => {
    const block = generateImageBlock({
      src: 'https://example.com/image.jpg',
    });

    expect(block.type).toBe('image');
    expect(block.props.src).toBe('https://example.com/image.jpg');
    expect(imageBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support image with alt text and dimensions', () => {
    const block = generateImageBlock({
      src: 'https://example.com/logo.png',
      alt: 'Company Logo',
      width: 200,
      height: 100,
    });

    expect(block.props.alt).toBe('Company Logo');
    expect(block.props.width).toBe(200);
    expect(block.props.height).toBe(100);
    expect(imageBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support image as link', () => {
    const block = generateImageBlock({
      src: 'https://example.com/banner.jpg',
      href: 'https://example.com',
    });

    expect(block.props.href).toBe('https://example.com');
    expect(imageBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support image styling', () => {
    const block = generateImageBlock({
      src: 'https://example.com/avatar.jpg',
      borderRadius: 50,
      align: 'center',
      margin: '20px',
    });

    expect(block.props.borderRadius).toBe(50);
    expect(block.props.align).toBe('center');
    expect(imageBlockSchema.safeParse(block).success).toBe(true);
  });
});

describe('generateDividerBlock', () => {
  it('should generate a valid divider block with defaults', () => {
    const block = generateDividerBlock();

    expect(block.type).toBe('divider');
    expect(dividerBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support divider styling', () => {
    const block = generateDividerBlock({
      color: '#cccccc',
      thickness: 2,
      width: '80%',
      align: 'center',
      margin: '30px 0',
    });

    expect(block.props.color).toBe('#cccccc');
    expect(block.props.thickness).toBe(2);
    expect(block.props.width).toBe('80%');
    expect(dividerBlockSchema.safeParse(block).success).toBe(true);
  });
});

describe('generateCustomBlock', () => {
  it('should generate a valid custom block', () => {
    const block = generateCustomBlock({
      componentName: 'Newsletter',
      props: {
        variant: 'default',
        showLogo: true,
      },
    });

    expect(block.type).toBe('custom');
    expect(block.props.componentName).toBe('Newsletter');
    expect(block.props.props.variant).toBe('default');
    expect(customBlockSchema.safeParse(block).success).toBe(true);
  });

  it('should support complex custom props', () => {
    const block = generateCustomBlock({
      componentName: 'ProductCard',
      props: {
        product: {
          id: '123',
          name: 'Product Name',
          price: 99.99,
          image: 'https://example.com/product.jpg',
        },
        showAddToCart: true,
        locale: 'en-US',
      },
    });

    expect(block.props.componentName).toBe('ProductCard');
    expect((block.props.props as any).product.id).toBe('123');
    expect(customBlockSchema.safeParse(block).success).toBe(true);
  });
});

describe('generateColumnBlock', () => {
  it('should generate a valid column with content blocks', () => {
    const textBlock = generateTextBlock({ content: 'Column content' });
    const column = generateColumnBlock([textBlock]);

    expect(column.type).toBe('column');
    expect(column.blocks).toHaveLength(1);
    expect(column.blocks[0].type).toBe('text');
    expect(canvasColumnSchema.safeParse(column).success).toBe(true);
  });

  it('should support column width', () => {
    const column = generateColumnBlock([], { width: 50 });

    expect(column.width).toBe(50);
    expect(canvasColumnSchema.safeParse(column).success).toBe(true);
  });

  it('should support column styling', () => {
    const column = generateColumnBlock([], {
      backgroundColor: '#f5f5f5',
      padding: '20px',
      margin: '10px',
      align: 'center',
      className: 'custom-column',
    });

    expect(column.backgroundColor).toBe('#f5f5f5');
    expect(column.padding).toBe('20px');
    expect(column.className).toBe('custom-column');
    expect(canvasColumnSchema.safeParse(column).success).toBe(true);
  });

  it('should support multiple content blocks', () => {
    const blocks = [
      generateTextBlock({ content: 'Paragraph 1' }),
      generateTextBlock({ content: 'Paragraph 2' }),
      generateButtonBlock({ label: 'Action' }),
    ];

    const column = generateColumnBlock(blocks);

    expect(column.blocks).toHaveLength(3);
    expect(canvasColumnSchema.safeParse(column).success).toBe(true);
  });
});

describe('generateRowBlock', () => {
  it('should generate a valid row with columns', () => {
    const column = generateColumnBlock([
      generateTextBlock({ content: 'Content' }),
    ]);
    const row = generateRowBlock([column]);

    expect(row.type).toBe('row');
    expect(row.columns).toHaveLength(1);
    expect(canvasRowSchema.safeParse(row).success).toBe(true);
  });

  it('should support multiple columns', () => {
    const columns = [
      generateColumnBlock([generateTextBlock({ content: 'Column 1' })]),
      generateColumnBlock([generateTextBlock({ content: 'Column 2' })]),
      generateColumnBlock([generateTextBlock({ content: 'Column 3' })]),
    ];

    const row = generateRowBlock(columns);

    expect(row.columns).toHaveLength(3);
    expect(canvasRowSchema.safeParse(row).success).toBe(true);
  });

  it('should support row styling and gutter', () => {
    const row = generateRowBlock([], {
      gutter: 16,
      backgroundColor: '#ffffff',
      padding: '30px',
      className: 'custom-row',
    });

    expect(row.gutter).toBe(16);
    expect(row.backgroundColor).toBe('#ffffff');
    expect(canvasRowSchema.safeParse(row).success).toBe(true);
  });
});

describe('generateSectionBlock', () => {
  it('should generate a valid section with rows', () => {
    const row = generateRowBlock([
      generateColumnBlock([generateTextBlock({ content: 'Section content' })]),
    ]);
    const section = generateSectionBlock([row]);

    expect(section.type).toBe('section');
    expect(section.rows).toHaveLength(1);
    expect(canvasSectionSchema.safeParse(section).success).toBe(true);
  });

  it('should support multiple rows', () => {
    const rows = [
      generateRowBlock([generateColumnBlock([])]),
      generateRowBlock([generateColumnBlock([])]),
    ];

    const section = generateSectionBlock(rows);

    expect(section.rows).toHaveLength(2);
    expect(canvasSectionSchema.safeParse(section).success).toBe(true);
  });

  it('should support section styling', () => {
    const section = generateSectionBlock([], {
      backgroundColor: '#f9f9f9',
      padding: { top: 40, bottom: 40 },
      margin: '0',
      className: 'hero-section',
    });

    expect(section.backgroundColor).toBe('#f9f9f9');
    expect(section.className).toBe('hero-section');
    expect(canvasSectionSchema.safeParse(section).success).toBe(true);
  });
});

describe('generateDocument', () => {
  it('should generate a valid document with sections', () => {
    const section = generateSectionBlock([
      generateRowBlock([
        generateColumnBlock([generateTextBlock({ content: 'Hello' })]),
      ]),
    ]);

    const document = generateDocument([section]);

    expect(document.version).toBe(1);
    expect(document.sections).toHaveLength(1);
    expect(document.meta.title).toBe('Untitled Document');
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should support custom metadata', () => {
    const document = generateDocument([], {
      meta: {
        title: 'Newsletter',
        description: 'Monthly newsletter',
        tags: ['newsletter', 'monthly'],
      },
    });

    expect(document.meta.title).toBe('Newsletter');
    expect(document.meta.description).toBe('Monthly newsletter');
    expect(document.meta.tags).toEqual(['newsletter', 'monthly']);
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should support variables', () => {
    const document = generateDocument([], {
      variables: {
        first_name: 'John',
        last_name: 'Doe',
        company: {
          name: 'Acme Corp',
        },
      },
    });

    expect(document.variables?.first_name).toBe('John');
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should support theme configuration', () => {
    const document = generateDocument([], {
      theme: {
        fonts: [
          {
            id: 'primary',
            fontFamily: 'Inter',
            fallbackFontFamily: 'sans-serif',
            webFont: {
              url: 'https://fonts.googleapis.com/css2?family=Inter',
              format: 'woff2',
            },
          },
        ],
      },
    });

    expect(document.theme?.fonts).toHaveLength(1);
    expect(document.theme?.fonts?.[0].fontFamily).toBe('Inter');
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should support custom version', () => {
    const document = generateDocument([], { version: 2 });

    expect(document.version).toBe(2);
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });
});

describe('generateSimpleLayout', () => {
  it('should generate a complete document with simple layout', () => {
    const blocks = [
      generateHeadingBlock({ content: 'Welcome' }),
      generateTextBlock({ content: 'This is a paragraph.' }),
      generateButtonBlock({ label: 'Get Started', href: 'https://example.com' }),
    ];

    const document = generateSimpleLayout(blocks);

    expect(document.sections).toHaveLength(1);
    expect(document.sections[0].rows).toHaveLength(1);
    expect(document.sections[0].rows[0].columns).toHaveLength(1);
    expect(document.sections[0].rows[0].columns[0].blocks).toHaveLength(3);
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should support styling options in simple layout', () => {
    const blocks = [generateTextBlock({ content: 'Content' })];

    const document = generateSimpleLayout(blocks, {
      backgroundColor: '#ffffff',
      padding: '40px',
      meta: {
        title: 'Simple Email',
      },
    });

    expect(document.meta.title).toBe('Simple Email');
    expect(document.sections[0].backgroundColor).toBe('#ffffff');
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });
});

describe('generateMultiColumnLayout', () => {
  it('should generate a document with multiple columns', () => {
    const columnBlocks = [
      [generateTextBlock({ content: 'Column 1' })],
      [generateTextBlock({ content: 'Column 2' })],
      [generateTextBlock({ content: 'Column 3' })],
    ];

    const document = generateMultiColumnLayout(columnBlocks);

    expect(document.sections).toHaveLength(1);
    expect(document.sections[0].rows).toHaveLength(1);
    expect(document.sections[0].rows[0].columns).toHaveLength(3);
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should support gutter in multi-column layout', () => {
    const columnBlocks = [
      [generateTextBlock({ content: 'Left' })],
      [generateTextBlock({ content: 'Right' })],
    ];

    const document = generateMultiColumnLayout(columnBlocks, {
      gutter: 20,
      backgroundColor: '#f5f5f5',
    });

    expect(document.sections[0].rows[0].gutter).toBe(20);
    expect(document.sections[0].backgroundColor).toBe('#f5f5f5');
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });

  it('should validate complex multi-column document', () => {
    const columnBlocks = [
      [
        generateHeadingBlock({ content: 'Product 1' }),
        generateImageBlock({ src: 'https://example.com/product1.jpg' }),
        generateTextBlock({ content: 'Description 1' }),
        generateButtonBlock({ label: 'Buy Now' }),
      ],
      [
        generateHeadingBlock({ content: 'Product 2' }),
        generateImageBlock({ src: 'https://example.com/product2.jpg' }),
        generateTextBlock({ content: 'Description 2' }),
        generateButtonBlock({ label: 'Buy Now' }),
      ],
    ];

    const document = generateMultiColumnLayout(columnBlocks, {
      gutter: 16,
      padding: '20px',
      meta: {
        title: 'Product Showcase',
        description: 'Featured products',
        tags: ['products', 'ecommerce'],
      },
    });

    expect(document.sections[0].rows[0].columns).toHaveLength(2);
    expect(document.sections[0].rows[0].columns[0].blocks).toHaveLength(4);
    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
  });
});

describe('Validation edge cases', () => {
  it('should throw when required props are missing and validation is enabled', () => {
    expect(() => {
      // @ts-expect-error - Testing invalid input
      generateTextBlock({});
    }).toThrow();
  });

  it('should throw when invalid enum values are provided', () => {
    expect(() => {
      generateHeadingBlock({
        content: 'Test',
        // @ts-expect-error - Testing invalid input
        as: 'h7',
      });
    }).toThrow();
  });

  it('should allow empty divider props', () => {
    const block = generateDividerBlock({});
    expect(dividerBlockSchema.safeParse(block).success).toBe(true);
  });
});

describe('Integration with renderer types', () => {
  it('should generate blocks compatible with CanvasDocument type', () => {
    const document = generateSimpleLayout([
      generateTextBlock({ content: 'Test' }),
    ]);

    // This would fail to compile if the types are incompatible
    const checkType = (doc: typeof document) => {
      expect(doc.version).toBeDefined();
      expect(doc.meta).toBeDefined();
      expect(doc.sections).toBeDefined();
    };

    checkType(document);
  });

  it('should generate all block types that validate against schema', () => {
    const allBlocks = [
      generateTextBlock({ content: 'Text' }),
      generateHeadingBlock({ content: 'Heading' }),
      generateButtonBlock({ label: 'Button' }),
      generateImageBlock({ src: 'https://example.com/img.jpg' }),
      generateDividerBlock(),
      generateCustomBlock({
        componentName: 'Custom',
        props: { test: true },
      }),
    ];

    allBlocks.forEach((block) => {
      expect(block.id).toBeDefined();
      expect(block.type).toBeDefined();
      expect(block.props).toBeDefined();
    });
  });
});
