'use client';

import { Check, FileJson2, FileSpreadsheet, HardDrive, LockKeyhole, ShieldX, Upload } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import {
  parseTelemetryImport,
  TELEMETRY_FIELDS,
  type TelemetryImportPreview,
} from '../lib/import';

const CSV_SAMPLE = [
  TELEMETRY_FIELDS.join(','),
  '2026-08-27,Frontend,Cursor,Feature,88.42,4,6.5,31.8,7.2,8.1,1.4',
].join('\n');

const JSON_SAMPLE = JSON.stringify([
  {
    date: '2026-08-27', team: 'Frontend', tool: 'Cursor', workflow: 'Feature',
    spend: 88.42, assisted_prs: 4, net_hours: 6.5, cycle_hours: 31.8,
    review_hours: 7.2, rework_rate: 8.1, change_failure_rate: 1.4,
  },
], null, 2);

export function ImportPanel() {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [input, setInput] = useState(CSV_SAMPLE);
  const [preview, setPreview] = useState<TelemetryImportPreview | null>(null);
  const [error, setError] = useState('');

  const chooseFormat = (next: 'csv' | 'json') => {
    setFormat(next);
    setInput(next === 'csv' ? CSV_SAMPLE : JSON_SAMPLE);
    setPreview(null);
    setError('');
  };

  const runPreview = () => {
    try {
      setPreview(parseTelemetryImport(input, format));
      setError('');
    } catch (caught) {
      setPreview(null);
      setError(caught instanceof Error ? caught.message : 'Import could not be previewed.');
    }
  };

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextFormat = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
    setFormat(nextFormat);
    setInput(await file.text());
    setPreview(null);
    setError('');
  };

  return (
    <div className="content-stack import-page">
      <header className="page-heading-row"><div><p className="app-eyebrow">Local data preview</p><h1>Inspect the data contract before anything connects.</h1><p className="page-description">Paste or choose aggregate telemetry. MergeSignal parses it in this browser, rejects unknown fields, and shows exactly what a production connector could accept.</p></div></header>
      <div className="demo-context" role="note"><span><HardDrive size={14} /> Browser-only parser</span><span>Raw file contents never leave this page.</span></div>

      <div className="import-layout">
        <section className="panel import-composer" aria-labelledby="import-heading">
          <div className="panel-heading"><div><p className="panel-kicker">Step 1 · Select a format</p><h2 id="import-heading">Preview aggregate telemetry</h2></div><div className="format-switch" role="group" aria-label="Import format"><button className={format === 'csv' ? 'active' : ''} type="button" onClick={() => chooseFormat('csv')}><FileSpreadsheet size={15} /> CSV</button><button className={format === 'json' ? 'active' : ''} type="button" onClick={() => chooseFormat('json')}><FileJson2 size={15} /> JSON</button></div></div>
          <label className="file-picker"><Upload size={16} /><span>Choose a .csv or .json file</span><input type="file" accept=".csv,.json,text/csv,application/json" onChange={readFile} /></label>
          <label className="import-textarea"><span>Telemetry input</span><textarea aria-label="Telemetry input" spellCheck={false} value={input} onChange={(event) => { setInput(event.target.value); setPreview(null); setError(''); }} /></label>
          <div className="import-actions"><span>Maximum 2 MB · 5,000 rows · aggregate fields only</span><button className="button-dark" type="button" onClick={runPreview}>Preview locally <span aria-hidden="true">→</span></button></div>
          {error && <div className="import-error" role="alert"><ShieldX size={17} /><div><strong>Preview blocked</strong><span>{error}</span></div></div>}
        </section>

        <aside className="privacy-contract panel" aria-labelledby="contract-heading">
          <p className="panel-kicker">Enforced contract</p><h2 id="contract-heading">Content fields are not part of the schema.</h2>
          <div className="contract-list"><div className="contract-allow"><Check size={16} /><div><strong>Accepted</strong><span>Team, tool, workflow, spend, pull-request counts, timing, rework, and quality rates.</span></div></div><div className="contract-deny"><ShieldX size={16} /><div><strong>Rejected</strong><span>Prompts, source code, diffs, file paths, command output, unknown keys, and formulas.</span></div></div><div><LockKeyhole size={16} /><div><strong>Uploaded: nothing</strong><span>This v1 preview has no network path. Closing the page discards the input.</span></div></div></div>
        </aside>
      </div>

      {preview && <section className="panel import-preview" aria-live="polite"><div className="panel-heading"><div><p className="panel-kicker">Step 2 · Verify before connecting</p><h2>{preview.rows.length} {preview.rows.length === 1 ? 'row' : 'rows'} ready for local analysis.</h2></div><span className="success-badge"><Check size={14} /> Schema valid</span></div><div className="preview-field-list"><strong>Accepted fields</strong><div>{preview.acceptedFields.map((field) => <span key={field}>{field}</span>)}</div></div><div className="table-scroll"><table><thead><tr><th>Date</th><th>Team</th><th>Tool</th><th>Workflow</th><th>Spend</th><th>Assisted PRs</th><th>Net hours</th></tr></thead><tbody>{preview.rows.slice(0, 5).map((row, index) => <tr key={`${row.date}-${row.team}-${index}`}><td>{row.date}</td><td>{row.team}</td><td>{row.tool}</td><td>{row.workflow}</td><td>{typeof row.spend === 'number' ? `$${row.spend.toFixed(2)}` : '—'}</td><td>{row.assisted_prs ?? '—'}</td><td>{row.net_hours ?? '—'}</td></tr>)}</tbody></table></div><p className="preview-footnote"><HardDrive size={14} /> Preview generated locally · Uploaded: nothing · Input is not persisted</p></section>}
    </div>
  );
}
