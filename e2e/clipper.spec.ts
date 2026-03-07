import { chromium, expect, test, BrowserContext } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const extensionPath = path.resolve(process.cwd(), 'dist');

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
  serviceWorker.on('console', msg => console.log('SW LOG:', msg.text()));
  serviceWorker.on('error', err => console.log('SW ERROR:', err.message));
  const extensionId = serviceWorker.url().split('/')[2];
  return { context, extensionId };
}

function createMockServer(port: number, onReceive: (payload: any) => void): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS, GET');
      res.setHeader('Access-Control-Allow-Headers', '*');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url?.includes('/status')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ username: 'test-e2e-user' }));
        return;
      }

      if (req.method === 'PUT' && req.url?.includes('/recipes/default/tiddlers/')) {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            onReceive(JSON.parse(body));
          } catch (e) {
            console.error('Failed to parse body', e);
          }
          res.writeHead(204);
          res.end();
        });
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

test.describe('extension clipper tests', () => {
  let mockServer: http.Server;
  let receivedRequests: any[] = [];
  const MOCK_PORT = 9999;
  test.describe.configure({ mode: 'serial' });
  const MOCK_URL = 'http://127.0.0.1:' + MOCK_PORT;

  test.beforeEach(async () => {
    receivedRequests = [];
    mockServer = await createMockServer(MOCK_PORT, payload => receivedRequests.push(payload));
  });

  test.afterEach(() => {
    if (mockServer) {
      mockServer.close();
    }
  });

  test('clips example.com and captures expected payload', async () => {
    test.setTimeout(120_000);
    const { context, extensionId } = await bootstrapExtension();

    try {
      await context.serviceWorkers()[0].evaluate(async (url) => {
        const payload = { state: { servers: { 'mock': { id: 'mock', name: 'Mock Server', active: true, status: 'online', provider: 'TiddlyHost', uri: url } } }, version: 0 };
        return await new Promise(resolve => setTimeout(() => chrome.storage.sync.set({ 'server-storage-server-storage': JSON.stringify(payload) }, resolve), 100));
      }, MOCK_URL);

      const targetPage = await context.newPage();
      await targetPage.goto('https://example.com/');
      await targetPage.waitForLoadState('networkidle');

      const targetTabId = await context.serviceWorkers()[0].evaluate(async () => {
        return new Promise<number>((resolve) => {
          chrome.tabs.query({ active: true }, (tabs) => {
            resolve(tabs[0].id!);
          });
        });
      });

      const popupPage = await context.newPage();
      await popupPage.goto('chrome-extension://' + extensionId + '/popup.html?tabId=' + targetTabId);
      
      const titleInput = popupPage.locator('input').first();
      await expect(titleInput).toHaveValue(/Example Domain/i, { timeout: 15_000 });
      
      await popupPage.getByRole('tab', { name: 'Markdown' }).click();

      const clipButton = popupPage.getByRole('button', { name: 'Clip Selected' });
      await expect(clipButton).toBeVisible();
      await clipButton.click();

      await expect.poll(() => receivedRequests.length, { timeout: 10_000 }).toBeGreaterThan(0);
      const clipPayload = receivedRequests[0];

      expect(clipPayload.title).toContain('Example Domain');
      expect(clipPayload.fields.type).toBe('text/markdown');
      expect(clipPayload.fields.text).toContain('This domain is for use in documentation examples');
      expect(clipPayload.fields.url).toBe('https://example.com/');
    } finally {
      await context.close();
    }
  });

  test('clips github.com/tiddly-gittly and saves images', async () => {
    test.setTimeout(120_000);
    const { context, extensionId } = await bootstrapExtension();

    try {
      await context.serviceWorkers()[0].evaluate(async (url) => {
        const payload = { state: { servers: { 'mock': { id: 'mock', name: 'Mock Server', active: true, status: 'online', provider: 'TiddlyHost', uri: url } } }, version: 0 };
        return await new Promise(resolve => setTimeout(() => chrome.storage.sync.set({ 'server-storage-server-storage': JSON.stringify(payload) }, resolve), 100));
      }, MOCK_URL);

      const targetPage = await context.newPage();
      await targetPage.goto('https://github.com/tiddly-gittly/Browser-Extension-Tiddlywiki-Collector');
      await targetPage.waitForLoadState('networkidle');

      const targetTabId = await context.serviceWorkers()[0].evaluate(async () => {
        return new Promise<number>((resolve) => {
          chrome.tabs.query({ active: true }, (tabs) => {
            resolve(tabs[0].id!);
          });
        });
      });

      const popupPage = await context.newPage();
      await popupPage.goto('chrome-extension://' + extensionId + '/popup.html?tabId=' + targetTabId);
      
      const titleInput = popupPage.locator('input').first();
      await expect(titleInput).toHaveValue(/Tiddlywiki/i, { timeout: 15_000 });
      await popupPage.waitForSelector('table', { timeout: 15_000 });
      const assetCheckboxes = popupPage.locator('input[type="checkbox"]');
      await assetCheckboxes.first().waitFor({ state: 'attached' });
      
      const count = await assetCheckboxes.count();
      console.log('Found checkboxes:', count);
      for (let i = 0; i < count; i++) {
          await assetCheckboxes.nth(i).check({ force: true });
      }

      await popupPage.getByRole('button', { name: 'Clip Selected' }).click();
      await expect.poll(() => receivedRequests.some(req => req.fields.type && req.fields.type.startsWith('image/')), { timeout: 15_000 }).toBeTruthy();

      expect(receivedRequests.length).toBeGreaterThan(1);
    } finally {
      await context.close();
    }
  });
});
