import {
  TEAM_NAMES,
  TOOL_NAMES,
  WORKFLOW_NAMES,
  type TeamName,
  type ToolName,
  type WorkflowName,
} from './types';

export const TELEMETRY_FIELDS = [
  'date',
  'team',
  'tool',
  'workflow',
  'spend',
  'assisted_prs',
  'net_hours',
  'cycle_hours',
  'review_hours',
  'rework_rate',
  'change_failure_rate',
] as const;

type TelemetryField = (typeof TELEMETRY_FIELDS)[number];
type ImportFormat = 'csv' | 'json';

export interface TelemetryRow {
  date: string;
  team: TeamName;
  tool: ToolName;
  workflow: WorkflowName;
  spend?: number;
  assisted_prs?: number;
  net_hours?: number;
  cycle_hours?: number;
  review_hours?: number;
  rework_rate?: number;
  change_failure_rate?: number;
}

export interface TelemetryImportPreview {
  rows: TelemetryRow[];
  acceptedFields: TelemetryField[];
  processing: 'local-only';
  uploadedFields: [];
}

const REQUIRED_FIELDS = ['date', 'team', 'tool', 'workflow'] as const;
const NUMERIC_FIELDS = [
  'spend',
  'assisted_prs',
  'net_hours',
  'cycle_hours',
  'review_hours',
  'rework_rate',
  'change_failure_rate',
] as const;
const SENSITIVE_FIELDS = new Set([
  'prompt',
  'output',
  'source_code',
  'code',
  'diff',
  'patch',
  'file_path',
  'path',
  'command_output',
  'terminal_output',
]);
const MAX_INPUT_BYTES = 2_000_000;
const MAX_ROWS = 5_000;
const MAX_CELL_LENGTH = 512;
const DANGEROUS_FIELDS = new Set(['__proto__', 'prototype', 'constructor']);

export class TelemetryImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelemetryImportError';
  }
}

function isFormulaRisk(value: unknown): boolean {
  return typeof value === 'string' && /^[\t\r\n ]*[=+\-@]/.test(value);
}

function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      row.push(value);
      value = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      if (character === '\r' && input[index + 1] === '\n') index += 1;
    } else {
      value += character;
    }
  }

  if (quoted) throw new TelemetryImportError('CSV contains an unclosed quoted value.');
  row.push(value);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

function validateFields(fields: string[]): TelemetryField[] {
  if (new Set(fields).size !== fields.length) {
    throw new TelemetryImportError('Field names must be unique.');
  }

  for (const field of fields) {
    if (SENSITIVE_FIELDS.has(field) || DANGEROUS_FIELDS.has(field)) {
      throw new TelemetryImportError(`${field} is sensitive and not allowed.`);
    }
    if (!TELEMETRY_FIELDS.includes(field as TelemetryField)) {
      throw new TelemetryImportError(`${field || 'An empty field'} is not allowed.`);
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!fields.includes(field)) {
      throw new TelemetryImportError(`Missing required field: ${field}.`);
    }
  }

  if (!NUMERIC_FIELDS.some((field) => fields.includes(field))) {
    throw new TelemetryImportError('Include at least one supported metric field.');
  }

  return fields as TelemetryField[];
}

function numericValue(field: string, value: unknown, rowNumber: number): number | undefined {
  if (value === '' || value === null || typeof value === 'undefined') return undefined;
  if (isFormulaRisk(value)) {
    throw new TelemetryImportError(`Row ${rowNumber}: formulas are not allowed in ${field}.`);
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new TelemetryImportError(`Row ${rowNumber}: ${field} must be a non-negative number.`);
  }
  if (field === 'assisted_prs' && !Number.isInteger(numeric)) {
    throw new TelemetryImportError(`Row ${rowNumber}: assisted_prs must be a whole number.`);
  }
  if ((field === 'rework_rate' || field === 'change_failure_rate') && numeric > 100) {
    throw new TelemetryImportError(`Row ${rowNumber}: ${field} must be between 0 and 100.`);
  }
  return numeric;
}

function normalizeRow(raw: Record<string, unknown>, rowNumber: number): TelemetryRow {
  for (const [field, value] of Object.entries(raw)) {
    if (value !== null && typeof value === 'object') {
      throw new TelemetryImportError(`Row ${rowNumber}: nested values are not allowed in ${field}.`);
    }
    if (typeof value === 'string' && value.length > MAX_CELL_LENGTH) {
      throw new TelemetryImportError(`Row ${rowNumber}: ${field} is too long.`);
    }
    if (isFormulaRisk(value)) {
      throw new TelemetryImportError(`Row ${rowNumber}: spreadsheet formulas are not allowed.`);
    }
  }

  const date = String(raw.date ?? '').trim();
  const team = String(raw.team ?? '').trim();
  const tool = String(raw.tool ?? '').trim();
  const workflow = String(raw.workflow ?? '').trim();

  if (!isValidDateOnly(date)) {
    throw new TelemetryImportError(`Row ${rowNumber}: date must use YYYY-MM-DD.`);
  }
  if (!TEAM_NAMES.includes(team as TeamName)) {
    throw new TelemetryImportError(`Row ${rowNumber}: unknown team ${team || '(empty)'}.`);
  }
  if (!TOOL_NAMES.includes(tool as ToolName)) {
    throw new TelemetryImportError(`Row ${rowNumber}: unknown tool ${tool || '(empty)'}.`);
  }
  if (!WORKFLOW_NAMES.includes(workflow as WorkflowName)) {
    throw new TelemetryImportError(`Row ${rowNumber}: unknown workflow ${workflow || '(empty)'}.`);
  }

  const result: TelemetryRow = {
    date,
    team: team as TeamName,
    tool: tool as ToolName,
    workflow: workflow as WorkflowName,
  };
  for (const field of NUMERIC_FIELDS) {
    const parsed = numericValue(field, raw[field], rowNumber);
    if (typeof parsed !== 'undefined') result[field] = parsed;
  }
  return result;
}

function csvRecords(input: string) {
  const parsed = parseCsv(input);
  if (parsed.length < 2) {
    throw new TelemetryImportError('CSV must contain a header and at least one data row.');
  }
  const fields = validateFields(
    parsed[0].map((field, index) =>
      (index === 0 ? field.replace(/^\uFEFF/, '') : field).trim().toLowerCase(),
    ),
  );
  const rawRows = parsed.slice(1).map((cells, rowIndex) => {
    if (cells.length !== fields.length) {
      throw new TelemetryImportError(`Row ${rowIndex + 2}: expected ${fields.length} values.`);
    }
    return Object.fromEntries(fields.map((field, index) => [field, cells[index]]));
  });
  return { fields, rawRows };
}

function jsonRecords(input: string) {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    throw new TelemetryImportError('JSON could not be parsed.');
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new TelemetryImportError('JSON must be a non-empty array of records.');
  }
  if (value.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new TelemetryImportError('Every JSON row must be an object.');
  }
  const sourceRows = value as Array<Record<string, unknown>>;
  const rawRows = sourceRows.map((row, rowIndex) => {
    const normalizedEntries = Object.entries(row).map(([field, fieldValue]) => [
      field.trim().toLowerCase(),
      fieldValue,
    ] as const);
    const normalizedKeys = normalizedEntries.map(([field]) => field);
    if (new Set(normalizedKeys).size !== normalizedKeys.length) {
      throw new TelemetryImportError(`Row ${rowIndex + 1}: field names must be unique.`);
    }
    return Object.fromEntries(normalizedEntries);
  });
  const firstKeys = Object.keys(rawRows[0]);
  const fields = validateFields(firstKeys);
  const canonicalShape = [...firstKeys].sort().join('\u0000');

  for (let index = 0; index < rawRows.length; index += 1) {
    const keys = Object.keys(rawRows[index]);
    validateFields(keys);
    if ([...keys].sort().join('\u0000') !== canonicalShape) {
      throw new TelemetryImportError(`Row ${index + 1}: every JSON record must use the same fields.`);
    }
  }
  return { fields, rawRows };
}

export function parseTelemetryImport(
  input: string,
  format: ImportFormat,
): TelemetryImportPreview {
  if (new TextEncoder().encode(input).byteLength > MAX_INPUT_BYTES) {
    throw new TelemetryImportError('Import exceeds the 2 MB local preview limit.');
  }
  const { fields, rawRows } = format === 'csv' ? csvRecords(input) : jsonRecords(input);
  if (rawRows.length > MAX_ROWS) {
    throw new TelemetryImportError('Import exceeds the 5,000 row preview limit.');
  }

  return {
    rows: rawRows.map((row, index) => normalizeRow(row, index + 1)),
    acceptedFields: fields,
    processing: 'local-only',
    uploadedFields: [],
  };
}
