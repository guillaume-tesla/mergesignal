import { describe, expect, it } from 'vitest';
import { demoDataset } from '../lib/demo-data';
import {
  createExperiment,
  loadExperiments,
  saveExperiments,
  updateExperimentStatus,
} from '../lib/experiments';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe('experiment lifecycle', () => {
  it('creates a 14-day experiment from an evidence-backed opportunity', () => {
    const opportunity = demoDataset.opportunities[0];
    const experiment = createExperiment(
      opportunity,
      new Date('2026-08-27T10:00:00.000Z'),
    );

    expect(experiment.opportunityId).toBe(opportunity.id);
    expect(experiment.status).toBe('planned');
    expect(experiment.startDate).toBe('2026-08-27');
    expect(experiment.endDate).toBe('2026-09-10');
    expect(experiment.target).toContain('throughput');
  });

  it('persists a schema-versioned experiment and advances its status', () => {
    const storage = new MemoryStorage();
    const experiment = createExperiment(
      demoDataset.opportunities[0],
      new Date('2026-08-27T10:00:00.000Z'),
    );

    saveExperiments(storage, [experiment]);
    const restored = loadExperiments(storage);
    const running = updateExperimentStatus(restored[0], 'running');

    expect(restored).toHaveLength(1);
    expect(running.status).toBe('running');
  });

  it('fails closed when stored data is malformed', () => {
    const storage = new MemoryStorage();
    storage.setItem('mergesignal:experiments:v1', '{"version":1,"experiments":[{"status":"owned"}]}');

    expect(loadExperiments(storage)).toEqual([]);
  });

  it('rejects invalid dates, oversized content, and duplicate experiment ids', () => {
    const valid = createExperiment(
      demoDataset.opportunities[0],
      new Date('2026-08-27T10:00:00.000Z'),
    );
    const storage = new MemoryStorage();

    storage.setItem('mergesignal:experiments:v1', JSON.stringify({
      version: 1,
      experiments: [{ ...valid, endDate: '2026-02-31' }],
    }));
    expect(loadExperiments(storage)).toEqual([]);

    storage.setItem('mergesignal:experiments:v1', JSON.stringify({
      version: 1,
      experiments: [{ ...valid, target: 'x'.repeat(281) }],
    }));
    expect(loadExperiments(storage)).toEqual([]);

    storage.setItem('mergesignal:experiments:v1', JSON.stringify({
      version: 1,
      experiments: [valid, { ...valid }],
    }));
    expect(loadExperiments(storage)).toEqual([]);
  });

  it('rejects reversed date ranges and more than 100 persisted experiments', () => {
    const valid = createExperiment(
      demoDataset.opportunities[0],
      new Date('2026-08-27T10:00:00.000Z'),
    );
    const storage = new MemoryStorage();

    storage.setItem('mergesignal:experiments:v1', JSON.stringify({
      version: 1,
      experiments: [{ ...valid, startDate: '2026-09-11', endDate: '2026-09-10' }],
    }));
    expect(loadExperiments(storage)).toEqual([]);

    storage.setItem('mergesignal:experiments:v1', JSON.stringify({
      version: 1,
      experiments: Array.from({ length: 101 }, (_, index) => ({ ...valid, id: `${valid.id}-${index}` })),
    }));
    expect(loadExperiments(storage)).toEqual([]);
  });
});
