import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  filtersSnapshot,
  parseFilters,
  parsePrivacyPreferences,
  writeFilters,
} from '../lib/workspace-preferences';

describe('workspace preferences', () => {
  it('rejects corrupt and version-mismatched browser state', () => {
    expect(parseFilters('{broken')).toEqual(DEFAULT_FILTERS);
    expect(parseFilters(JSON.stringify({ version: 2, team: 'Frontend' }))).toEqual(DEFAULT_FILTERS);
    expect(parsePrivacyPreferences(JSON.stringify({ version: 1, retention: 'forever', cohort: '1' }))).toEqual({
      retention: '30',
      cohort: '5',
    });
  });

  it('keeps the active UI state when storage reads null and writes are blocked', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => { throw new Error('storage denied'); },
      },
    });
    const filters = { ...DEFAULT_FILTERS, team: 'Frontend' as const };

    expect(writeFilters(filters)).toBe(false);
    expect(parseFilters(filtersSnapshot())).toEqual(filters);
  });
});
