import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) ?? [], 'browser runtime errors').toEqual([]);
});

test('landing to filtered overview decision loop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prove your AI coding rollout is working.');
  await expect(page.getByRole('heading', { name: 'Every recommendation shows its work.' })).toBeVisible();
  await page.screenshot({ path: '../research/screenshots/mergesignal-landing-desktop.png', fullPage: true, animations: 'disabled' });

  await page.getByRole('link', { name: 'Explore live demo' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByText('Fictional Northstar Cloud demo')).toBeVisible();
  await expect(page.getByText('49 / 72')).toBeVisible();
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Team').selectOption('Frontend');
  await expect(page.getByText('9 / 14')).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByText('49 / 72')).toBeVisible();
  await page.screenshot({ path: '../research/screenshots/mergesignal-app-overview-desktop.png', fullPage: true, animations: 'disabled' });
});

test('evidence receipt launches a persistent experiment', async ({ page }) => {
  await page.goto('/app/opportunities/guardrail-platform-refactors');
  await expect(page.getByText('38 records')).toBeVisible();
  await expect(page.getByText(/association in fictional demo data/i)).toBeVisible();
  await page.screenshot({ path: '../research/screenshots/mergesignal-opportunity.png', fullPage: true, animations: 'disabled' });

  await page.getByRole('link', { name: 'Launch 14-day experiment' }).click();
  await expect(page.getByRole('heading', { name: /small-pr guardrail/i })).toBeVisible();
  await page.getByLabel('Experiment target').fill('Reduce review time by 18% while keeping rework under 12%.');
  await page.getByLabel('Experiment status').selectOption('running');
  await page.reload();
  await expect(page.getByLabel('Experiment target')).toHaveValue('Reduce review time by 18% while keeping rework under 12%.');
  await expect(page.getByLabel('Experiment status')).toHaveValue('running');
  await page.screenshot({ path: '../research/screenshots/mergesignal-experiment.png', fullPage: true, animations: 'disabled' });
});

test('Ask cites records and rejects unsupported forecasting', async ({ page }) => {
  await page.goto('/app/ask');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Which tool has the most net capacity?' }).click();
  await expect(page.getByText(/Cursor has the highest estimated net capacity/i)).toBeVisible();
  await expect(page.getByText('Filtered tool-level delivery records')).toHaveCount(3);

  await page.getByLabel('Ask a question about rollout data').fill('Will we hit next quarter revenue?');
  await page.getByRole('button', { name: 'Answer from records' }).click();
  await expect(page.getByText(/not a general-purpose AI assistant/i)).toBeVisible();
});

test('import is local-only and blocks sensitive JSON', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/app/import');
  await page.waitForLoadState('networkidle');
  const before = requests.length;
  await page.getByRole('button', { name: 'Preview locally' }).click();
  await expect(page.getByText('1 row ready for local analysis.')).toBeVisible();
  expect(requests.length).toBe(before);

  await page.getByRole('button', { name: 'JSON', exact: true }).click();
  await page.getByLabel('Telemetry input').fill(JSON.stringify([{ date: '2026-08-27', team: 'Frontend', tool: 'Cursor', workflow: 'Feature', spend: 10, prompt: 'private' }]));
  await page.getByRole('button', { name: 'Preview locally' }).click();
  await expect(page.getByRole('alert')).toContainText('prompt is sensitive and not allowed');
  expect(requests.length).toBe(before);
});

test('mobile layout stays operable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '../research/screenshots/mergesignal-mobile.png', fullPage: true, animations: 'disabled' });

  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Open application navigation' }).click();
  await expect(page.getByRole('link', { name: 'Import data' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('filtered leadership export is safe and matches the visible cohort', async ({ page }) => {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Team').selectOption('Frontend');
  await expect(page.getByText('9 / 14')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('mergesignal-28d-frontend.csv');
  const path = await download.path();
  expect(path).not.toBeNull();
  const content = await readFile(path as string, 'utf8');
  expect(content).toContain('Team,Frontend');
  expect(content).toContain('Active engineers,9 of 14');
  expect(content).not.toMatch(/engineerId|prompt|source_code/i);
});

test('small cohorts are hidden and cannot be exported', async ({ page }) => {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Period').selectOption('7d');
  await page.getByLabel('Team').selectOption('Frontend');
  await page.getByLabel('Tool').selectOption('Claude Code');
  await page.getByLabel('Workflow').selectOption('Refactor');

  await expect(page.getByRole('heading', { name: 'Protected small cohort' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
});

test('privacy preferences persist and integrations remain honest previews', async ({ page }) => {
  await page.goto('/app/privacy');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Aggregate retention').selectOption('90');
  await page.getByLabel('Minimum cohort size').selectOption('8');
  await page.reload();
  await expect(page.getByLabel('Aggregate retention')).toHaveValue('90');
  await expect(page.getByLabel('Minimum cohort size')).toHaveValue('8');
  await expect(page.getByText(/individual rankings are permanently off/i)).toBeVisible();

  await page.goto('/app/integrations');
  await expect(page.getByText(/illustrative and disconnected/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'GitHub connection unavailable in demo' })).toBeDisabled();
});

test('tablet and keyboard navigation preserve an operable layout', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Open application navigation' }).focus();
  await expect(page.getByRole('button', { name: 'Open application navigation' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open application navigation' }).press('Enter');
  await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
  await page.screenshot({ path: '../research/screenshots/mergesignal-tablet.png', fullPage: true, animations: 'disabled' });
});
