import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OverviewDashboard } from '../components/overview-dashboard';

describe('application overview', () => {
  it('shows deterministic demo metrics and resets interactive filters', async () => {
    const user = userEvent.setup();
    render(<OverviewDashboard />);

    expect(screen.getByText(/fictional northstar cloud demo/i)).toBeInTheDocument();
    expect(screen.getByText('$9,840')).toBeInTheDocument();
    expect(screen.getByText('49 / 72')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Team'), 'Frontend');
    expect(screen.queryByText('49 / 72')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    expect(screen.getByText('49 / 72')).toBeInTheDocument();
  });

  it('links every opportunity to an evidence receipt', () => {
    render(<OverviewDashboard />);

    expect(
      screen.getAllByRole('link', { name: /review evidence for expand cursor agent/i })[0],
    ).toHaveAttribute('href', '/app/opportunities/expand-frontend-cursor');
  });
});
