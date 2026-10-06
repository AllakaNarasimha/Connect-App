// Generates the local-dev runtime environment config consumed by `environment.ts`.
// This mirrors ns-twin's `assets/configs/env.js` pattern: a small, git-ignored script tag
// loaded by index.html BEFORE the Angular bundle, so the same build can be deployed to any
// environment by swapping only this file.
//
// Usage: node scripts/generate-local-env.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const outDirConfigs = join(
  __dirname,
  '..',
  'apps',
  'connect-app',
  'public',
  'assets',
  'configs',
);

const outFileConfigs = join(outDirConfigs, 'env.js');

const localEnvironment = {
  environmentName: 'local',
  // Defaults to the dev API for local development.
  // Override with CONNECT_APP_API_ENDPOINT when needed.
  apiEndpoint:
    process.env.CONNECT_APP_API_ENDPOINT ??
    'https://market-data-func-dev.azurewebsites.net/api',
  isDevEnvironment: true,
  isLocalEnvironment: true,
};

mkdirSync(outDirConfigs, { recursive: true });

writeFileSync(
  outFileConfigs,
  `window['__connect-app-env'] = ${JSON.stringify(localEnvironment, null, 2)};\n`,
);

// eslint-disable-next-line no-console
console.log(`Wrote local runtime environment to ${outFileConfigs}`);