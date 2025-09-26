import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Canvas,
  Sidebar,
  CanvasProvider,
  buttonDefinition,
  dividerDefinition,
  headingDefinition,
  imageDefinition,
  textDefinition,
  type BlockDefinition,
  type CanvasContentBlock,
  type CanvasSection,
  type TextBlock,
} from '../../src';

describe('Canvas', () => {
  it('renders a placeholder when no sections exist', () => {
    render(
      <CanvasProvider>
        <Canvas sections={[]} />
      </CanvasProvider>,
    );

    expect(screen.getByText(/drag a section to get started/i)).toBeInTheDocument();
  });

  it('renders known blocks inside section and column layout', () => {
    const blocks: CanvasContentBlock[] = [
      {
        id: 'heading-1',
        type: 'heading',
        props: { ...headingDefinition.defaults, content: 'Hello heading' },
      },
      {
        id: 'text-1',
        type: 'text',
        props: { ...textDefinition.defaults, content: 'Hello world' },
      },
      {
        id: 'divider-1',
        type: 'divider',
        props: dividerDefinition.defaults,
      },
      {
        id: 'button-1',
        type: 'button',
        props: { ...buttonDefinition.defaults, label: 'Click me' },
      },
    ];

    const sections: CanvasSection[] = [
      {
        id: 'section-1',
        type: 'section',
        rows: [
          {
            id: 'row-1',
            type: 'row',
            gutter: 16,
            columns: [
              {
                id: 'column-1',
                type: 'column',
                blocks,
              },
            ],
          },
        ],
      },
    ];

    render(
      <CanvasProvider>
        <Canvas sections={sections} />
      </CanvasProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Hello heading' })).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Click me' })).toBeInTheDocument();
  });
});

describe('Sidebar', () => {
  it('lists built-in structure and content items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Row')).toBeInTheDocument();
    expect(screen.getByText('1 Column')).toBeInTheDocument();
    expect(screen.getByText('2 Columns')).toBeInTheDocument();
    expect(screen.getByText('3 Columns')).toBeInTheDocument();

    expect(screen.getByText(headingDefinition.label)).toBeInTheDocument();
    expect(screen.getByText(textDefinition.label)).toBeInTheDocument();
    expect(screen.getByText(dividerDefinition.label)).toBeInTheDocument();
    expect(screen.getByText(imageDefinition.label)).toBeInTheDocument();
    expect(screen.getByText(buttonDefinition.label)).toBeInTheDocument();
  });

  it('supports custom block definitions', () => {
    const customTextBlock: BlockDefinition<TextBlock> = {
      type: 'text',
      label: 'Custom Text',
      icon: textDefinition.icon,
      defaults: textDefinition.defaults,
    };

    render(<Sidebar blocks={[customTextBlock]} />);

    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });
});
