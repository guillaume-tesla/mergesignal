import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '../app/page';

describe('MergeSignal landing page', () => {
  it('states the product outcome and opens the live demo', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /prove your ai coding rollout is working/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /explore live demo/i }),
    ).toHaveAttribute('href', '/app');

    expect(screen.getByRole('heading', { name: /every recommendation shows its work/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /measure the rollout, not the person/i })).toBeInTheDocument();
    expect(screen.getByText('$12')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /common questions/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /free 30-day audit/i })).not.toBeInTheDocument();
  });
});
