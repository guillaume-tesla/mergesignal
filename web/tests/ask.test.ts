import { describe, expect, it } from 'vitest';
import { demoDataset } from '../lib/demo-data';
import { answerAnalyticsQuestion } from '../lib/ask';
import type { DemoDataset, Filters } from '../lib/types';

const filters: Filters = {
  period: '28d',
  team: 'all',
  tool: 'all',
  workflow: 'all',
};

describe('deterministic Ask', () => {
  it('answers a supported spend question from current filters with citations', () => {
    const result = answerAnalyticsQuestion(
      'How much did we spend on AI this period?',
      demoDataset,
      filters,
    );

    expect(result.status).toBe('answered');
    expect(result.answer).toContain('$9,840');
    expect(result.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Observed spend', value: '$9,840' }),
        expect.objectContaining({ label: 'Records used', value: '203 pull requests' }),
      ]),
    );
    expect(result.scope).toContain('28 days');
  });

  it('compares connected tools without turning the answer into a causal claim', () => {
    const result = answerAnalyticsQuestion(
      'Which tool has the most net capacity?',
      demoDataset,
      filters,
    );

    expect(result.status).toBe('answered');
    expect(result.answer).toContain('Cursor');
    expect(result.answer).toMatch(/observed association/i);
    expect(result.evidence).toHaveLength(3);
  });

  it('handles unknown questions honestly', () => {
    const result = answerAnalyticsQuestion(
      'Will the platform team hit next quarter revenue?',
      demoDataset,
      filters,
    );

    expect(result.status).toBe('unsupported');
    expect(result.answer).toMatch(/can answer questions about/i);
    expect(result.evidence).toEqual([]);
  });

  it('suppresses answers based on fewer than five people', () => {
    const allowedIds = new Set(demoDataset.engineers.slice(0, 4).map((engineer) => engineer.id));
    const smallDataset: DemoDataset = {
      ...demoDataset,
      engineers: demoDataset.engineers.slice(0, 4),
      teams: [{ name: 'Frontend', size: 4 }],
      records: demoDataset.records.filter((record) => allowedIds.has(record.engineerId)),
    };

    const result = answerAnalyticsQuestion(
      'How much did we spend?',
      smallDataset,
      filters,
    );

    expect(result.status).toBe('suppressed');
    expect(result.answer).toMatch(/minimum cohort of five/i);
    expect(result.evidence).toEqual([]);
  });
});
