import {
  TEAM_NAMES,
  type DemoDataset,
  type Engineer,
  type Opportunity,
  type Team,
  type TeamName,
  type ToolName,
  type WorkflowName,
  WORKFLOW_NAMES,
} from './types';

const teams: Team[] = [
  { name: 'Frontend', size: 14 },
  { name: 'Platform', size: 12 },
  { name: 'Data', size: 11 },
  { name: 'Mobile', size: 10 },
  { name: 'Infrastructure', size: 13 },
  { name: 'Developer Experience', size: 12 },
];

function makeEngineers(): Engineer[] {
  const remaining = teams.map((team) => team.size);
  const assignments: TeamName[] = [];
  let cursor = 0;

  while (assignments.length < 72) {
    const teamIndex = cursor % TEAM_NAMES.length;
    if (remaining[teamIndex] > 0) {
      assignments.push(TEAM_NAMES[teamIndex]);
      remaining[teamIndex] -= 1;
    }
    cursor += 1;
  }

  return assignments.map((team, index) => ({
    id: `member-${String(index + 1).padStart(2, '0')}`,
    team,
  }));
}

const engineers = makeEngineers();

const toolPlans: Array<{
  tool: ToolName;
  prs: number;
  spendCents: number;
  netHourTenths: number;
  memberIndexes: number[];
}> = [
  {
    tool: 'Cursor',
    prs: 114,
    spendCents: 418_000,
    netHourTenths: 1_220,
    memberIndexes: Array.from({ length: 37 }, (_, index) => index),
  },
  {
    tool: 'Claude Code',
    prs: 58,
    spendCents: 376_000,
    netHourTenths: 520,
    memberIndexes: Array.from({ length: 15 }, (_, index) => index * 2),
  },
  {
    tool: 'Copilot',
    prs: 31,
    spendCents: 190_000,
    netHourTenths: 120,
    memberIndexes: Array.from({ length: 12 }, (_, index) => index + 37),
  },
];

function share(total: number, count: number, index: number): number {
  const base = Math.floor(total / count);
  return base + (index < total - base * count ? 1 : 0);
}

function makeRecords() {
  const records = toolPlans.flatMap((plan, toolIndex) =>
    Array.from({ length: plan.prs }, (_, index) => {
      const engineer = engineers[plan.memberIndexes[index % plan.memberIndexes.length]];
      const workflow = WORKFLOW_NAMES[(index * 3 + toolIndex) % WORKFLOW_NAMES.length] as WorkflowName;
      const cycleTenths = 380 + ((index * 7 + toolIndex * 11) % 96);

      return {
        id: `${plan.tool.toLowerCase().replaceAll(' ', '-')}-${String(index + 1).padStart(3, '0')}`,
        day: 1 + ((index * 5 + toolIndex * 3) % 28),
        engineerId: engineer.id,
        team: engineer.team,
        tool: plan.tool,
        workflow,
        spend: share(plan.spendCents, plan.prs, index) / 100,
        netHours: share(plan.netHourTenths, plan.prs, index) / 10,
        cycleHours: cycleTenths / 10,
        reviewHours: (64 + ((index * 3 + toolIndex * 5) % 43)) / 10,
        reworked: (index + toolIndex * 2) % 9 === 0,
        failed: (index + toolIndex * 5) % 27 === 0,
      };
    }),
  );

  const targetCycleTenths = 426 * records.length;
  const actualCycleTenths = records.reduce(
    (total, record) => total + Math.round(record.cycleHours * 10),
    0,
  );
  records[records.length - 1].cycleHours +=
    (targetCycleTenths - actualCycleTenths) / 10;

  return records;
}

const opportunities: Opportunity[] = [
  {
    id: 'expand-frontend-cursor',
    kind: 'scale',
    title: 'Expand Cursor Agent for frontend feature work',
    summary:
      'Comparable frontend feature work shipped faster with no observed quality regression.',
    impact: '+24%',
    impactLabel: 'matched throughput',
    confidence: 'high',
    sampleSize: 114,
    evidenceWindow: 'Jul 31 – Aug 27, 2026',
    method:
      'Matched assisted and unassisted pull requests by repository, work type, size band, and reviewer count.',
    caveats: [
      'This is an association, not proof that Cursor caused the difference.',
      'Frontend feature work had higher test coverage than the organization median.',
    ],
    nextAction:
      'Expand the workflow to the remaining frontend squad and verify the result for 14 days.',
    experimentTarget: 'Increase assisted frontend feature throughput by 15% without increasing review time or rework.',
    metrics: [
      { label: 'Cycle time', assisted: '31.8h', comparison: '41.9h', direction: 'positive' },
      { label: 'Review time', assisted: '7.2h', comparison: '7.4h', direction: 'neutral' },
      { label: 'Rework', assisted: '8.1%', comparison: '8.4%', direction: 'neutral' },
    ],
    filters: { team: 'Frontend', tool: 'Cursor', workflow: 'Feature' },
  },
  {
    id: 'guardrail-platform-refactors',
    kind: 'fix',
    title: 'Add a small-PR guardrail to platform refactors',
    summary:
      'AI-assisted platform refactors moved quickly in implementation but created a larger review queue.',
    impact: '+41%',
    impactLabel: 'review time',
    confidence: 'medium',
    sampleSize: 38,
    evidenceWindow: 'Jul 31 – Aug 27, 2026',
    method:
      'Compared platform refactors in the same size band and excluded dependency-only changes.',
    caveats: [
      'The assisted sample includes two unusually broad migrations.',
      'Deployment incidents are not yet connected for this repository.',
    ],
    nextAction:
      'Limit assisted platform refactors to 400 changed lines and require a test-plan field for 14 days.',
    experimentTarget: 'Reduce median review time by 20% while keeping throughput within 5% of baseline.',
    metrics: [
      { label: 'Coding time', assisted: '9.6h', comparison: '14.1h', direction: 'positive' },
      { label: 'Review time', assisted: '14.8h', comparison: '10.5h', direction: 'negative' },
      { label: 'Rework', assisted: '17.2%', comparison: '11.0%', direction: 'negative' },
    ],
    filters: { team: 'Platform', workflow: 'Refactor' },
  },
  {
    id: 'reclaim-inactive-seats',
    kind: 'save',
    title: 'Reclaim seven inactive seats before renewal',
    summary:
      'Seven paid seats had no observed usage in the last 28 days and no leave-of-absence exception.',
    impact: '$3,360',
    impactLabel: 'annual opportunity',
    confidence: 'high',
    sampleSize: 7,
    evidenceWindow: 'Jul 31 – Aug 27, 2026',
    method: 'Compared seat roster, identity map, and observed tool activity after a seven-day grace period.',
    caveats: ['Usage outside connected tools is not visible.', 'Confirm role changes before removing access.'],
    nextAction: 'Send the renewal review list to workspace owners and confirm exceptions.',
    experimentTarget: 'Resolve all seven seat exceptions before the September renewal.',
    metrics: [
      { label: 'Paid seats', assisted: '72', comparison: '72', direction: 'neutral' },
      { label: 'Active seats', assisted: '65', comparison: '72', direction: 'negative' },
      { label: 'Annual cost', assisted: '$31,200', comparison: '$27,840', direction: 'negative' },
    ],
    filters: {},
  },
];

export const demoDataset: DemoDataset = {
  organization: 'Northstar Cloud',
  teams,
  engineers,
  records: makeRecords(),
  opportunities,
};
