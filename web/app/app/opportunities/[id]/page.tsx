import Link from 'next/link';
import { ArrowLeft, ArrowRight, Beaker, Check, Info, TriangleAlert } from 'lucide-react';
import { notFound } from 'next/navigation';
import { demoDataset } from '../../../../lib/demo-data';

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = demoDataset.opportunities.find((item) => item.id === id);
  if (!opportunity) notFound();

  return (
    <div className="content-stack receipt-page">
      <Link className="back-link" href="/app/opportunities"><ArrowLeft size={15} /> All opportunities</Link>
      <header className="receipt-hero">
        <div><div className="receipt-tags"><span className={`decision-tag decision-${opportunity.kind}`}>{opportunity.kind === 'save' ? 'Stop' : opportunity.kind}</span><span className="confidence-pill">{opportunity.confidence} confidence</span><span className="demo-inline">Demo evidence</span></div><h1>{opportunity.title}</h1><p>{opportunity.summary}</p></div>
        <div className="receipt-impact"><strong>{opportunity.impact}</strong><span>{opportunity.impactLabel}</span></div>
      </header>

      <section className="receipt-facts" aria-label="Evidence receipt metadata">
        <div><span>Evidence window</span><strong>{opportunity.evidenceWindow}</strong></div>
        <div><span>Matched sample</span><strong>{opportunity.sampleSize} records</strong></div>
        <div><span>Confidence</span><strong>{opportunity.confidence[0].toUpperCase() + opportunity.confidence.slice(1)}</strong></div>
      </section>

      <div className="receipt-columns">
        <section className="panel receipt-evidence"><div className="panel-heading"><div><p className="panel-kicker">Matched comparison</p><h2>What the records show</h2></div></div><div className="comparison-grid">{opportunity.metrics.map((metric) => <div className="comparison-row" key={metric.label}><strong>{metric.label}</strong><div><span>Assisted</span><b className={metric.direction === 'negative' ? 'negative-cell' : metric.direction === 'positive' ? 'positive-cell' : ''}>{metric.assisted}</b></div><div><span>Comparison</span><b>{metric.comparison}</b></div></div>)}</div></section>
        <section className="panel method-panel"><p className="panel-kicker">How this was estimated</p><h2>Comparison method</h2><p>{opportunity.method}</p><div className="correlation-note"><Info size={17} /><span>This is an association in fictional demo data, not proof that AI caused the difference.</span></div></section>
      </div>

      <section className="panel caveat-panel"><div><p className="panel-kicker">Before you act</p><h2>Caveats to carry into the decision</h2></div><ul>{opportunity.caveats.map((caveat) => <li key={caveat}><TriangleAlert size={16} />{caveat}</li>)}</ul></section>

      <section className="experiment-callout"><div className="experiment-callout-icon"><Beaker size={22} /></div><div><p className="panel-kicker">Recommended next action</p><h2>{opportunity.nextAction}</h2><p><Check size={15} /> Target: {opportunity.experimentTarget}</p></div><Link className="button-acid" href={`/app/experiments?opportunity=${opportunity.id}`}>Launch 14-day experiment <ArrowRight size={16} /></Link></section>
    </div>
  );
}
