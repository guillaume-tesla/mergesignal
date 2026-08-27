import {
  TEAM_NAMES,
  TOOL_NAMES,
  WORKFLOW_NAMES,
  type Filters,
  type Period,
  type TeamName,
  type ToolName,
  type WorkflowName,
} from './types';

export const FILTER_STORAGE_KEY = 'mergesignal:filters:v1';
export const PRIVACY_STORAGE_KEY = 'mergesignal:privacy:v1';

const FILTER_CHANGE_EVENT = 'mergesignal:filters-change';
const PRIVACY_CHANGE_EVENT = 'mergesignal:privacy-change';
const PERIODS = ['7d', '14d', '28d'] as const;

export const DEFAULT_FILTERS: Filters = {
  period: '28d',
  team: 'all',
  tool: 'all',
  workflow: 'all',
};

export interface PrivacyPreferences {
  retention: '30' | '60' | '90';
  cohort: '5' | '8' | '10';
}

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  retention: '30',
  cohort: '5',
};

let volatileFilters = '';
let volatilePrivacy = '';
let useVolatileFilters = false;
let useVolatilePrivacy = false;

function includes<Value extends string>(values: readonly Value[], value: unknown): value is Value {
  return typeof value === 'string' && values.includes(value as Value);
}

export function parseFilters(raw: string): Filters {
  try {
    const value = JSON.parse(raw || 'null') as (Partial<Filters> & { version?: number }) | null;
    if (!value || value.version !== 1) return DEFAULT_FILTERS;

    return {
      period: includes<Period>(PERIODS, value.period) ? value.period : DEFAULT_FILTERS.period,
      team: value.team === 'all' || includes<TeamName>(TEAM_NAMES, value.team)
        ? value.team
        : DEFAULT_FILTERS.team,
      tool: value.tool === 'all' || includes<ToolName>(TOOL_NAMES, value.tool)
        ? value.tool
        : DEFAULT_FILTERS.tool,
      workflow: value.workflow === 'all' || includes<WorkflowName>(WORKFLOW_NAMES, value.workflow)
        ? value.workflow
        : DEFAULT_FILTERS.workflow,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function parsePrivacyPreferences(raw: string): PrivacyPreferences {
  try {
    const value = JSON.parse(raw || 'null') as (Partial<PrivacyPreferences> & { version?: number }) | null;
    if (!value || value.version !== 1) return DEFAULT_PRIVACY_PREFERENCES;

    return {
      retention: includes(['30', '60', '90'] as const, value.retention)
        ? value.retention
        : DEFAULT_PRIVACY_PREFERENCES.retention,
      cohort: includes(['5', '8', '10'] as const, value.cohort)
        ? value.cohort
        : DEFAULT_PRIVACY_PREFERENCES.cohort,
    };
  } catch {
    return DEFAULT_PRIVACY_PREFERENCES;
  }
}

export function filtersSnapshot(): string {
  try {
    return window.localStorage.getItem(FILTER_STORAGE_KEY) ?? (useVolatileFilters ? volatileFilters : '');
  } catch {
    return volatileFilters;
  }
}

export function privacySnapshot(): string {
  try {
    return window.localStorage.getItem(PRIVACY_STORAGE_KEY) ?? (useVolatilePrivacy ? volatilePrivacy : '');
  } catch {
    return volatilePrivacy;
  }
}

function subscribe(eventName: string, onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(eventName, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(eventName, onChange);
  };
}

export function subscribeFilters(onChange: () => void) {
  return subscribe(FILTER_CHANGE_EVENT, onChange);
}

export function subscribePrivacy(onChange: () => void) {
  return subscribe(PRIVACY_CHANGE_EVENT, onChange);
}

export function emptyWorkspaceSnapshot() {
  return '';
}

function writePreference(
  key: string,
  eventName: string,
  serialized: string,
  setVolatile: (raw: string) => void,
  setVolatileFallback: (enabled: boolean) => void,
) {
  setVolatile(serialized);
  let persisted = true;

  try {
    window.localStorage.setItem(key, serialized);
  } catch {
    persisted = false;
  }

  setVolatileFallback(!persisted);
  window.dispatchEvent(new Event(eventName));
  return persisted;
}

export function writeFilters(filters: Filters) {
  return writePreference(
    FILTER_STORAGE_KEY,
    FILTER_CHANGE_EVENT,
    JSON.stringify({ version: 1, ...filters }),
    (raw) => { volatileFilters = raw; },
    (enabled) => { useVolatileFilters = enabled; },
  );
}

export function writePrivacyPreferences(preferences: PrivacyPreferences) {
  return writePreference(
    PRIVACY_STORAGE_KEY,
    PRIVACY_CHANGE_EVENT,
    JSON.stringify({ version: 1, ...preferences }),
    (raw) => { volatilePrivacy = raw; },
    (enabled) => { useVolatilePrivacy = enabled; },
  );
}

export function minimumCohortSize(preferences: PrivacyPreferences) {
  return Number(preferences.cohort);
}

export function filterScopeHeading(filters: Filters) {
  const period = filters.period === '7d'
    ? 'Last 7 days'
    : filters.period === '14d'
      ? 'Last 14 days'
      : 'Last 28 days';

  return [
    'Northstar Cloud',
    period,
    filters.team === 'all' ? 'All teams' : filters.team,
    filters.tool === 'all' ? 'All tools' : filters.tool,
    filters.workflow === 'all' ? 'All workflows' : filters.workflow,
  ].join(' · ');
}
