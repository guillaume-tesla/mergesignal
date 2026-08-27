import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AskPanel } from '../components/ask-panel';

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
});
