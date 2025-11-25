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

const documentWithColors: CanvasDocument = {
  version: 1,
  meta: { title: 'Colored email' },
  variables: {},
  sections: [
    {
      id: 'section-1',
      type: 'section',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      className: 'custom-section',
      rows: [
        {
          id: 'row-1',
          type: 'row',
          backgroundColor: '#e0e0e0',
          padding: '16px',
          className: 'custom-row',
          gutter: 24,
          columns: [
            {
              id: 'column-1',
              type: 'column',
              backgroundColor: '#d0d0d0',
              padding: '12px',
              className: 'custom-column',
              blocks: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  props: {
                    content: 'Test Heading',
                    as: 'h1',
                    align: 'center',
                    fontSize: 24,
                    color: '#333333',
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

    expect(screen.getByTestId('email-custom-block')).toHaveTextContent('Rendered from renderer');
  });

  it('renders sections, rows, and columns with proper styling', () => {
    const { container } = render(<>{renderEmailDocument(documentWithColors)}</>);

    // Check that the rendered HTML includes the styling
    const html = container.innerHTML;

    // Verify section styling (React Email converts hex to RGB)
    expect(html).toContain('background-color: rgb(240, 240, 240)');
    expect(html).toContain('padding: 20px');
    expect(html).toContain('custom-section');

    // Verify row styling
    expect(html).toContain('background-color: rgb(224, 224, 224)');
    expect(html).toContain('padding: 16px');
    expect(html).toContain('custom-row');
    expect(html).toContain('gap: 24px');

    // Verify column styling
    expect(html).toContain('background-color: rgb(208, 208, 208)');
    expect(html).toContain('padding: 12px');
    expect(html).toContain('custom-column');

    // Verify heading is rendered
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('substitutes variables in custom blocks', () => {
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
        <div data-testid="email-custom-block-vars">{message}</div>
      ),
    };

    const doc: CanvasDocument = {
      ...documentWithCustomBlock,
      variables: {
        name: 'Johan',
      },
      sections: [
        {
          ...documentWithCustomBlock.sections[0],
          rows: [
            {
              ...documentWithCustomBlock.sections[0].rows[0],
              columns: [
                {
                  ...documentWithCustomBlock.sections[0].rows[0].columns[0],
                  blocks: [
                    {
                      id: 'custom-block-vars',
                      type: 'custom',
                      props: {
                        componentName: 'HeroBlock',
                        props: { message: 'Hello {{name}}' },
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

    render(
      <>
        {renderEmailDocument(doc, undefined, {
          customBlocks: [customDefinition],
        })}
      </>,
    );

    expect(screen.getByTestId('email-custom-block-vars')).toHaveTextContent('Hello Johan');
  });
});
