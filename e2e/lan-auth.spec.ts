import { chromium, expect, test, BrowserContext, type Worker } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const extensionPath = path.resolve(process.cwd(), 'dist');
const AUTH_TOKEN = 'lan-secret-token';
const AUTH_USER_NAME = 'alice';
const PNG_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pG8WwsAAAAASUVORK5CYII=',
  'base64',
);

function getLanIpv4Address() {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses ?? []) {
      const family = typeof address.family === 'string' ? address.family : address.family === 4 ? 'IPv4' : 'IPv6';
      if (family !== 'IPv4' || address.internal) {
        continue;
      }

      if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(address.address)) {
        return address.address;
      }
    }
  }

  return undefined;
}

async function bootstrapExtension(): Promise<{ context: BrowserContext; extensionId: string; serviceWorker: Worker }> {
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

  return { context, extensionId: serviceWorker.url().split('/')[2], serviceWorker };
}

function createProtectedLanServer(expectedHeaderName: string, expectedHeaderValue: string): Promise<{
  server: http.Server;
  port: number;
  stats: { authorizedMainRequests: number; authorizedScriptRequests: number; authorizedImageRequests: number; unauthorizedRequests: number };
}> {
  return new Promise((resolve, reject) => {
    const stats = {
      authorizedMainRequests: 0,
      authorizedScriptRequests: 0,
      authorizedImageRequests: 0,
      unauthorizedRequests: 0,
    };

    const server = http.createServer((req, res) => {
      const isAuthorized = req.headers[expectedHeaderName] === expectedHeaderValue;

      if (!isAuthorized) {
        stats.unauthorizedRequests += 1;
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Forbidden</h1><p>Missing TidGi token header.</p>');
        return;
      }

      if (req.url === '/protected.js') {
        stats.authorizedScriptRequests += 1;
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        res.end("document.getElementById('script-status').textContent = 'script ok';");
        return;
      }

      if (req.url === '/protected.png') {
        stats.authorizedImageRequests += 1;
        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': PNG_PIXEL.length });
        res.end(PNG_PIXEL);
        return;
      }

      stats.authorizedMainRequests += 1;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>LAN Protected Page</title>
          </head>
          <body>
            <h1>LAN Protected Content</h1>
            <div id="script-status">script pending</div>
            <img id="protected-image" src="/protected.png" alt="Protected" />
            <script src="/protected.js"></script>
          </body>
        </html>
      `);
    });

    server.listen(0, '0.0.0.0', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to resolve LAN server port.'));
        return;
      }

      resolve({ server, port: address.port, stats });
    });

    server.on('error', reject);
  });
}

test.describe('TidGi LAN auth direct access', () => {
  test('adds TidGi token headers for direct browser visits to a LAN server', async () => {
    test.setTimeout(120_000);
    const lanIp = getLanIpv4Address();
    test.skip(!lanIp, 'No LAN IPv4 address available on this machine.');

    const expectedHeaderName = `x-tidgi-auth-token-${AUTH_TOKEN}`;
    const { server, port, stats } = await createProtectedLanServer(expectedHeaderName, AUTH_USER_NAME);
    const protectedUrl = `http://${lanIp}:${port}/`;

    const { context, extensionId, serviceWorker } = await bootstrapExtension();

    try {
      const unauthorizedPage = await context.newPage();
      await unauthorizedPage.goto(protectedUrl, { waitUntil: 'domcontentloaded' });
      await expect(unauthorizedPage.getByText('Forbidden')).toBeVisible();
      expect(stats.unauthorizedRequests).toBeGreaterThan(0);

      const optionsPage = await context.newPage();
      await optionsPage.goto(`chrome-extension://${extensionId}/options/options.html`);

      await optionsPage.getByPlaceholder('Server URI Or LAN Port').fill(protectedUrl);
      await optionsPage.getByRole('button', { name: 'Add Server' }).click();
      await optionsPage.getByRole('button', { name: 'Edit' }).first().click();
      await optionsPage.getByPlaceholder('TidGi Auth Token').fill(AUTH_TOKEN);
      await optionsPage.getByPlaceholder('TidGi Auth Token').blur();
      await optionsPage.getByPlaceholder('TidGi Auth User Name').fill(AUTH_USER_NAME);
      await optionsPage.getByPlaceholder('TidGi Auth User Name').blur();

      await expect.poll(async () => {
        const rules = await serviceWorker.evaluate(async () => chrome.declarativeNetRequest.getDynamicRules());
        return rules.some(rule => rule.condition.regexFilter?.includes(`${lanIp?.replaceAll('.', '\\.')}:${port}`));
      }, { timeout: 15_000 }).toBeTruthy();

      const authorizedPage = await context.newPage();
      await authorizedPage.goto(protectedUrl, { waitUntil: 'load' });

      await expect(authorizedPage.getByText('LAN Protected Content')).toBeVisible();
      await expect(authorizedPage.locator('#script-status')).toHaveText('script ok');
      await expect.poll(async () => {
        return authorizedPage.locator('#protected-image').evaluate((image) => (image as HTMLImageElement).naturalWidth);
      }, { timeout: 10_000 }).toBeGreaterThan(0);

      expect(stats.authorizedMainRequests).toBeGreaterThan(0);
      expect(stats.authorizedScriptRequests).toBeGreaterThan(0);
      expect(stats.authorizedImageRequests).toBeGreaterThan(0);
    } finally {
      server.close();
      await context.close();
    }
  });
});