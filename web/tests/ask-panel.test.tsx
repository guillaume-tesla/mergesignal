import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AskPanel } from '../components/ask-panel';

const FILTER_KEY = 'mergesignal:filters:v1';
const PRIVACY_KEY = 'mergesignal:privacy:v1';

describe('Ask analytics panel', () => {
  it('shows a cited deterministic answer and an honest unsupported state', async () => {
    const user = userEvent.setup();
    render(<AskPanel />);

    await user.click(screen.getByRole('button', { name: 'Which tool has the most net capacity?' }));
    expect(await screen.findByText(/cursor has the highest estimated net capacity/i)).toBeInTheDocument();
    expect(screen.getAllByText(/filtered tool-level delivery records/i)).toHaveLength(3);

    const input = screen.getByLabelText('Ask a question about rollout data');
    await user.clear(input);
    await user.type(input, 'Will we hit next quarter revenue?');
    await user.click(screen.getByRole('button', { name: 'Answer from records' }));
    expect(await screen.findByText(/not a general-purpose ai assistant/i)).toBeInTheDocument();
  });

  it('removes a prior answer as soon as its privacy scope changes', async () => {
    const user = userEvent.setup();
    render(<AskPanel />);

    await user.click(screen.getByRole('button', { name: 'Which tool has the most net capacity?' }));
    expect(await screen.findByText(/cursor has the highest estimated net capacity/i)).toBeInTheDocument();

    window.localStorage.setItem(PRIVACY_KEY, JSON.stringify({ version: 1, retention: '30', cohort: '10' }));
    window.dispatchEvent(new Event('storage'));
    await waitFor(() => {
      expect(screen.queryByText(/cursor has the highest estimated net capacity/i)).not.toBeInTheDocument();
    });
  });

  it('answers from the persisted Overview filters and configured cohort policy', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(FILTER_KEY, JSON.stringify({
      version: 1,
      period: '28d',
      team: 'Frontend',
      tool: 'all',
      workflow: 'all',
    }));
    const view = render(<AskPanel />);

    expect(screen.getByRole('heading', { name: /northstar cloud.*frontend/i })).toBeInTheDocument();
    const input = screen.getByLabelText('Ask a question about rollout data');
    await user.clear(input);
    await user.type(input, 'How much did we spend?');
    await user.click(screen.getByRole('button', { name: 'Answer from records' }));
    expect(await screen.findByText(/observed ai spend is \$2,410/i)).toBeInTheDocument();
    expect(screen.getAllByText(/28 days.*frontend/i)).toHaveLength(2);

    view.unmount();
    window.localStorage.setItem(PRIVACY_KEY, JSON.stringify({ version: 1, retention: '30', cohort: '10' }));
    render(<AskPanel />);
    await user.click(screen.getByRole('button', { name: 'How much did we spend on AI this period?' }));
    expect(await screen.findByText(/minimum cohort of 10/i)).toBeInTheDocument();
  });
});
