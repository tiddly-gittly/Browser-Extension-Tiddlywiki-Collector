import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const TIDDLYWIKI_CLI = require.resolve('tiddlywiki/tiddlywiki.js');
const port = Number(process.env.TW_TEST_API_PORT ?? '9999');
const host = process.env.TW_TEST_API_HOST ?? '127.0.0.1';
const wikiPath = path.resolve(process.cwd(), 'test-artifact', 'manual-api', 'wiki');

fs.mkdirSync(path.dirname(wikiPath), { recursive: true });
if (!fs.existsSync(path.join(wikiPath, 'tiddlywiki.info'))) {
  const initResult = spawnSync(process.execPath, [TIDDLYWIKI_CLI, wikiPath, '--init', 'server'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  if (initResult.status !== 0) {
    process.exit(initResult.status ?? 1);
  }
}

const tiddlersPath = path.join(wikiPath, 'tiddlers');
fs.mkdirSync(tiddlersPath, { recursive: true });
fs.writeFileSync(
  path.join(tiddlersPath, '$__config_Server_AllowAllExternalFilters.tid'),
  'title: $:/config/Server/AllowAllExternalFilters\ntype: text/plain\n\nyes',
  'utf8',
);

console.log(`Starting TiddlyWiki test API at http://${host}:${port}`);
console.log(`Wiki folder: ${wikiPath}`);

const serverProcess = spawn(
  process.execPath,
  [
    TIDDLYWIKI_CLI,
    wikiPath,
    '--listen',
    `host=${host}`,
    `port=${String(port)}`,
    'readers=(anon)',
    'writers=(anon)',
    'csrf-disable=yes',
    'debug-level=none',
  ],
  {
    cwd: process.cwd(),
    stdio: 'inherit',
  },
);

const stopServer = () => {
  if (!serverProcess.killed && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM');
  }
};

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

serverProcess.on('exit', code => {
  process.exit(code ?? 0);
});
