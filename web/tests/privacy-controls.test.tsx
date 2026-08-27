import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { PrivacyControls } from '../components/privacy-controls';

class BrowserStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe('privacy controls', () => {
  beforeEach(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: new BrowserStorage() }));

  it('persists retention and cohort guardrails and keeps rankings off', async () => {
    const user = userEvent.setup();
    const view = render(<PrivacyControls />);

    await user.selectOptions(screen.getByLabelText('Aggregate retention'), '90');
    await user.selectOptions(screen.getByLabelText('Minimum cohort size'), '8');
    expect(screen.getByText(/individual rankings are permanently off/i)).toBeInTheDocument();
    view.unmount();
    render(<PrivacyControls />);

    expect(screen.getByLabelText('Aggregate retention')).toHaveValue('90');
    expect(screen.getByLabelText('Minimum cohort size')).toHaveValue('8');
  });
});
