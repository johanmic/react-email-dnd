import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading, headingDefaults } from '../../src';

describe('Heading', () => {
  it('renders a heading with default props', () => {
    render(<Heading {...headingDefaults} content="Welcome" />);

    const heading = screen.getByRole('heading', { name: 'Welcome' });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName.toLowerCase()).toBe((headingDefaults.as ?? 'h2').toLowerCase());
    expect(heading).toHaveStyle({ textAlign: headingDefaults.align });
  });

  it('applies overrides for level, alignment, and size', () => {
    render(
      <Heading
        {...headingDefaults}
        as="h3"
        align="center"
        fontSize={28}
        fontWeight="medium"
        content="Centered heading"
      />,
    );

    const heading = screen.getByRole('heading', { name: 'Centered heading' });

    expect(heading.tagName.toLowerCase()).toBe('h3');
    expect(heading).toHaveStyle({ textAlign: 'center', fontSize: '28px', fontWeight: 500 });
  });
});
