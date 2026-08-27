import { getSummary, isAggregateVisible } from './analytics';
import { TOOL_NAMES, type DemoDataset, type Filters } from './types';

export interface AskEvidence {
  label: string;
  value: string;
  source: string;
}

export interface AskResult {
  status: 'answered' | 'unsupported' | 'suppressed';
  answer: string;
  evidence: AskEvidence[];
  scope: string;
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number, suffix = '') {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

function scopeLabel(filters: Filters) {
  const period = filters.period === '7d' ? '7 days' : filters.period === '14d' ? '14 days' : '28 days';
  const dimensions = [
    filters.team === 'all' ? 'all teams' : filters.team,
    filters.tool === 'all' ? 'all tools' : filters.tool,
    filters.workflow === 'all' ? 'all workflows' : filters.workflow,
  ];
  return `${period} · ${dimensions.join(' · ')}`;
}

function baseEvidence(recordCount: number): AskEvidence {
  return {
    label: 'Records used',
    value: `${recordCount} pull requests`,
    source: 'Filtered Northstar Cloud delivery records',
  };
}

function opportunityMatchesFilters(
  opportunityFilters: Partial<Filters>,
  filters: Filters,
) {
  return (filters.team === 'all' || !opportunityFilters.team || opportunityFilters.team === filters.team)
    && (filters.tool === 'all' || !opportunityFilters.tool || opportunityFilters.tool === filters.tool)
    && (filters.workflow === 'all' || !opportunityFilters.workflow || opportunityFilters.workflow === filters.workflow);
}

export function answerAnalyticsQuestion(
  question: string,
  dataset: DemoDataset,
  filters: Filters,
  minimumCohortSize = 5,
): AskResult {
  const normalized = question.trim().toLowerCase();
  const summary = getSummary(dataset, filters);
  const scope = scopeLabel(filters);

  if (summary.assistedPrs === 0) {
    return {
      status: 'answered',
      answer: 'No records match the selected view. Try a longer period or broaden a team, tool, or workflow filter.',
      evidence: [],
      scope,
    };
  }

  if (!isAggregateVisible(summary, minimumCohortSize)) {
    const minimumLabel = minimumCohortSize === 5 ? 'five' : String(minimumCohortSize);
    return {
      status: 'suppressed',
      answer: `This answer is hidden because the selected view does not meet the minimum cohort of ${minimumLabel} active people.`,
      evidence: [],
      scope,
    };
  }

  if (/\b(tool|cursor|claude|copilot)\b/.test(normalized) && /\b(net|capacity|hours?|best|most)\b/.test(normalized)) {
    const tools = filters.tool === 'all' ? TOOL_NAMES : [filters.tool];
    const toolResults = tools.map((tool) => ({
      tool,
      summary: getSummary(dataset, { ...filters, tool }),
    })).filter(({ summary: toolSummary }) => toolSummary.assistedPrs > 0);
    const protectedChild = toolResults.some(
      ({ summary: toolSummary }) => !isAggregateVisible(toolSummary, minimumCohortSize),
    );

    if (protectedChild) {
      const minimumLabel = minimumCohortSize === 5 ? 'five' : String(minimumCohortSize);
      return {
        status: 'suppressed',
        answer: `The entire tool comparison is hidden because at least one non-empty tool cohort does not meet the minimum cohort of ${minimumLabel} active people. Whole-breakdown suppression prevents protected values from being derived by subtraction.`,
        evidence: [],
        scope,
      };
    }

    const sortedToolResults = toolResults.sort(
      (left, right) => right.summary.netHours - left.summary.netHours,
    );
    const winner = sortedToolResults[0];
    return {
      status: 'answered',
      answer: `${winner.tool} has the highest estimated net capacity among tool cohorts meeting the privacy floor at ${number(winner.summary.netHours, 'h')}. This is an observed association in the demo records, not proof that the tool caused the gain.`,
      evidence: sortedToolResults.map(({ tool, summary: toolSummary }) => ({
        label: tool,
        value: `${number(toolSummary.netHours, 'h')} across ${toolSummary.assistedPrs} pull requests`,
        source: 'Filtered tool-level delivery records',
      })),
      scope,
    };
  }

  if (/\b(spend|spent|cost|bill|budget)\b/.test(normalized)) {
    return {
      status: 'answered',
      answer: `Observed AI spend is ${currency(summary.spend)} for the current view. The annual seat-reclamation opportunity is ${currency(summary.savingsOpportunity)} and is shown separately from observed spend.`,
      evidence: [
        { label: 'Observed spend', value: currency(summary.spend), source: 'Connected-tool billing fields in demo records' },
        { label: 'Annual seat opportunity', value: currency(summary.savingsOpportunity), source: 'Demo seat-roster reconciliation' },
        baseEvidence(summary.assistedPrs),
      ],
      scope,
    };
  }

  if (/\b(adoption|active|seats?|people|engineers?)\b/.test(normalized)) {
    return {
      status: 'answered',
      answer: `${summary.activeEngineers} of ${summary.totalEngineers} engineers have observed activity in the selected view. Activity is reported as a team-level count, never as an individual ranking.`,
      evidence: [
        { label: 'Active engineers', value: `${summary.activeEngineers} of ${summary.totalEngineers}`, source: 'Pseudonymous identity map and filtered usage records' },
        baseEvidence(summary.assistedPrs),
      ],
      scope,
    };
  }

  if (/\b(cycle|review|rework|quality|failure)\b/.test(normalized)) {
    return {
      status: 'answered',
      answer: `Median-style averages in this demo view are ${number(summary.cycleHours, 'h')} cycle time and ${number(summary.reviewHours, 'h')} review time, with ${number(summary.reworkRate, '%')} rework and ${number(summary.changeFailureRate, '%')} change failures. Interpret these as descriptive signals.`,
      evidence: [
        { label: 'Cycle time', value: number(summary.cycleHours, 'h'), source: 'Filtered pull-request timing records' },
        { label: 'Review time', value: number(summary.reviewHours, 'h'), source: 'Filtered review timing records' },
        { label: 'Rework rate', value: number(summary.reworkRate, '%'), source: 'Filtered rework flags' },
        baseEvidence(summary.assistedPrs),
      ],
      scope,
    };
  }

  if (/\b(capacity|hours?|throughput|pull requests?|prs?)\b/.test(normalized)) {
    return {
      status: 'answered',
      answer: `The selected records show ${number(summary.netHours, 'h')} of estimated net capacity across ${summary.assistedPrs} assisted pull requests. The estimate is illustrative and does not establish causality.`,
      evidence: [
        { label: 'Estimated net capacity', value: number(summary.netHours, 'h'), source: 'Demo matched-work estimates' },
        baseEvidence(summary.assistedPrs),
      ],
      scope,
    };
  }

  if (
    /\b(opportunity|opportunities|recommendation|recommendations)\b/.test(normalized) ||
    /\b(what|which)\b.*\b(scale|fix|stop|next move)\b/.test(normalized)
  ) {
    const opportunity = dataset.opportunities.find((item) => (
      opportunityMatchesFilters(item.filters, filters)
    ));
    if (!opportunity) {
      return {
        status: 'unsupported',
        answer: 'No opportunity receipt is compatible with the selected dimensions. Broaden the filters to inspect the workspace opportunity queue.',
        evidence: [],
        scope,
      };
    }
    return {
      status: 'answered',
      answer: `From the workspace opportunity queue, the highest-confidence compatible next move is to ${opportunity.title.toLowerCase()}. Review its own evidence window and caveats before launching the 14-day experiment.`,
      evidence: [
        { label: opportunity.impactLabel, value: opportunity.impact, source: `${opportunity.sampleSize} matched demo pull requests` },
        { label: 'Confidence', value: opportunity.confidence, source: opportunity.method },
      ],
      scope: 'Workspace opportunity queue · receipts use their own evidence windows',
    };
  }

  return {
    status: 'unsupported',
    answer: 'MergeSignal can answer questions about spend, adoption, net capacity, delivery and review quality, tool comparisons, and recommended next moves. It is a deterministic analytics guide—not a general-purpose AI assistant.',
    evidence: [],
    scope,
  };
}
