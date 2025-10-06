import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  renderEmailDocument,
  type CanvasDocument,
  type CustomBlockDefinition,
  headingDefinition,
} from '../../src';

const documentWithCustomBlock: CanvasDocument = {
  version: 1,
  meta: { title: 'Custom email' },
  variables: {},
  sections: [
    {
      id: 'section-1',
      type: 'section',
      rows: [
        {
          id: 'row-1',
          type: 'row',
          columns: [
            {
              id: 'column-1',
              type: 'column',
              blocks: [
                {
                  id: 'custom-block-1',
                  type: 'custom',
                  props: {
                    componentName: 'HeroBlock',
                    props: { message: 'Rendered from renderer' },
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

describe('renderEmailDocument', () => {
  it('renders custom blocks when provided in the registry', () => {
    const customDefinition: CustomBlockDefinition<{ message: string }> = {
      id: 'custom-hero',
      type: 'custom',
      label: 'Hero',
      icon: headingDefinition.icon,
      defaults: {
        componentName: 'HeroBlock',
        props: { message: 'Default message' },
      },
      component: ({ message }: { message: string }) => (
        <div data-testid="email-custom-block">{message}</div>
      ),
    };

    render(
      <>
        {renderEmailDocument(documentWithCustomBlock, undefined, {
          customBlocks: [customDefinition],
        })}
      </>,
    );

    expect(screen.getByTestId('email-custom-block')).toHaveTextContent(
      'Rendered from renderer',
    );
  });
});
