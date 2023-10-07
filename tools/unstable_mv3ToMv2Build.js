/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/import-style */
// @ts-check

import fs from 'fs-extra';
import * as path from 'path';

const BASE_OUT_DIR = 'dist';
const baseOutDir = path.resolve(BASE_OUT_DIR);

if (!fs.existsSync(baseOutDir)) {
  throw new Error(`${BASE_OUT_DIR} dir does not exist. Please run base build first.`);
}

const outDir = `${path.dirname(path.basename(baseOutDir))}/${BASE_OUT_DIR}-firefox-v2`;

fs.copySync(baseOutDir, outDir);

const manifestPath = path.resolve(outDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// manifest.manifest_version = 2;

fs.writeFileSync(
  `${outDir}/background.html`,
  '<script type="module" src="./service-worker-loader.js"></script>',
);
manifest.background = { page: 'background.html' };

// manifest.browser_action = manifest.action;
// delete manifest.action;

// for (const permission of manifest.host_permissions) {
//   manifest.permissions.push(permission === '<all_urls>' ? '*://*/*' : permission);
// }
// delete manifest.host_permissions;

// const temporaryResources = [];
// for (const object of manifest.web_accessible_resources) {
//   for (const resource of object.resources) {
//     temporaryResources.push(resource);
//   }
// }
// manifest.web_accessible_resources = temporaryResources;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
