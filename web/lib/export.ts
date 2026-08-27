import type { Filters, Summary } from './types';

export type ExportFormat = 'csv' | 'json';

interface LeadershipExportInput {
  organization: string;
  filters: Filters;
  summary: Summary;
  format: ExportFormat;
}

export interface LeadershipExport {
  filename: string;
  mimeType: string;
  content: string;
}

export function escapeSpreadsheetValue(value: string): string {
  return /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string | number): string {
  const safe = typeof value === 'string' ? escapeSpreadsheetValue(value) : String(value);
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

function row(label: string, value: string | number) {
  return `${csvCell(label)},${csvCell(value)}`;
}

export function createLeadershipExport({
  organization,
  filters,
  summary,
  format,
}: LeadershipExportInput): LeadershipExport {
  if (summary.activeEngineers < 5) {
    throw new Error('Exports require a minimum cohort of five active engineers.');
  }
  const filename = `mergesignal-${filters.period}-${filters.team.toLowerCase().replaceAll(' ', '-')}`;
  if (format === 'json') {
    return {
      filename: `${filename}.json`,
      mimeType: 'application/json;charset=utf-8',
      content: JSON.stringify(
        {
          schemaVersion: 1,
          source: 'MergeSignal demo',
          organization: escapeSpreadsheetValue(organization),
          filters,
          summary,
          methodology: 'Illustrative associations from deterministic demo data; not causal findings.',
        },
        null,
        2,
      ),
    };
  }

  const rows = [
    row('MergeSignal leadership summary', 'Demo data'),
    row('Organization', organization),
    row('Period', filters.period),
    row('Team', filters.team),
    row('Tool', filters.tool),
    row('Workflow', filters.workflow),
    row('AI spend', summary.spend),
    row('Active engineers', `${summary.activeEngineers} of ${summary.totalEngineers}`),
    row('Assisted pull requests', summary.assistedPrs),
    row('Estimated net hours', summary.netHours),
    row('Cycle time hours', summary.cycleHours),
    row('Review time hours', summary.reviewHours),
    row('Rework rate percent', summary.reworkRate),
    row('Change failure rate percent', summary.changeFailureRate),
    row('Savings opportunity annual', summary.savingsOpportunity),
    row('Methodology', 'Illustrative associations from deterministic demo data; not causal findings.'),
  ];

  return {
    filename: `${filename}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${rows.join('\r\n')}\r\n`,
  };
}
