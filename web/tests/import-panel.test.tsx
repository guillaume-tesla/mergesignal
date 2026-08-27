import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ImportPanel } from '../components/import-panel';

describe('local import preview', () => {
  it('previews allowed aggregates locally and rejects sensitive fields', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<ImportPanel />);

    await user.click(screen.getByRole('button', { name: /preview locally/i }));
    expect(await screen.findByText(/1 row ready/i)).toBeInTheDocument();
    expect(screen.getAllByText(/uploaded: nothing/i)).toHaveLength(2);
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'JSON' }));
    const input = screen.getByLabelText('Telemetry input');
    fireEvent.change(input, { target: { value: JSON.stringify([{ date: '2026-08-27', team: 'Frontend', tool: 'Cursor', workflow: 'Feature', spend: 10, prompt: 'private' }]) } });
    await user.click(screen.getByRole('button', { name: /preview locally/i }));
    expect(await screen.findByText(/prompt.*not allowed/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
