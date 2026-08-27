import type { DemoDataset, Filters, Summary, WorkRecord } from './types';

function periodStart(period: Filters['period']): number {
  if (period === '7d') return 22;
  if (period === '14d') return 15;
  return 1;
}

export function filterRecords(
  dataset: DemoDataset,
  filters: Filters,
): WorkRecord[] {
  const start = periodStart(filters.period);

  return dataset.records.filter(
    (record) =>
      record.day >= start &&
      (filters.team === 'all' || record.team === filters.team) &&
      (filters.tool === 'all' || record.tool === filters.tool) &&
      (filters.workflow === 'all' || record.workflow === filters.workflow),
  );
}

function rate(records: WorkRecord[], predicate: (record: WorkRecord) => boolean) {
  if (records.length === 0) return 0;
  return (records.filter(predicate).length / records.length) * 100;
}

export function getSummary(dataset: DemoDataset, filters: Filters): Summary {
  const records = filterRecords(dataset, filters);
  const activeEngineers = new Set(records.map((record) => record.engineerId)).size;
  const teams = filters.team === 'all'
    ? dataset.teams
    : dataset.teams.filter((team) => team.name === filters.team);
  const totalEngineers = teams.reduce((total, team) => total + team.size, 0);
  const average = (key: 'cycleHours' | 'reviewHours') =>
    records.length === 0
      ? 0
      : records.reduce((total, record) => total + record[key], 0) /
        records.length;

  return {
    spend: Math.round(records.reduce((total, record) => total + record.spend, 0) * 100) / 100,
    activeEngineers,
    totalEngineers,
    assistedPrs: records.length,
    netHours: Math.round(records.reduce((total, record) => total + record.netHours, 0) * 10) / 10,
    cycleHours: Math.round(average('cycleHours') * 10) / 10,
    reviewHours: Math.round(average('reviewHours') * 10) / 10,
    reworkRate: Math.round(rate(records, (record) => record.reworked) * 10) / 10,
    changeFailureRate: Math.round(rate(records, (record) => record.failed) * 10) / 10,
    savingsOpportunity: filters.team === 'all' ? 3_360 : Math.round((3_360 * totalEngineers) / 72),
  };
}

export function isCohortVisible(memberCount: number, minimumCohortSize = 5): boolean {
  return memberCount >= minimumCohortSize;
}

export function isAggregateVisible(summary: Summary, minimumCohortSize = 5): boolean {
  return summary.assistedPrs > 0 && isCohortVisible(summary.activeEngineers, minimumCohortSize);
}
