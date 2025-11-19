import type { CanvasDocument } from '@react-email-dnd/shared';

/**
 * Creates a sample CanvasDocument for testing
 */
export function createSampleCanvasDocument(): CanvasDocument {
  const t: CanvasDocument = {
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
        className: 'rounded-xl',
        locked: true,
        rows: [
          {
            id: 'row-1',
            type: 'row',
            gutter: 24,
            backgroundColor: '#f8fafc',
            padding: '12px',
            className: 'ring-1 ring-slate-200',
            locked: true,
            columns: [
              {
                id: 'column-1',
                type: 'column',
                width: 100,
                backgroundColor: '#ffffff',
                padding: '16px',
                className: 'shadow-md rounded-lg',
                locked: true,
                blocks: [
                  {
                    id: 'heading-1',
                    type: 'heading',
                    locked: true,
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
                    id: 'hero-custom-1',
                    type: 'custom',
                    locked: true,
                    props: {
                      componentName: 'HeroBlock',
                      props: {
                        title: 'Summer sale is live',
                        description: 'Save up to 30% across the entire catalog this week only.',
                        ctaLabel: 'Explore deals',
                        ctaHref: 'https://example.com/sale',
                        backgroundColor: '#0ea5e9',
                        textColor: '#ffffff',
                      },
                    },
                  },
                  {
                    id: 'text-1',
                    type: 'text',
                    locked: true,
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
                    locked: true,
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
      {
        id: 'section-fe676c45-b169-4015-bd7b-d8cdabec0cce',
        type: 'section',
        rows: [],
      },
    ],
    variables: {
      user_name: 'John Doe',
      order_id: '123456',
      title: 'Welcome to our newsletter!',
      description:
        'Thank you for subscribing to our newsletter. We have exciting updates to share with you.',
      button_label: 'Read More',
      button_href: 'https://example.com',
    },
  };

  const defualt = {
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
        locked: true,
        rows: [
          {
            id: 'row-1',
            type: 'row',
            gutter: 24,
            locked: true,
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
                    id: 'hero-custom-1',
                    type: 'custom',
                    props: {
                      componentName: 'HeroBlock',
                      props: {
                        title: 'Summer sale is live',
                        description: 'Save up to 30% across the entire catalog this week only.',
                        ctaLabel: 'Explore deals',
                        ctaHref: 'https://example.com/sale',
                        backgroundColor: '#0ea5e9',
                        textColor: '#ffffff',
                      },
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
    variables: {
      user_name: 'John Doe',
      order_id: '123456',
      title: 'Welcome to our newsletter!',
      description:
        'Thank you for subscribing to our newsletter. We have exciting updates to share with you.',
      button_label: 'Read More',
      button_href: 'https://example.com',
    },
  };
  return t;
}

export const bb: CanvasDocument = {
  version: 1,
  meta: {
    title: 'Untitled email',
  },
  variables: {},
  sections: [
    {
      id: 'section-874a48ba-bdfd-47bf-991e-7c6abbb67399',
      type: 'section',
      rows: [
        {
          id: 'row-f004b74c-9489-4ac0-97c7-c407fd00064f',
          type: 'row',
          gutter: 16,
          columns: [
            {
              id: 'column-09c40003-ed38-4c63-a02d-f3fe58b150ed',
              type: 'column',
              blocks: [
                {
                  id: 'text-7c0d5d75-0c18-4e04-a4d9-24ad98a0d926',
                  type: 'text',
                  props: {
                    content: 'Hello World',
                    align: 'left',
                    fontSize: 16,
                    lineHeight: '1.6',
                    fontWeight: 'normal',
                    margin: '0 0 16px',
                    padding: '0',
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
