import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OverviewDashboard } from '../components/overview-dashboard';

const FILTER_KEY = 'mergesignal:filters:v1';
const PRIVACY_KEY = 'mergesignal:privacy:v1';

describe('application overview', () => {
  it('shows deterministic demo metrics and resets interactive filters', async () => {
    const user = userEvent.setup();
    render(<OverviewDashboard />);

    expect(screen.getByText(/fictional northstar cloud demo/i)).toBeInTheDocument();
    expect(screen.getByText('$9,840')).toBeInTheDocument();
    expect(screen.getByText('49 / 72')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Team'), 'Frontend');
    expect(screen.queryByText('49 / 72')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(FILTER_KEY)).toContain('Frontend');

    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    expect(screen.getByText('49 / 72')).toBeInTheDocument();
  });

  it('enforces the persisted workspace cohort floor across metrics and exports', async () => {
    window.localStorage.setItem(PRIVACY_KEY, JSON.stringify({ version: 1, retention: '30', cohort: '10' }));
    const user = userEvent.setup();
    render(<OverviewDashboard />);

    await user.selectOptions(screen.getByLabelText('Team'), 'Frontend');
    expect(await screen.findByRole('heading', { name: 'Protected small cohort' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('protects the entire tool partition when one child cohort is below policy', async () => {
    window.localStorage.setItem(PRIVACY_KEY, JSON.stringify({ version: 1, retention: '30', cohort: '8' }));
    const user = userEvent.setup();
    render(<OverviewDashboard />);

    await user.selectOptions(screen.getByLabelText('Team'), 'Frontend');
    expect(screen.queryByRole('heading', { name: 'Protected small cohort' })).not.toBeInTheDocument();
    expect(screen.getByText(/entire tool breakdown is hidden/i)).toBeInTheDocument();
  });

  it('links every opportunity to an evidence receipt', () => {
    render(<OverviewDashboard />);

    expect(
      screen.getAllByRole('link', { name: /review evidence for expand cursor agent/i })[0],
    ).toHaveAttribute('href', '/app/opportunities/expand-frontend-cursor');
  });
});
