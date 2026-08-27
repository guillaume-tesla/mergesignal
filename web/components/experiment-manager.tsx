'use client';

import Link from 'next/link';
import { Beaker, CalendarDays, Check, Circle, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { demoDataset } from '../lib/demo-data';
import {
  createExperiment,
  EXPERIMENT_STORAGE_KEY,
  loadExperiments,
  saveExperiments,
  updateExperimentStatus,
  type Experiment,
  type ExperimentStatus,
} from '../lib/experiments';

const statuses: Array<{ value: ExperimentStatus; label: string }> = [
  { value: 'planned', label: 'Planned' },
  { value: 'running', label: 'Running' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

export function ExperimentManager({ initialOpportunityId }: { initialOpportunityId?: string }) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'failed'>('saved');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const restored = loadExperiments(window.localStorage);
    const opportunity = demoDataset.opportunities.find((item) => item.id === initialOpportunityId);
    const next = opportunity && !restored.some((experiment) => experiment.opportunityId === opportunity.id)
      ? [...restored, createExperiment(opportunity)]
      : restored;
    if (next !== restored) saveExperiments(window.localStorage, next);
    setExperiments(next);
    setReady(true);
  }, [initialOpportunityId]);

  const persist = (next: Experiment[]) => {
    setExperiments(next);
    setSaveState(saveExperiments(window.localStorage, next) ? 'saved' : 'failed');
  };

  const update = (id: string, patch: Partial<Experiment>) => {
    const now = new Date().toISOString();
    persist(experiments.map((experiment) => experiment.id === id ? { ...experiment, ...patch, updatedAt: now } : experiment));
  };

  const changeStatus = (experiment: Experiment, status: ExperimentStatus) => {
    persist(experiments.map((item) => item.id === experiment.id ? updateExperimentStatus(item, status) : item));
  };

  const reset = () => {
    window.localStorage.removeItem(EXPERIMENT_STORAGE_KEY);
    setExperiments([]);
    setSaveState('saved');
  };

  if (!ready) return <div className="loading-panel" aria-live="polite">Loading local experiments…</div>;

  return (
    <div className="content-stack">
      <header className="page-heading-row">
        <div><p className="app-eyebrow">14-day rollout lab</p><h1>Test the recommendation before you scale it.</h1><p className="page-description">Targets and statuses stay in this browser. No experiment content is sent to a server.</p></div>
        {experiments.length > 0 && <button className="button-quiet" type="button" onClick={reset}><RotateCcw size={15} /> Reset demo experiments</button>}
      </header>
      <div className="demo-context" role="note"><span><ShieldCheck size={14} /> Local-only persistence</span><span aria-live="polite">{saveState === 'saved' ? 'Changes saved to this browser.' : 'Could not save. Browser storage may be unavailable.'}</span></div>

      {experiments.length === 0 ? (
        <section className="empty-state experiment-empty"><span className="empty-icon"><Beaker size={25} /></span><h2>No experiments yet.</h2><p>Open an evidence receipt and turn its next move into a measurable 14-day test.</p><Link className="button-dark" href="/app/opportunities">Review opportunities</Link></section>
      ) : (
        <div className="experiment-list">
          {experiments.map((experiment) => (
            <article className="experiment-card" key={experiment.id}>
              <header className="experiment-card-head">
                <div><span className="experiment-label"><Beaker size={14} /> Experiment</span><h2>{experiment.title}</h2><p>Created from an evidence-backed opportunity. Results remain descriptive until the target window closes.</p></div>
                <label className={`status-select status-${experiment.status}`}><span>Experiment status</span><select aria-label="Experiment status" value={experiment.status} onChange={(event) => changeStatus(experiment, event.target.value as ExperimentStatus)}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
              </header>
              <div className="experiment-dates"><div><CalendarDays size={16} /><span>Starts</span><strong>{experiment.startDate}</strong></div><div><CalendarDays size={16} /><span>Decision date</span><strong>{experiment.endDate}</strong></div><div><Circle size={16} /><span>Owner</span><strong>{experiment.owner}</strong></div></div>
              <label className="target-field"><span>Experiment target</span><textarea aria-label="Experiment target" maxLength={280} value={experiment.target} onChange={(event) => update(experiment.id, { target: event.target.value })} /><small>{experiment.target.length} / 280 · Make the outcome and guardrail measurable.</small></label>
              <div className="experiment-steps" aria-label="Experiment workflow">
                {statuses.map((status, index) => {
                  const currentIndex = statuses.findIndex((item) => item.value === experiment.status);
                  const done = index < currentIndex || experiment.status === 'completed';
                  const current = status.value === experiment.status;
                  return <div className={current ? 'current' : done ? 'done' : ''} key={status.value}><span>{done ? <Check size={13} /> : index + 1}</span><strong>{status.label}</strong></div>;
                })}
              </div>
              <footer className="experiment-card-foot"><span><Save size={14} /> Last updated {new Date(experiment.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span><Link href={`/app/opportunities/${experiment.opportunityId}`}>Return to evidence receipt →</Link></footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
