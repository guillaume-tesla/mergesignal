import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExperimentManager } from '../components/experiment-manager';

class BrowserStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

describe('experiment manager', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: new BrowserStorage(),
    });
  });

  it('launches, edits, advances, and persists a 14-day experiment', async () => {
    const user = userEvent.setup();
    const view = render(<ExperimentManager initialOpportunityId="expand-frontend-cursor" />);

    expect(await screen.findByText(/expand cursor agent/i)).toBeInTheDocument();
    const target = screen.getByLabelText('Experiment target');
    await user.clear(target);
    await user.type(target, 'Increase throughput by 12% without extra rework.');
    await user.selectOptions(screen.getByLabelText('Experiment status'), 'running');

    await waitFor(() => expect(window.localStorage.getItem('mergesignal:experiments:v1')).toContain('without extra rework'));
    view.unmount();
    render(<ExperimentManager />);

    expect(await screen.findByDisplayValue(/without extra rework/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Experiment status')).toHaveValue('running');
  });
});
