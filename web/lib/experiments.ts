import type { Opportunity } from './types';

export const EXPERIMENT_STORAGE_KEY = 'mergesignal:experiments:v1';
const EXPERIMENT_STATUSES = ['planned', 'running', 'paused', 'completed'] as const;
const MAX_EXPERIMENTS = 100;
const FIELD_LIMITS = {
  id: 180,
  opportunityId: 180,
  title: 180,
  target: 280,
  owner: 180,
} as const;

export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export interface Experiment {
  id: string;
  opportunityId: string;
  title: string;
  target: string;
  status: ExperimentStatus;
  owner: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function createExperiment(
  opportunity: Opportunity,
  now = new Date(),
): Experiment {
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 14);
  const timestamp = now.toISOString();

  return {
    id: `${opportunity.id}-${dateOnly(now)}`,
    opportunityId: opportunity.id,
    title: opportunity.title,
    target: opportunity.experimentTarget,
    status: 'planned',
    owner: 'Engineering Operations',
    startDate: dateOnly(now),
    endDate: dateOnly(end),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function isStatus(value: unknown): value is ExperimentStatus {
  return typeof value === 'string' &&
    EXPERIMENT_STATUSES.includes(value as ExperimentStatus);
}

function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidIsoTimestamp(value: string): boolean {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function asExperiment(value: unknown): Experiment | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const requiredStrings = [
    'id',
    'opportunityId',
    'title',
    'target',
    'owner',
    'startDate',
    'endDate',
    'createdAt',
    'updatedAt',
  ] as const;

  if (
    requiredStrings.some(
      (key) => typeof candidate[key] !== 'string' || candidate[key] === '',
    ) ||
    !isStatus(candidate.status)
  ) {
    return null;
  }

  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    if ((candidate[field] as string).length > limit) return null;
  }
  const startDate = candidate.startDate as string;
  const endDate = candidate.endDate as string;
  const createdAt = candidate.createdAt as string;
  const updatedAt = candidate.updatedAt as string;
  if (
    !isValidDateOnly(startDate) ||
    !isValidDateOnly(endDate) ||
    startDate > endDate ||
    !isValidIsoTimestamp(createdAt) ||
    !isValidIsoTimestamp(updatedAt) ||
    createdAt > updatedAt
  ) {
    return null;
  }

  return {
    id: candidate.id as string,
    opportunityId: candidate.opportunityId as string,
    title: candidate.title as string,
    target: candidate.target as string,
    status: candidate.status,
    owner: candidate.owner as string,
    startDate: candidate.startDate as string,
    endDate: candidate.endDate as string,
    createdAt: candidate.createdAt as string,
    updatedAt: candidate.updatedAt as string,
  };
}

export function loadExperiments(storage: StorageLike): Experiment[] {
  try {
    const raw = storage.getItem(EXPERIMENT_STORAGE_KEY);
    if (!raw) return [];
    const envelope = JSON.parse(raw) as Record<string, unknown>;
    if (
      envelope.version !== 1 ||
      !Array.isArray(envelope.experiments) ||
      envelope.experiments.length > MAX_EXPERIMENTS
    ) {
      return [];
    }

    const experiments = envelope.experiments.map(asExperiment);
    if (experiments.some((experiment) => experiment === null)) return [];
    const ids = experiments.map((experiment) => experiment?.id);
    if (new Set(ids).size !== ids.length) return [];
    return experiments as Experiment[];
  } catch {
    return [];
  }
}

export function saveExperiments(
  storage: StorageLike,
  experiments: Experiment[],
): boolean {
  try {
    if (experiments.length > MAX_EXPERIMENTS) return false;
    const validated = experiments.map(asExperiment);
    if (
      validated.some((experiment) => experiment === null) ||
      new Set(experiments.map((experiment) => experiment.id)).size !== experiments.length
    ) {
      return false;
    }
    storage.setItem(
      EXPERIMENT_STORAGE_KEY,
      JSON.stringify({ version: 1, experiments }),
    );
    return true;
  } catch {
    return false;
  }
}

export function updateExperimentStatus(
  experiment: Experiment,
  status: ExperimentStatus,
  now = new Date(),
): Experiment {
  return { ...experiment, status, updatedAt: now.toISOString() };
}
