import Link from 'next/link';
import { ArrowUpRight, Beaker, CircleDollarSign, ShieldAlert, TrendingUp } from 'lucide-react';
import { demoDataset } from '../../../lib/demo-data';

const icons = { scale: TrendingUp, fix: ShieldAlert, save: CircleDollarSign };

export default function OpportunitiesPage() {
  return (
    <div className="content-stack">
      <header className="page-heading-row">
        <div><p className="app-eyebrow">Decision queue</p><h1>Opportunities worth testing.</h1><p className="page-description">Each finding separates observed evidence from interpretation and ends with a reversible next move.</p></div>
        <Link className="button-dark" href="/app/experiments"><Beaker size={15} /> View experiments</Link>
      </header>
      <div className="demo-context" role="note"><span>Fictional Northstar Cloud demo</span><span>Opportunity values are illustrative, never customer claims.</span></div>
      <section className="opportunity-detail-grid" aria-label="Opportunity evidence receipts">
        {demoDataset.opportunities.map((opportunity) => {
          const Icon = icons[opportunity.kind];
          return (
            <article className="evidence-card" key={opportunity.id}>
              <div className="evidence-card-header"><span className={`evidence-icon decision-${opportunity.kind}`}><Icon size={18} /></span><span className={`decision-tag decision-${opportunity.kind}`}>{opportunity.kind === 'save' ? 'Stop' : opportunity.kind}</span><span className="confidence-pill">{opportunity.confidence} confidence</span></div>
              <h2>{opportunity.title}</h2>
              <p>{opportunity.summary}</p>
              <div className="evidence-impact"><strong>{opportunity.impact}</strong><span>{opportunity.impactLabel}</span></div>
              <dl className="receipt-mini"><div><dt>Evidence window</dt><dd>{opportunity.evidenceWindow}</dd></div><div><dt>Sample</dt><dd>{opportunity.sampleSize} records</dd></div></dl>
              <Link href={`/app/opportunities/${opportunity.id}`}>Open evidence receipt <ArrowUpRight size={15} /></Link>
            </article>
          );
        })}
      </section>
      <section className="method-note"><ShieldAlert size={19} /><div><h2>Confidence is not certainty.</h2><p>High means the demo sample is larger and the matched measures move consistently. Medium means caveats could materially change the decision. Neither label proves causality.</p></div></section>
    </div>
  );
}
