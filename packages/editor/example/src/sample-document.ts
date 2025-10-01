import type { CanvasDocument } from 'react-email-dnd';

/**
 * Creates a sample CanvasDocument for testing
 */
export function createSampleCanvasDocument(): CanvasDocument {
  return {
    version: 1,
    meta: {
      title: 'Sample Email',
      description: 'A sample email created with react-email-dnd',
      tags: ['sample', 'email'],
    },
    sections: [
      {
        id: 'section-1',
        type: 'section',
        backgroundColor: '#ffffff',
        padding: '20px',
        rows: [
          {
            id: 'row-1',
            type: 'row',
            gutter: 24,
            columns: [
              {
                id: 'column-1',
                type: 'column',
                width: 100,
                blocks: [
                  {
                    id: 'heading-1',
                    type: 'heading',
                    props: {
                      content: 'Welcome to our newsletter!',
                      as: 'h1',
                      align: 'center',
                      fontSize: 32,
                      color: '#333333',
                      fontWeight: 'bold',
                    },
                  },
                  {
                    id: 'text-1',
                    type: 'text',
                    props: {
                      content:
                        'Thank you for subscribing to our newsletter. We have exciting updates to share with you.',
                      align: 'center',
                      fontSize: 16,
                      color: '#666666',
                      lineHeight: '1.5',
                    },
                  },
                  {
                    id: 'button-1',
                    type: 'button',
                    props: {
                      label: 'Read More',
                      href: 'https://example.com',
                      align: 'center',
                      backgroundColor: '#007bff',
                      color: '#ffffff',
                      borderRadius: 4,
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
}
