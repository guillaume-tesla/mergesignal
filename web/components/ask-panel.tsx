'use client';

import { ArrowRight, BotMessageSquare, Database, Info, Quote, ShieldCheck, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { answerAnalyticsQuestion, type AskResult } from '../lib/ask';
import { demoDataset } from '../lib/demo-data';
import type { Filters } from '../lib/types';

const filters: Filters = { period: '28d', team: 'all', tool: 'all', workflow: 'all' };
const suggestions = [
  'Which tool has the most net capacity?',
  'How much did we spend on AI this period?',
  'What should we scale, fix, or stop?',
  'What do review and rework look like?',
];

export function AskPanel() {
  const [question, setQuestion] = useState('Which tool has the most net capacity?');
  const [result, setResult] = useState<AskResult | null>(null);

  const answer = (nextQuestion: string) => {
    setQuestion(nextQuestion);
    setResult(answerAnalyticsQuestion(nextQuestion, demoDataset, filters));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    answer(question);
  };

  return (
    <div className="content-stack ask-page">
      <header className="page-heading-row"><div><p className="app-eyebrow">Ask the rollout data</p><h1>An answer is only useful if you can inspect it.</h1><p className="page-description">Ask supports a bounded set of analytics intents. Every answer is computed locally from filtered demo records and cites its inputs.</p></div></header>
      <div className="demo-context" role="note"><span><BotMessageSquare size={14} /> Deterministic analytics guide</span><span>No general-purpose AI backend. No prompts are transmitted.</span></div>

      <section className="ask-composer panel" aria-labelledby="ask-heading">
        <div><p className="panel-kicker">Current scope</p><h2 id="ask-heading">Northstar Cloud · Last 28 days · All teams</h2></div>
        <form onSubmit={submit}>
          <label htmlFor="ask-question">Ask a question about rollout data</label>
          <div className="ask-input-row"><input id="ask-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Try: Which workflow should we fix?" maxLength={180} /><button className="button-dark" type="submit" disabled={!question.trim()}>Answer from records <ArrowRight size={16} /></button></div>
        </form>
        <div className="suggestion-list" aria-label="Suggested questions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => answer(suggestion)}>{suggestion}</button>)}</div>
      </section>

      {result ? (
        <section className={`ask-result ask-${result.status}`} aria-live="polite">
          <div className="ask-answer-mark">{result.status === 'answered' ? <Sparkles size={19} /> : <Info size={19} />}</div>
          <div className="ask-answer-content">
            <div className="ask-answer-meta"><span>{result.status === 'answered' ? 'Answer from records' : result.status === 'suppressed' ? 'Privacy guardrail' : 'Outside supported analytics'}</span><span>{result.scope}</span></div>
            <h2>{result.answer}</h2>
            {result.evidence.length > 0 && <div className="citation-grid">{result.evidence.map((evidence) => <article key={`${evidence.label}-${evidence.value}`}><div><Database size={14} /><span>{evidence.label}</span></div><strong>{evidence.value}</strong><p>{evidence.source}</p></article>)}</div>}
            {result.status === 'answered' && <p className="answer-caveat"><Quote size={14} /> Generated with transparent rules from the selected aggregate records. Descriptive evidence can inform an experiment; it does not prove causality.</p>}
          </div>
        </section>
      ) : (
        <section className="ask-placeholder"><ShieldCheck size={23} /><div><h2>Bounded by design.</h2><p>Ask knows spend, adoption, capacity, delivery, review quality, tool comparisons, and next moves. Unsupported questions get an honest boundary instead of an invented answer.</p></div></section>
      )}
    </div>
  );
}
