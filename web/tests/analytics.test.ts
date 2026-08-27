import { describe, expect, it } from 'vitest';
import { demoDataset } from '../lib/demo-data';
import { getSummary, isAggregateVisible, isCohortVisible } from '../lib/analytics';
import { TEAM_NAMES, TOOL_NAMES, WORKFLOW_NAMES, type Filters } from '../lib/types';

describe('demo analytics', () => {
  it('reproduces the auditable 28-day Northstar overview', () => {
    const summary = getSummary(demoDataset, {
      period: '28d',
      team: 'all',
      tool: 'all',
      workflow: 'all',
    });

    expect(summary.spend).toBe(9_840);
    expect(summary.activeEngineers).toBe(49);
    expect(summary.totalEngineers).toBe(72);
    expect(summary.assistedPrs).toBe(203);
    expect(summary.netHours).toBe(186);
    expect(summary.cycleHours).toBeCloseTo(42.6, 1);
  });

  it('applies team, tool, workflow, and period filters to the same work records', () => {
    const all = getSummary(demoDataset, {
      period: '28d',
      team: 'all',
      tool: 'all',
      workflow: 'all',
    });
    const filtered = getSummary(demoDataset, {
      period: '14d',
      team: 'Frontend',
      tool: 'Cursor',
      workflow: 'Feature',
    });

    expect(filtered.assistedPrs).toBeGreaterThan(0);
    expect(filtered.assistedPrs).toBeLessThan(all.assistedPrs);
    expect(filtered.spend).toBeLessThan(all.spend);
    expect(filtered.totalEngineers).toBe(14);
  });

  it('suppresses cohorts smaller than five people', () => {
    expect(isCohortVisible(4)).toBe(false);
    expect(isCohortVisible(5)).toBe(true);
  });

  it('enforces cohort suppression for every filter combination at the four/five boundary', () => {
    const periods: Filters['period'][] = ['7d', '14d', '28d'];
    const teams: Filters['team'][] = ['all', ...TEAM_NAMES];
    const tools: Filters['tool'][] = ['all', ...TOOL_NAMES];
    const workflows: Filters['workflow'][] = ['all', ...WORKFLOW_NAMES];
    let protectedCombinations = 0;

    for (const period of periods) {
      for (const team of teams) {
        for (const tool of tools) {
          for (const workflow of workflows) {
            const summary = getSummary(demoDataset, { period, team, tool, workflow });
            if (summary.assistedPrs > 0 && summary.activeEngineers < 5) {
              protectedCombinations += 1;
              expect(isAggregateVisible(summary)).toBe(false);
            }
          }
        }
      }
    }

    expect(protectedCombinations).toBeGreaterThan(0);
  });
});
