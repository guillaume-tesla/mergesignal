import Link from 'next/link';
import {
  ArrowRight,
  Beaker,
  Check,
  EyeOff,
  FileSearch,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const chartBars = [42, 55, 49, 63, 58, 74, 70, 81, 76, 88, 85, 94];

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      {!compact && <span />}
    </span>
  );
}

export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" href="/" aria-label="MergeSignal home">
          <Mark />
          <span>MergeSignal</span>
        </Link>
        <div className="nav-links" role="group" aria-label="Product links">
          <a href="#product">Product</a>
          <a href="#evidence">Evidence</a>
          <a href="#privacy">Privacy</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link className="nav-cta" href="/app">
          Open demo <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" aria-hidden="true" />
            AI rollout intelligence for engineering leaders
          </p>
          <h1 id="hero-heading">
            Prove your AI coding rollout is working.
          </h1>
          <p className="hero-lede">
            Connect AI usage to shipped work and review quality. Know what to
            scale, fix, or stop—with confidence-rated evidence, not employee rankings.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/app">
              Explore live demo <span aria-hidden="true">→</span>
            </Link>
            <a className="button button-secondary" href="#evidence">
              See how the evidence works
            </a>
          </div>
          <p className="trust-line">
            <span className="trust-icon" aria-hidden="true">✓</span>
            Fictional workspace. Opens instantly. No account or integrations required.
          </p>
        </div>

        <div className="product-stage" id="product" role="group" aria-label="MergeSignal product preview">
          <div className="stage-grid" aria-hidden="true" />
          <article className="app-window">
            <header className="app-topbar">
              <div className="app-brand">
                <Mark compact />
                <span>MergeSignal</span>
              </div>
              <div className="demo-pill">
                <span aria-hidden="true" /> Demo data
              </div>
              <div className="avatar" role="img" aria-label="Northstar Cloud workspace">NC</div>
            </header>
            <div className="app-body">
              <aside className="app-sidebar" aria-label="Preview navigation">
                <div className="side-active"><span>◫</span> Overview</div>
                <div><span>⌁</span> Opportunities</div>
                <div><span>◇</span> Experiments</div>
                <div><span>↗</span> Reports</div>
              </aside>
              <section className="dashboard-preview" aria-label="Northstar Cloud 28-day overview">
                <div className="preview-heading">
                  <div>
                    <p>Northstar Cloud · Last 28 days</p>
                    <h2>AI rollout overview</h2>
                  </div>
                  <span className="status-chip">Evidence ready</span>
                </div>
                <div className="metric-row">
                  <div className="metric-card metric-featured">
                    <span>Net capacity</span>
                    <strong>+186h</strong>
                    <small>Estimated · medium confidence</small>
                  </div>
                  <div className="metric-card">
                    <span>AI spend</span>
                    <strong>$9,840</strong>
                    <small>↑ 18% vs prior period</small>
                  </div>
                  <div className="metric-card">
                    <span>Cycle time</span>
                    <strong>42.6h</strong>
                    <small className="positive">↓ 11% faster</small>
                  </div>
                </div>
                <div className="preview-lower">
                  <div className="chart-card">
                    <div className="chart-heading">
                      <div>
                        <span>Assisted work shipped</span>
                        <strong>203 PRs</strong>
                      </div>
                      <span className="confidence">High confidence</span>
                    </div>
                    <div className="bar-chart" role="img" aria-label="Illustrative rising weekly pull requests">
                      {chartBars.map((height, index) => (
                        <span
                          key={`${height}-${index}`}
                          style={{ height: `${height}%` }}
                          className={index > 8 ? 'bar-highlight' : ''}
                        />
                      ))}
                    </div>
                    <div className="chart-axis"><span>Aug 1</span><span>Aug 28</span></div>
                  </div>
                  <div className="opportunity-card">
                    <p className="opportunity-label">Highest-leverage move</p>
                    <h3>Expand Cursor Agent for frontend feature work.</h3>
                    <div className="opportunity-proof">
                      <strong>+24%</strong>
                      <span>matched throughput<br />with no observed quality regression</span>
                    </div>
                    <div className="proof-meta">
                      <span>n = 114 PRs</span>
                      <span>High confidence</span>
                    </div>
                    <span className="preview-button">Review evidence →</span>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>

      <section className="signal-strip" aria-label="MergeSignal product principles">
        <div><strong>01</strong><span>Measure outcomes,<br />not activity</span></div>
        <div><strong>02</strong><span>Show confidence,<br />not black-box scores</span></div>
        <div><strong>03</strong><span>Run experiments,<br />not surveillance</span></div>
      </section>

      <section className="landing-problem landing-section" aria-labelledby="problem-heading">
        <div className="section-intro">
          <p className="landing-kicker">The decision gap</p>
          <h2 id="problem-heading">AI adoption is easy to count. Impact is harder.</h2>
          <p>Spend and usage tell you who has access. They do not tell you whether assisted work ships faster, reviews cleanly, or deserves more investment.</p>
        </div>
        <div className="question-grid" aria-label="Questions MergeSignal helps answer">
          <article><span>Scale</span><h3>Which workflows should we expand?</h3><p>Find gains that hold up across comparable work, review effort, and quality signals.</p></article>
          <article><span>Fix</span><h3>Where do we need a guardrail?</h3><p>Expose the review or rework cost that a simple throughput chart hides.</p></article>
          <article><span>Stop</span><h3>Which spend is not earning its place?</h3><p>Separate observed billing, unused seats, and modeled opportunity before renewal.</p></article>
        </div>
      </section>

      <section className="mechanism-section" aria-labelledby="mechanism-heading">
        <div className="mechanism-intro"><p className="landing-kicker">Observe → explain → test → verify</p><h2 id="mechanism-heading">From approved telemetry to a decision you can defend.</h2><p>MergeSignal turns rollout data into an evidence trail—not a productivity score.</p></div>
        <ol className="mechanism-steps">
          <li><span>01</span><Gauge size={21} /><div><h3>Bring approved telemetry</h3><p>Import spend, team, workflow, delivery, and review measures. Content fields are excluded by schema.</p></div></li>
          <li><span>02</span><FileSearch size={21} /><div><h3>Inspect the evidence receipt</h3><p>See the window, sample, comparison method, confidence, and caveats behind every opportunity.</p></div></li>
          <li><span>03</span><Beaker size={21} /><div><h3>Run a 14-day experiment</h3><p>Set a measurable target and verify the recommendation before expanding it.</p></div></li>
          <li><span>04</span><ArrowRight size={21} /><div><h3>Report the decision</h3><p>Export a leadership-ready summary that keeps observations, estimates, and caveats visible.</p></div></li>
        </ol>
      </section>

      <section className="evidence-section landing-section" id="evidence" aria-labelledby="evidence-heading">
        <div className="section-intro evidence-intro"><p className="landing-kicker">Evidence before advice</p><h2 id="evidence-heading">Every recommendation shows its work.</h2><p>No black-box productivity score. Every opportunity includes the records compared, matching method, confidence, caveats, and the next reversible action.</p><Link className="text-cta" href="/app/opportunities/expand-frontend-cursor">Open an evidence receipt <ArrowRight size={16} /></Link></div>
        <article className="landing-receipt">
          <header><div><span className="landing-decision">Scale</span><span className="landing-confidence">High confidence</span></div><small>Fictional Northstar Cloud demo</small></header>
          <h3>Expand Cursor Agent for frontend feature work.</h3>
          <p>Comparable work shipped faster with no observed quality regression.</p>
          <div className="landing-impact"><strong>+24%</strong><span>matched throughput</span></div>
          <dl><div><dt>Window</dt><dd>Jul 31 – Aug 27</dd></div><div><dt>Sample</dt><dd>114 pull requests</dd></div><div><dt>Method</dt><dd>Matched by repo, type, size, reviewers</dd></div></dl>
          <footer><ShieldCheck size={17} /><span>Association, not proof of causality. Two caveats travel with the recommendation.</span></footer>
        </article>
      </section>

      <section className="experiment-section" aria-labelledby="experiment-heading">
        <div className="experiment-visual" aria-hidden="true"><div className="experiment-paper"><span>14-day experiment</span><h3>Small-PR guardrail</h3><div><i className="done" /><b>Baseline locked</b></div><div><i className="current" /><b>Experiment running</b></div><div><i /><b>Decision review</b></div><strong>Day 6 / 14</strong></div></div>
        <div className="experiment-copy"><p className="landing-kicker">The rollout lab</p><h2 id="experiment-heading">Don’t trust a dashboard. Run the test.</h2><p>Turn an opportunity into a 14-day experiment, edit its target, track progress, and compare the result with its baseline. Associations stay labelled as associations until the evidence improves.</p><Link className="button button-primary" href="/app/experiments?opportunity=guardrail-platform-refactors">Launch a demo experiment <ArrowRight size={16} /></Link></div>
      </section>

      <section className="privacy-section landing-section" id="privacy" aria-labelledby="privacy-heading">
        <div className="privacy-heading"><p className="landing-kicker">Trust is a product feature</p><h2 id="privacy-heading">Measure the rollout, not the person.</h2><p>MergeSignal is designed for team and workflow decisions. It does not need the contents of engineering work.</p><Link className="text-cta" href="/app/privacy">Inspect the data contract <ArrowRight size={16} /></Link></div>
        <div className="privacy-grid">
          <article><EyeOff size={22} /><h3>Excluded by design</h3><p>Prompt text, source code and diffs, file paths, and command output.</p></article>
          <article><Sparkles size={22} /><h3>Used for analysis</h3><p>Approved team and workflow labels, tool spend, delivery, review, and quality measures.</p></article>
          <article><Users size={22} /><h3>Built-in guardrails</h3><p>Team-level views, cohorts under five suppressed, no individual leaderboard.</p></article>
        </div>
      </section>

      <section className="pricing-section landing-section" id="pricing" aria-labelledby="pricing-heading">
        <div className="pricing-copy"><p className="landing-kicker">Transparent launch pricing</p><h2 id="pricing-heading">Pricing you can evaluate without a call.</h2><p>Start with the complete product loop. No separate charge for viewers, evidence receipts, experiments, Ask, exports, or privacy controls.</p></div>
        <article className="price-card"><div><span>Team plan</span><div className="price"><strong>$12</strong><span>per active developer<br />per month</span></div><p>$300 monthly minimum · First 30 days included</p></div><ul><li><Check size={15} /> All supported AI-tool and delivery connectors</li><li><Check size={15} /> Evidence receipts and 14-day experiments</li><li><Check size={15} /> Team-level privacy controls and safe exports</li><li><Check size={15} /> Unlimited leadership viewers</li></ul><Link className="button button-primary" href="/app">Explore before you connect <ArrowRight size={16} /></Link></article>
      </section>

      <section className="faq-section landing-section" id="faq" aria-labelledby="faq-heading">
        <div className="section-intro"><p className="landing-kicker">FAQ</p><h2 id="faq-heading">Common questions, direct answers.</h2></div>
        <div className="faq-list">
          <details><summary>What data does MergeSignal read?<span aria-hidden="true">+</span></summary><p>Only fields approved in the data contract. Prompt text, source code, diffs, file paths, command output, unknown keys, and spreadsheet formulas are rejected.</p></details>
          <details><summary>Does MergeSignal rank engineers?<span aria-hidden="true">+</span></summary><p>No. The product defaults to team, tool, and workflow analysis. Cohorts under five active people are suppressed across dashboards, Ask, and exports.</p></details>
          <details><summary>Does a recommendation prove causality?<span aria-hidden="true">+</span></summary><p>No. MergeSignal labels observed associations, shows caveats, and helps teams run a bounded experiment before scaling.</p></details>
          <details><summary>Can I try it without company data?<span aria-hidden="true">+</span></summary><p>Yes. The interactive Northstar Cloud workspace is fictional, requires no account, and stores experiment preferences only in your browser.</p></details>
          <details><summary>Are the integration cards live?<span aria-hidden="true">+</span></summary><p>No. The public demo clearly marks them as previews. Live provider access needs customer credentials and a separate security review.</p></details>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-cta-heading"><LockKeyhole size={27} /><p className="landing-kicker">The decision loop, ready to explore</p><h2 id="final-cta-heading">Turn AI adoption into a decision.</h2><p>Explore a complete fictional rollout, inspect the evidence, and launch your first 14-day experiment.</p><Link className="button button-acid" href="/app">Open the live demo <ArrowRight size={16} /></Link></section>

      <footer className="site-footer"><div className="wordmark"><Mark /><span>MergeSignal</span></div><p>AI rollout decisions with evidence, experiments, and privacy by design.</p><nav aria-label="Footer navigation"><Link href="/app">Demo</Link><Link href="/app/privacy">Data contract</Link><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav><span>© 2026 MergeSignal</span></footer>
    </main>
  );
}
