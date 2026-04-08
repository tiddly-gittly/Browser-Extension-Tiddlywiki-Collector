import { chromium, expect, test, BrowserContext } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {
  readSavedTiddlerArtifacts,
  startTiddlyWikiServer,
  TEST_ARTIFACT_ROOT,
  type TiddlyWikiServer,
} from './tiddlywikiServer';

const extensionPath = path.resolve(process.cwd(), 'dist');
const DEFAULT_WAIT_MS = 500;

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function getTabIdByUrlPart(context: BrowserContext, urlPart: string): Promise<number> {
  const [serviceWorker] = context.serviceWorkers();
  const tabId = await serviceWorker?.evaluate(async (pattern) => {
    return await new Promise<number | null>((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        const tab = tabs.find(item => item.url?.includes(pattern));
        resolve(tab?.id ?? null);
      });
    });
  }, urlPart);

  if (typeof tabId !== 'number') {
    throw new Error(`Unable to find tab id by URL pattern: ${urlPart}`);
  }
  return tabId;
}

async function bootstrapExtension(): Promise<{ context: BrowserContext; extensionId: string }> {
  expect(fs.existsSync(path.join(extensionPath, 'manifest.json'))).toBeTruthy();
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: false,
    args: [
      '--disable-extensions-except=' + extensionPath,
      '--load-extension=' + extensionPath,
      '--lang=en-US',
    ],
  });

  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15_000 });
  }

  const extensionId = serviceWorker.url().split('/')[2];
  return { context, extensionId };
}

async function configureServerViaOptions(
  context: BrowserContext,
  extensionId: string,
  serverUrl: string,
): Promise<void> {
  const optionsPage = await context.newPage();
  await optionsPage.goto('chrome-extension://' + extensionId + '/options/options.html');

  await optionsPage.getByPlaceholder('Server URI Or LAN Port').fill(serverUrl);
  await optionsPage.getByRole('button', { name: 'Add Server' }).click();

  await expect(optionsPage.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
  await optionsPage.close();
}

function allArtifactContents(server: TiddlyWikiServer): string {
  return readSavedTiddlerArtifacts(server.wikiPath)
    .map(item => item.content)
    .join('\n\n');
}

test.describe('extension clipper integration tests', () => {
  let twServer: TiddlyWikiServer;
  
  const TW_PORT = 9999;
  const E2E_WIKI_PATH = path.join(TEST_ARTIFACT_ROOT, 'e2e', 'clipper-wiki');
  const TW_URL = 'http://127.0.0.1:' + TW_PORT;

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    twServer = await startTiddlyWikiServer({
      wikiPath: E2E_WIKI_PATH,
      port: TW_PORT,
      clean: true,
    });
  });

  test.afterEach(async () => {
    if (twServer) {
      await twServer.stop();
    }
  });

  test('clips content from real webpage via popup', async () => {
    test.setTimeout(120_000);
    const { context, extensionId } = await bootstrapExtension();

    try {
      await configureServerViaOptions(context, extensionId, TW_URL);

      const articlePage = await context.newPage();
      await articlePage.goto('https://example.com/');
      await articlePage.waitForLoadState('networkidle');
      
      await delay(1000);
      const articleTabId = await getTabIdByUrlPart(context, 'https://example.com/');

      const popupPage = await context.newPage();
      await popupPage.goto('chrome-extension://' + extensionId + '/popup/popup.html?tabId=' + String(articleTabId));
      
      await delay(DEFAULT_WAIT_MS);

      const titleInput = popupPage.locator('input[placeholder="Tiddler Title"]');
      await expect.poll(() => titleInput.inputValue(), { timeout: 10_000 }).toContain('Example Domain');

      const htmlTab = popupPage.getByRole('tab', { name: /^html$/i });
      if (htmlTab) {
        await htmlTab.click();
      }

      const textarea = popupPage.locator('textarea').first();
      await expect.poll(() => textarea.inputValue(), { timeout: 10_000 }).toContain('This domain is for use in documentation examples');

      await popupPage.getByRole('button', { name: 'Clip Selected' }).click();

      await expect.poll(() => readSavedTiddlerArtifacts(twServer.wikiPath).length, { timeout: 20_000 }).toBeGreaterThan(0);
      await expect.poll(() => allArtifactContents(twServer), { timeout: 20_000 }).toContain('Example Domain');
      await expect.poll(() => allArtifactContents(twServer), { timeout: 20_000 }).toContain('This domain is for use in documentation examples');
    } finally {
      await context.close();
    }
  });

  test('saves manual clip when popup is used directly', async () => {
    test.setTimeout(60_000);
    const { context, extensionId } = await bootstrapExtension();

    try {
      // Configure server
      await configureServerViaOptions(context, extensionId, TW_URL);

      const popupPage = await context.newPage();
      await popupPage.goto('chrome-extension://' + extensionId + '/popup/popup.html');

      // Activate html tab
      const htmlTab = popupPage.getByRole('tab', { name: /^html$/i });
      if (htmlTab) {
        await htmlTab.click();
      }

      // Manually fill form
      await popupPage.locator('input[placeholder="Tiddler Title"]').fill('Manual Clip Test');
      await popupPage.locator('textarea').first().fill('This is manually entered content for testing.');

      // Save clip
      await popupPage.getByRole('button', { name: 'Clip Selected' }).click();

      // Verify saved to wiki
      await expect.poll(() => allArtifactContents(twServer), { timeout: 20_000 }).toContain('title: Manual Clip Test');
      await expect.poll(() => allArtifactContents(twServer), { timeout: 20_000 }).toContain('manually entered content');
    } finally {
      await context.close();
    }
  });
});
