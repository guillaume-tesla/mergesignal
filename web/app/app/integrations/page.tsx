import Link from 'next/link';
import { ArrowRight, Bot, Braces, CircleDot, Code2, GitPullRequest, LockKeyhole, MessageSquareText, PlugZap, ShieldCheck } from 'lucide-react';

const integrations = [
  { name: 'GitHub', category: 'Delivery outcomes', description: 'Pull requests, review timing, checks, and repository metadata.', fields: 'No source, diff, title, or body', icon: GitPullRequest },
  { name: 'Cursor', category: 'AI-tool telemetry', description: 'Approved usage, model, spend, and activity aggregates.', fields: 'No prompts, files, or outputs', icon: Code2 },
  { name: 'Claude Code', category: 'AI-tool telemetry', description: 'OpenTelemetry usage and cost measures from an approved collector.', fields: 'No command or model output', icon: Braces },
  { name: 'GitHub Copilot', category: 'AI-tool telemetry', description: 'Organization-level adoption and accepted-usage aggregates.', fields: 'No generated code content', icon: Bot },
  { name: 'Slack', category: 'Decision workflow', description: 'Weekly team briefs and experiment reminders.', fields: 'Outbound summaries only', icon: MessageSquareText },
];

export default function IntegrationsPage() {
  return (
    <div className="content-stack integrations-page">
      <header className="page-heading-row"><div><p className="app-eyebrow">Integration catalog</p><h1>Connect outcomes, not engineering content.</h1><p className="page-description">These cards document the intended production contracts. No live OAuth or provider credentials are configured in this public demo.</p></div><Link className="button-dark" href="/app/import"><PlugZap size={15} /> Preview an import</Link></header>
      <div className="demo-context" role="note"><span><CircleDot size={14} /> Preview mode</span><span>Every connector is illustrative and disconnected. Demo metrics are generated locally.</span></div>
      <section className="integration-grid" aria-label="Available integration previews">{integrations.map(({ name, category, description, fields, icon: Icon }) => <article className="integration-card" key={name}><header><span className="integration-icon"><Icon size={20} /></span><span className="preview-status">Preview</span></header><p className="panel-kicker">{category}</p><h2>{name}</h2><p>{description}</p><div className="integration-fields"><ShieldCheck size={15} /><span>{fields}</span></div><button type="button" disabled aria-label={`${name} connection unavailable in demo`}>Connection unavailable in demo</button></article>)}</section>
      <section className="integration-next"><LockKeyhole size={21} /><div><h2>Why connections stop here.</h2><p>A truthful live connector needs customer-owned credentials, OAuth review, tenant isolation, audit logs, deletion workflows, and a separate security gate. This release demonstrates the product loop without pretending those controls exist.</p></div><Link href="/app/privacy">Inspect the data contract <ArrowRight size={15} /></Link></section>
    </div>
  );
}
