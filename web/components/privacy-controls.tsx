'use client';

import { Ban, Check, Database, EyeOff, LockKeyhole, Save, ShieldCheck, Users } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import {
  emptyWorkspaceSnapshot,
  parsePrivacyPreferences,
  privacySnapshot,
  subscribePrivacy,
  type PrivacyPreferences,
  writePrivacyPreferences,
} from '../lib/workspace-preferences';

export function PrivacyControls() {
  const stored = useSyncExternalStore(subscribePrivacy, privacySnapshot, emptyWorkspaceSnapshot);
  const preferences = parsePrivacyPreferences(stored);
  const [saved, setSaved] = useState(true);

  const update = (next: PrivacyPreferences) => {
    setSaved(writePrivacyPreferences(next));
  };

  return (
    <div className="content-stack privacy-page">
      <header className="page-heading-row"><div><p className="app-eyebrow">Privacy controls</p><h1>Measure the rollout, not the person.</h1><p className="page-description">The demo’s data contract excludes engineering content, suppresses small groups, and never produces an individual leaderboard.</p></div></header>
      <div className="demo-context" role="note"><span><ShieldCheck size={14} /> Privacy-first demo defaults</span><span aria-live="polite">{saved ? 'Preferences saved in this browser.' : 'Browser storage is unavailable.'}</span></div>

      <section className="privacy-principles" aria-label="Privacy principles"><article><EyeOff size={20} /><h2>Content-blind</h2><p>No prompt text, source code, diffs, paths, or terminal output in the accepted schema.</p></article><article><Users size={20} /><h2>Team-level</h2><p>No individual ranking. Small cohort aggregates are hidden across dashboard, Ask, and export.</p></article><article><LockKeyhole size={20} /><h2>Local-first demo</h2><p>Imports and experiment state remain in this browser. Connection cards are previews only.</p></article></section>

      <div className="privacy-columns">
        <section className="panel settings-panel" aria-labelledby="settings-heading"><div className="panel-heading"><div><p className="panel-kicker">Workspace guardrails</p><h2 id="settings-heading">Control how aggregates appear.</h2></div><Save size={18} /></div><div className="settings-list"><label><div><strong>Aggregate retention</strong><span>How long a production workspace would retain sanitized daily measures.</span></div><select suppressHydrationWarning aria-label="Aggregate retention" value={preferences.retention} onChange={(event) => update({ ...preferences, retention: event.target.value as PrivacyPreferences['retention'] })}><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></label><label><div><strong>Minimum cohort size</strong><span>Views below this active-person threshold are suppressed.</span></div><select suppressHydrationWarning aria-label="Minimum cohort size" value={preferences.cohort} onChange={(event) => update({ ...preferences, cohort: event.target.value as PrivacyPreferences['cohort'] })}><option value="5">5 people</option><option value="8">8 people</option><option value="10">10 people</option></select></label><div className="locked-setting"><div><strong>Individual ranking</strong><span>Individual rankings are permanently off in this product.</span></div><span><Ban size={14} /> Disabled</span></div></div></section>

        <section className="panel data-flow-panel" aria-labelledby="flow-heading"><p className="panel-kicker">Demo data flow</p><h2 id="flow-heading">Only approved aggregates enter analysis.</h2><div className="data-flow"><div><Database size={18} /><strong>Local preview</strong><span>Validate headers, types, ranges, and formula risks.</span></div><i aria-hidden="true">→</i><div><ShieldCheck size={18} /><strong>Allowed measures</strong><span>Tool, team, workflow, spend, delivery, review, quality.</span></div><i aria-hidden="true">→</i><div><Users size={18} /><strong>Protected output</strong><span>Team aggregates with minimum-cohort enforcement.</span></div></div></section>
      </div>

      <section className="panel field-table" aria-labelledby="fields-heading"><div className="panel-heading"><div><p className="panel-kicker">Field-level contract</p><h2 id="fields-heading">What is accepted—and what cannot enter.</h2></div></div><div className="table-scroll"><table><thead><tr><th>Data category</th><th>Examples</th><th>Policy</th><th>Purpose</th></tr></thead><tbody><tr><th scope="row">Organization labels</th><td>Team, tool, workflow, date</td><td><span className="policy-allowed"><Check size={13} /> Accepted</span></td><td>Filter team-level analysis</td></tr><tr><th scope="row">Usage and spend</th><td>Observed cost, assisted PR count</td><td><span className="policy-allowed"><Check size={13} /> Accepted</span></td><td>Compare investment with outcomes</td></tr><tr><th scope="row">Delivery outcomes</th><td>Cycle, review, rework, failure rate</td><td><span className="policy-allowed"><Check size={13} /> Accepted</span></td><td>Build transparent evidence receipts</td></tr><tr><th scope="row">Engineering content</th><td>Prompts, code, diffs, paths, output</td><td><span className="policy-rejected"><Ban size={13} /> Rejected by schema</span></td><td>Never required</td></tr><tr><th scope="row">Individual rankings</th><td>Employee scores or leaderboards</td><td><span className="policy-rejected"><Ban size={13} /> Not produced</span></td><td>Outside product principles</td></tr></tbody></table></div></section>
    </div>
  );
}
