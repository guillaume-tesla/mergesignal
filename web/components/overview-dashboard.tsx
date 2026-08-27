'use client';

import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Download,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';
import {
  filterRecords,
  getSummary,
  isAggregateVisible,
} from '../lib/analytics';
import { demoDataset } from '../lib/demo-data';
import { createLeadershipExport, type ExportFormat } from '../lib/export';
import {
  TEAM_NAMES,
  TOOL_NAMES,
  WORKFLOW_NAMES,
  type Filters,
} from '../lib/types';
import {
  DEFAULT_FILTERS,
  emptyWorkspaceSnapshot,
  filtersSnapshot,
  minimumCohortSize,
  parseFilters,
  parsePrivacyPreferences,
  privacySnapshot,
  subscribeFilters,
  subscribePrivacy,
  writeFilters,
} from '../lib/workspace-preferences';

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

function download(format: ExportFormat, filters: Filters, minimumCohort: number) {
  const summary = getSummary(demoDataset, filters);
  if (!isAggregateVisible(summary, minimumCohort) || summary.assistedPrs === 0) return;
  const file = createLeadershipExport({
    organization: demoDataset.organization,
    filters,
    summary,
    format,
    minimumCohortSize: minimumCohort,
  });
  const url = URL.createObjectURL(new Blob([file.content], { type: file.mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'good' | 'warn' | 'primary';
  icon: React.ReactNode;
}) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <div className="kpi-top">
        <span>{label}</span>
        <span className="kpi-icon" aria-hidden="true">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function OverviewDashboard() {
  const storedFilters = useSyncExternalStore(
    subscribeFilters,
    filtersSnapshot,
    emptyWorkspaceSnapshot,
  );
  const storedPrivacy = useSyncExternalStore(
    subscribePrivacy,
    privacySnapshot,
    emptyWorkspaceSnapshot,
  );
  const filters = useMemo(() => parseFilters(storedFilters), [storedFilters]);
  const privacyPreferences = useMemo(
    () => parsePrivacyPreferences(storedPrivacy),
    [storedPrivacy],
  );
  const minimumCohort = minimumCohortSize(privacyPreferences);
  const summary = useMemo(() => getSummary(demoDataset, filters), [filters]);
  const records = useMemo(() => filterRecords(demoDataset, filters), [filters]);
  const visible = isAggregateVisible(summary, minimumCohort);
  const canExport = visible && summary.assistedPrs > 0;

  const weeks = useMemo(() => {
    const ranges = [[1, 7], [8, 14], [15, 21], [22, 28]];
    return ranges.map(([start, end], index) => {
      const week = records.filter((record) => record.day >= start && record.day <= end);
      return {
        label: `Week ${index + 1}`,
        prs: week.length,
        netHours: Math.round(week.reduce((sum, record) => sum + record.netHours, 0) * 10) / 10,
      };
    });
  }, [records]);
  const maxPrs = Math.max(...weeks.map((week) => week.prs), 1);

  const tools = filters.tool === 'all' ? TOOL_NAMES : [filters.tool];
  const toolRows = tools.map((tool) => {
    const toolSummary = getSummary(demoDataset, { ...filters, tool });
    return {
      tool,
      summary: toolSummary,
      visible: isAggregateVisible(toolSummary, minimumCohort),
    };
  });
  const toolBreakdownVisible = toolRows.every(
    (row) => row.summary.assistedPrs === 0 || row.visible,
  );

  const update = <Key extends keyof Filters>(key: Key, value: Filters[Key]) => {
    writeFilters({ ...filters, [key]: value });
  };

  return (
    <div className="overview-stack">
      <header className="page-heading-row">
        <div>
          <p className="app-eyebrow">Rollout overview</p>
          <h1>What changed—and what should we do next?</h1>
          <p className="page-description">
            One evidence trail from AI-tool spend to delivery and review outcomes.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button-quiet" type="button" onClick={() => download('json', filters, minimumCohort)} disabled={!canExport}>
            <Download size={15} /> JSON
          </button>
          <button className="button-dark" type="button" onClick={() => download('csv', filters, minimumCohort)} disabled={!canExport}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </header>

      <div className="demo-context" role="note">
        <span><Sparkles size={14} aria-hidden="true" /> Fictional Northstar Cloud demo</span>
        <span>Illustrative associations, not customer outcomes or causal claims.</span>
      </div>

      <section className="filter-panel" aria-label="Overview filters">
        <label>
          <span>Period</span>
          <select value={filters.period} onChange={(event) => update('period', event.target.value as Filters['period'])}>
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="28d">Last 28 days</option>
          </select>
        </label>
        <label>
          <span>Team</span>
          <select value={filters.team} onChange={(event) => update('team', event.target.value as Filters['team'])}>
            <option value="all">All teams</option>
            {TEAM_NAMES.map((team) => <option key={team}>{team}</option>)}
          </select>
        </label>
        <label>
          <span>Tool</span>
          <select value={filters.tool} onChange={(event) => update('tool', event.target.value as Filters['tool'])}>
            <option value="all">All tools</option>
            {TOOL_NAMES.map((tool) => <option key={tool}>{tool}</option>)}
          </select>
        </label>
        <label>
          <span>Workflow</span>
          <select value={filters.workflow} onChange={(event) => update('workflow', event.target.value as Filters['workflow'])}>
            <option value="all">All workflows</option>
            {WORKFLOW_NAMES.map((workflow) => <option key={workflow}>{workflow}</option>)}
          </select>
        </label>
        <button className="filter-reset" type="button" onClick={() => writeFilters(DEFAULT_FILTERS)}>
          <RotateCcw size={14} /> Reset filters
        </button>
      </section>

      {summary.assistedPrs === 0 ? (
        <section className="empty-state" aria-live="polite">
          <h2>No records match this view</h2>
          <p>Try a longer period or reset one of the team, tool, or workflow filters.</p>
          <button className="button-dark" type="button" onClick={() => writeFilters(DEFAULT_FILTERS)}>Reset filters</button>
        </section>
      ) : !visible ? (
        <section className="suppressed-state" aria-live="polite">
          <ShieldCheck size={25} aria-hidden="true" />
          <div>
            <h2>Protected small cohort</h2>
            <p>This view contains activity from fewer than {minimumCohort} people. Aggregate metrics, Ask answers, and exports are hidden.</p>
          </div>
        </section>
      ) : (
        <>
          <section className="kpi-grid" aria-label="Filtered rollout metrics">
            <MetricCard label="AI spend" value={money(summary.spend)} detail="Observed billing data" icon={<WalletCards size={17} />} />
            <MetricCard label="Active adoption" value={`${summary.activeEngineers} / ${summary.totalEngineers}`} detail="People with observed activity" icon={<Users size={17} />} />
            <MetricCard label="Net capacity" value={`+${number(summary.netHours)}h`} detail="Estimated · medium confidence" tone="primary" icon={<Sparkles size={17} />} />
            <MetricCard label="Cycle time" value={`${number(summary.cycleHours)}h`} detail="11% faster vs prior period" tone="good" icon={<ArrowDownRight size={17} />} />
            <MetricCard label="Review time" value={`${number(summary.reviewHours)}h`} detail="19% higher vs prior period" tone="warn" icon={<Clock3 size={17} />} />
            <MetricCard label="Change failure" value={`${number(summary.changeFailureRate)}%`} detail="Descriptive quality signal" tone="warn" icon={<ArrowUpRight size={17} />} />
          </section>

          <section className="overview-grid">
            <figure className="panel trend-panel">
              <figcaption className="panel-heading">
                <div>
                  <p className="panel-kicker">Delivery signal</p>
                  <h2>Assisted work shipped</h2>
                </div>
                <div className="panel-number">
                  <strong>{summary.assistedPrs}</strong>
                  <span>pull requests</span>
                </div>
              </figcaption>
              <div className="weekly-bars" role="img" aria-label={`Four-week assisted pull request counts: ${weeks.map((week) => `${week.label} ${week.prs}`).join(', ')}`}>
                {weeks.map((week) => (
                  <div className="week-column" key={week.label}>
                    <div className="bar-track">
                      <span style={{ height: `${Math.max(8, (week.prs / maxPrs) * 100)}%` }} />
                    </div>
                    <strong>{week.prs}</strong>
                    <small>{week.label.replace('Week ', 'W')}</small>
                  </div>
                ))}
              </div>
              <div className="chart-summary">
                <span><i className="legend-swatch" aria-hidden="true" /> Assisted PRs</span>
                <span>Net estimate: <strong>+{number(summary.netHours)} hours</strong></span>
              </div>
            </figure>

            <section className="panel opportunity-spotlight" aria-labelledby="spotlight-title">
              <div className="spotlight-top">
                <span className="decision-tag decision-scale">Scale</span>
                <span className="confidence-pill">High confidence</span>
              </div>
              <p className="panel-kicker">Highest-leverage move</p>
              <h2 id="spotlight-title">Expand Cursor Agent for frontend feature work.</h2>
              <div className="spotlight-impact">
                <strong>+24%</strong>
                <span>matched throughput<br />with no observed quality regression</span>
              </div>
              <p>114 matched pull requests · Jul 31 – Aug 27</p>
              <Link className="spotlight-link" href="/app/opportunities/expand-frontend-cursor" aria-label="Review evidence for Expand Cursor Agent for frontend feature work">
                Review the evidence receipt <ArrowUpRight size={15} />
              </Link>
            </section>
          </section>

          <section className="panel tool-panel" aria-labelledby="tool-heading">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Connected-tool view</p>
                <h2 id="tool-heading">Spend is only useful beside outcomes.</h2>
              </div>
              <Link className="text-link" href="/app/ask">Ask about this data <span aria-hidden="true">→</span></Link>
            </div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>Tool</th><th>Observed spend</th><th>Assisted PRs</th><th>Estimated net capacity</th><th>Cycle time</th></tr></thead>
                <tbody>
                  {!toolBreakdownVisible ? (
                    <tr>
                      <td className="protected-table-cell" colSpan={5}>
                        <ShieldCheck size={13} aria-hidden="true" />
                        The entire tool breakdown is hidden because at least one non-empty tool cohort is below {minimumCohort} people. Whole-breakdown suppression prevents subtraction from revealing protected values.
                      </td>
                    </tr>
                  ) : toolRows.map(({ tool, summary: toolSummary }) => (
                    <tr key={tool}>
                      <th scope="row"><span className={`tool-dot tool-${tool.toLowerCase().replaceAll(' ', '-')}`} />{tool}</th>
                      <td>{money(toolSummary.spend)}</td>
                      <td>{toolSummary.assistedPrs}</td>
                      <td className="positive-cell">+{number(toolSummary.netHours)}h</td>
                      <td>{number(toolSummary.cycleHours)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="opportunity-list-section" aria-labelledby="opportunity-heading">
            <div className="section-heading-inline">
              <div><p className="app-eyebrow">Decision queue</p><h2 id="opportunity-heading">Three moves worth testing now.</h2></div>
              <Link className="button-quiet" href="/app/opportunities">See all opportunities <span aria-hidden="true">→</span></Link>
            </div>
            <div className="opportunity-grid">
              {demoDataset.opportunities.map((opportunity) => (
                <article className="opportunity-tile" key={opportunity.id}>
                  <div className="opportunity-tile-top">
                    <span className={`decision-tag decision-${opportunity.kind}`}>{opportunity.kind === 'save' ? 'Stop' : opportunity.kind}</span>
                    <span className="confidence-pill">{opportunity.confidence} confidence</span>
                  </div>
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.summary}</p>
                  <div className="tile-impact"><strong>{opportunity.impact}</strong><span>{opportunity.impactLabel}</span></div>
                  <Link href={`/app/opportunities/${opportunity.id}`} aria-label={`Review evidence for ${opportunity.title}`}>Review evidence <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
