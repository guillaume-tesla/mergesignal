import { describe, expect, it } from 'vitest';
import { demoDataset } from '../lib/demo-data';
import { getSummary } from '../lib/analytics';
import {
  parseTelemetryImport,
  TelemetryImportError,
} from '../lib/import';
import {
  createLeadershipExport,
  escapeSpreadsheetValue,
} from '../lib/export';

const filters = {
  period: '28d',
  team: 'all',
  tool: 'all',
  workflow: 'all',
} as const;

describe('local telemetry import', () => {
  it('accepts the bounded CSV schema and returns a local-only preview', () => {
    const preview = parseTelemetryImport(
      [
        'date,team,tool,workflow,spend,assisted_prs,net_hours,cycle_hours,review_hours,rework_rate,change_failure_rate',
        '2026-08-27,Frontend,Cursor,Feature,88.42,4,6.5,31.8,7.2,8.1,1.4',
      ].join('\n'),
      'csv',
    );

    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0]).toMatchObject({
      team: 'Frontend',
      tool: 'Cursor',
      assisted_prs: 4,
    });
    expect(preview.processing).toBe('local-only');
    expect(preview.uploadedFields).toEqual([]);
  });

  it('accepts equivalent JSON but rejects unknown or sensitive fields', () => {
    const accepted = parseTelemetryImport(
      JSON.stringify([
        {
          date: '2026-08-27',
          team: 'Platform',
          tool: 'Claude Code',
          workflow: 'Refactor',
          spend: 92,
          assisted_prs: 2,
          net_hours: 3,
          cycle_hours: 46,
          review_hours: 14,
          rework_rate: 17.2,
          change_failure_rate: 2.1,
        },
      ]),
      'json',
    );

    expect(accepted.rows[0].workflow).toBe('Refactor');

    expect(() =>
      parseTelemetryImport(
        JSON.stringify([{ ...accepted.rows[0], prompt: 'private text' }]),
        'json',
      ),
    ).toThrowError(/prompt.*not allowed/i);

    expect(() =>
      parseTelemetryImport(
        JSON.stringify([{ ...accepted.rows[0], Prompt: 'private text' }]),
        'json',
      ),
    ).toThrowError(/prompt.*not allowed/i);
  });

  it('normalizes safe field names and handles a UTF-8 BOM without weakening the allowlist', () => {
    const csv = parseTelemetryImport(
      '\uFEFFdate,team,tool,workflow,spend\r\n2026-08-27,Frontend,Cursor,Feature,10',
      'csv',
    );
    const json = parseTelemetryImport(
      JSON.stringify([{ DATE: '2026-08-27', TEAM: 'Frontend', TOOL: 'Cursor', WORKFLOW: 'Feature', SPEND: 10 }]),
      'json',
    );

    expect(csv.rows[0].spend).toBe(10);
    expect(json.rows[0]).toMatchObject({ date: '2026-08-27', team: 'Frontend', spend: 10 });
  });

  it('rejects nested JSON values, prototype keys, impossible dates, and inconsistent rows', () => {
    const base = { date: '2026-08-27', team: 'Frontend', tool: 'Cursor', workflow: 'Feature', spend: 10 };

    expect(() => parseTelemetryImport(JSON.stringify([{ ...base, spend: { value: 10 } }]), 'json'))
      .toThrowError(/nested values are not allowed/i);
    expect(() => parseTelemetryImport('[{"date":"2026-08-27","team":"Frontend","tool":"Cursor","workflow":"Feature","spend":10,"__proto__":"unsafe"}]', 'json'))
      .toThrowError(/__proto__.*not allowed/i);
    expect(() => parseTelemetryImport(JSON.stringify([{ ...base, date: '2026-02-31' }]), 'json'))
      .toThrowError(/date must use yyyy-mm-dd/i);
    expect(() => parseTelemetryImport(JSON.stringify([base, { ...base, spend: undefined, net_hours: 2 }]), 'json'))
      .toThrowError(/same fields/i);
  });

  it('rejects spreadsheet formulas before values enter the preview', () => {
    expect(() =>
      parseTelemetryImport(
        'date,team,tool,workflow,spend\n2026-08-27,=HYPERLINK("https://bad.test"),Cursor,Feature,10',
        'csv',
      ),
    ).toThrowError(TelemetryImportError);
  });
});

describe('leadership export', () => {
  it('matches the current filtered summary in CSV and JSON', () => {
    const summary = getSummary(demoDataset, filters);
    const csv = createLeadershipExport({
      organization: demoDataset.organization,
      filters,
      summary,
      format: 'csv',
    });
    const json = createLeadershipExport({
      organization: demoDataset.organization,
      filters,
      summary,
      format: 'json',
    });

    expect(csv.mimeType).toBe('text/csv;charset=utf-8');
    expect(csv.content).toContain('AI spend,9840');
    expect(csv.content).toContain('Assisted pull requests,203');
    expect(JSON.parse(json.content).summary.netHours).toBe(186);
    expect(JSON.parse(json.content).filters).toEqual(filters);
  });

  it('neutralizes spreadsheet-formula text', () => {
    expect(escapeSpreadsheetValue('=2+2')).toBe("'=2+2");
    expect(escapeSpreadsheetValue('  @SUM(A:A)')).toBe("'  @SUM(A:A)");
    expect(escapeSpreadsheetValue('Northstar Cloud')).toBe('Northstar Cloud');
  });

  it('refuses to export aggregates for cohorts smaller than five', () => {
    const summary = { ...getSummary(demoDataset, filters), activeEngineers: 4, totalEngineers: 4 };

    expect(() => createLeadershipExport({
      organization: demoDataset.organization,
      filters,
      summary,
      format: 'csv',
    })).toThrowError(/minimum cohort of five/i);
  });
});
