import { describe, expect, it } from 'vitest';
import { renderDocument } from '../src';
import { CustomBlockDefinition } from '@react-email-dnd/shared';
import React from 'react';

describe('Custom Blocks Array Compatibility', () => {
  it('should accept an array of custom blocks', () => {
    const customBlock: CustomBlockDefinition<{ name: string }> = {
      type: 'custom',
      defaults: {
        componentName: 'MyCustomBlock',
        props: { name: 'World' },
      },
      component: ({ name }) => React.createElement('div', {}, `Hello ${name}`),
      label: 'My Custom Block',
      icon: () => null,
    };

    const document = {
      version: 1,
      meta: { title: 'Test' },
      sections: [
        {
          id: 's1',
          type: 'section',
          rows: [
            {
              id: 'r1',
              type: 'row',
              columns: [
                {
                  id: 'c1',
                  type: 'column',
                  blocks: [
                    {
                      id: 'b1',
                      type: 'custom',
                      props: {
                        componentName: 'MyCustomBlock',
                        props: { name: 'Universe' },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as any;

    const result = renderDocument({
      document,
      options: {
        format: 'react',
        customBlocks: [customBlock],
      },
    });

    if (result.format === 'react') {
      expect(result.node).toBeDefined();
    } else {
      throw new Error('Expected react format');
    }
  });
});
