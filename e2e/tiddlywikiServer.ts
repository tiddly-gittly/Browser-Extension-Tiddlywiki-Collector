import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const READY_TIMEOUT_MS = 30_000;
const STATUS_RETRY_MS = 250;
const require = createRequire(import.meta.url);
const TIDDLYWIKI_CLI = require.resolve('tiddlywiki/tiddlywiki.js');

export const TEST_ARTIFACT_ROOT = path.resolve(process.cwd(), 'test-artifact');

export interface TiddlyWikiServer {
  wikiPath: string;
  baseUrl: string;
  process: ChildProcessWithoutNullStreams;
  stop: () => Promise<void>;
}

interface StartServerOptions {
  wikiPath: string;
  port: number;
  host?: string;
  clean?: boolean;
}

function runTiddlyWikiInit(wikiPath: string): void {
  const result = spawnSync(process.execPath, [TIDDLYWIKI_CLI, wikiPath, '--init', 'server'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw new Error(`Failed to spawn tiddlywiki init process: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(
      `Failed to init test wiki at ${wikiPath}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
}

function writeTestWikiServerConfig(wikiPath: string): void {
  const tiddlersPath = path.join(wikiPath, 'tiddlers');
  fs.mkdirSync(tiddlersPath, { recursive: true });
  const allowFilterConfigPath = path.join(tiddlersPath, '$__config_Server_AllowAllExternalFilters.tid');
  fs.writeFileSync(
    allowFilterConfigPath,
    'title: $:/config/Server/AllowAllExternalFilters\ntype: text/plain\n\nyes',
    'utf8',
  );
}

function requestStatus(baseUrl: string): Promise<boolean> {
  return new Promise(resolve => {
    const url = new URL('/status', baseUrl);
    const request = http.get(url, response => {
      response.resume();
      resolve((response.statusCode ?? 500) < 500);
    });

    request.on('error', () => {
      resolve(false);
    });
  });
}

async function waitForServerReady(baseUrl: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const ready = await requestStatus(baseUrl);
    if (ready) {
      return;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, STATUS_RETRY_MS));
  }

  throw new Error(`Timed out waiting for TiddlyWiki server to become ready at ${baseUrl}`);
}

export async function startTiddlyWikiServer(options: StartServerOptions): Promise<TiddlyWikiServer> {
  const host = options.host ?? '127.0.0.1';
  const baseUrl = `http://${host}:${options.port}`;
  const wikiPath = path.resolve(options.wikiPath);

  fs.mkdirSync(TEST_ARTIFACT_ROOT, { recursive: true });
  if (options.clean ?? true) {
    fs.rmSync(wikiPath, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(wikiPath), { recursive: true });
  runTiddlyWikiInit(wikiPath);
  writeTestWikiServerConfig(wikiPath);

  const processRef = spawn(
    process.execPath,
    [
      TIDDLYWIKI_CLI,
      wikiPath,
      '--listen',
      `host=${host}`,
      `port=${String(options.port)}`,
      'readers=(anon)',
      'writers=(anon)',
      'csrf-disable=yes',
      'debug-level=none',
    ],
    {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stdioLog = '';
  processRef.stdout.on('data', chunk => {
    stdioLog += chunk.toString();
  });
  processRef.stderr.on('data', chunk => {
    stdioLog += chunk.toString();
  });

  try {
    await waitForServerReady(baseUrl, READY_TIMEOUT_MS);
  } catch (error) {
    processRef.kill('SIGTERM');
    throw new Error(`${(error as Error).message}\nServer log:\n${stdioLog}`);
  }

  const stop = async () => {
    if (processRef.killed || processRef.exitCode !== null) {
      return;
    }

    await new Promise<void>(resolve => {
      processRef.once('exit', () => resolve());
      processRef.kill('SIGTERM');
      setTimeout(() => {
        if (!processRef.killed && processRef.exitCode === null) {
          processRef.kill('SIGKILL');
        }
      }, 5_000);
    });
  };

  return {
    wikiPath,
    baseUrl,
    process: processRef,
    stop,
  };
}

function walkFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

export function readSavedTiddlerArtifacts(wikiPath: string): Array<{ filePath: string; content: string }> {
  const tiddlersPath = path.join(wikiPath, 'tiddlers');
  const allFiles = walkFiles(tiddlersPath).filter(filePath => {
    return ['.tid', '.json', '.meta'].includes(path.extname(filePath));
  });

  return allFiles.map(filePath => ({
    filePath,
    content: fs.readFileSync(filePath, 'utf8'),
  }));
}
