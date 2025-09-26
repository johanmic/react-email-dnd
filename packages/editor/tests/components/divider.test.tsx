import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Divider, dividerDefaults } from '../../src';

describe('Divider', () => {
  it('renders a divider with default props', () => {
    render(<Divider {...dividerDefaults} />);

    const divider = screen.getByRole('separator');

    expect(divider).toBeInTheDocument();
    expect(divider).toHaveStyle({ width: '100%', borderTop: '1px solid #e5e7eb' });
  });

  it('applies custom styles', () => {
    render(
      <Divider
        {...dividerDefaults}
        color="#111827"
        thickness={2}
        width="60%"
        align="left"
        margin="24px 0"
      />,
    );

    const divider = screen.getByRole('separator');

    expect(divider).toHaveStyle({ width: '60%', borderTop: '2px solid #111827' });
    expect(divider.parentElement).toHaveStyle({ textAlign: 'left', margin: '24px 0' });
  });
});
