export const TEAM_NAMES = [
  'Frontend',
  'Platform',
  'Data',
  'Mobile',
  'Infrastructure',
  'Developer Experience',
] as const;

export const TOOL_NAMES = ['Cursor', 'Claude Code', 'Copilot'] as const;
export const WORKFLOW_NAMES = ['Feature', 'Bugfix', 'Refactor', 'Tests'] as const;

export type TeamName = (typeof TEAM_NAMES)[number];
export type ToolName = (typeof TOOL_NAMES)[number];
export type WorkflowName = (typeof WORKFLOW_NAMES)[number];
export type Period = '7d' | '14d' | '28d';
export type Confidence = 'high' | 'medium' | 'low';

export interface Team {
  name: TeamName;
  size: number;
}

export interface Engineer {
  id: string;
  team: TeamName;
}

export interface WorkRecord {
  id: string;
  day: number;
  engineerId: string;
  team: TeamName;
  tool: ToolName;
  workflow: WorkflowName;
  spend: number;
  netHours: number;
  cycleHours: number;
  reviewHours: number;
  reworked: boolean;
  failed: boolean;
}

export interface Filters {
  period: Period;
  team: TeamName | 'all';
  tool: ToolName | 'all';
  workflow: WorkflowName | 'all';
}

export interface EvidenceMetric {
  label: string;
  assisted: string;
  comparison: string;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface Opportunity {
  id: string;
  kind: 'scale' | 'fix' | 'save';
  title: string;
  summary: string;
  impact: string;
  impactLabel: string;
  confidence: Confidence;
  sampleSize: number;
  evidenceWindow: string;
  method: string;
  caveats: string[];
  nextAction: string;
  experimentTarget: string;
  metrics: EvidenceMetric[];
  filters: Partial<Filters>;
}

export interface DemoDataset {
  organization: string;
  teams: Team[];
  engineers: Engineer[];
  records: WorkRecord[];
  opportunities: Opportunity[];
}

export interface Summary {
  spend: number;
  activeEngineers: number;
  totalEngineers: number;
  assistedPrs: number;
  netHours: number;
  cycleHours: number;
  reviewHours: number;
  reworkRate: number;
  changeFailureRate: number;
  savingsOpportunity: number;
}
