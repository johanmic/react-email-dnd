import {
  canvasDocumentSchema,
  isCanvasDocument,
  parseCanvasDocument,
  validateCanvasDocument,
} from '../src/schema';

describe('canvasDocumentSchema', () => {
  const validDocument = {
    version: 1,
    meta: {
      title: 'Welcome template',
      description: 'Email sent to new users',
      tags: ['onboarding'],
    },
    variables: {
      user_name: 'Alice',
    },
    sections: [
      {
        id: 'section-1',
        type: 'section' as const,
        backgroundColor: '#ffffff',
        padding: '16px',
        rows: [
          {
            id: 'row-1',
            type: 'row' as const,
            gutter: 24,
            columns: [
              {
                id: 'column-1',
                type: 'column' as const,
                width: 12,
                blocks: [
                  {
                    id: 'block-1',
                    type: 'text' as const,
                    props: {
                      content: 'Hello {{user_name}}',
                      align: 'left' as const,
                      fontSize: 16,
                      color: '#222222',
                    },
                  },
                  {
                    id: 'block-2',
                    type: 'button' as const,
                    locked: true,
                    props: {
                      label: 'Get Started',
                      href: 'https://example.com',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  test('parses a valid document', () => {
    const parsed = parseCanvasDocument(validDocument);

    expect(parsed.meta.title).toBe('Welcome template');
    expect(parsed.sections[0].rows[0].columns[0].blocks).toHaveLength(2);
  });

  test('safe parsing succeeds on valid data', () => {
    const result = canvasDocumentSchema.safeParse(validDocument);

    expect(result.success).toBe(true);
    expect(result.success && result.data.sections[0].rows[0].columns[0].blocks[0].type).toBe('text');
  });

  test('validate helper returns success and data', () => {
    const result = validateCanvasDocument(validDocument);

    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        version: 1,
        meta: expect.objectContaining({ title: 'Welcome template' }),
      }),
    });
  });

  test('rejects invalid block type', () => {
    const invalidDocument = {
      ...validDocument,
      sections: [
        {
          id: 'section-1',
          type: 'section' as const,
          rows: [
            {
              id: 'row-1',
              type: 'row' as const,
              columns: [
                {
                  id: 'column-1',
                  type: 'column' as const,
                  blocks: [
                    {
                      id: 'block-unsupported',
                      type: 'video',
                      props: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = validateCanvasDocument(invalidDocument);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('type');
    }

    expect(() => parseCanvasDocument(invalidDocument)).toThrow(
      /Invalid discriminator value/,
    );
  });

  test('type guard correctly identifies invalid input', () => {
    expect(isCanvasDocument(null)).toBe(false);
    expect(isCanvasDocument({})).toBe(false);
    expect(isCanvasDocument(validDocument)).toBe(true);
  });
});
