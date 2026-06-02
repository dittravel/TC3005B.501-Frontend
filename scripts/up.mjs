#!/usr/bin/env node
/**
 * One-shot launcher: ensures .env exists, then delegates to switch-env.sh which
 * patches .env, regenerates docker-compose.yml, and builds + runs the frontend
 * container.
 *
 * Usage:
 *   node scripts/up.mjs <devLocal|devDocker|serverDocker>
 */
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MODES = ['devLocal', 'devDocker', 'serverDocker'];
const mode = process.argv[2];

if (!MODES.includes(mode)) {
  console.error(`Usage: node scripts/up.mjs <${MODES.join('|')}>`);
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env');

if (!existsSync(envPath)) {
  const examplePath = resolve(root, '.env.example');
  if (!existsSync(examplePath)) {
    console.error('No .env and no .env.example to bootstrap from.');
    process.exit(1);
  }
  copyFileSync(examplePath, envPath);
  console.log('Bootstrapped .env from .env.example. Fill in secrets before running again if needed.');
}

const result = spawnSync('bash', ['switch-env.sh', mode], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error('Failed to invoke bash. On Windows install Git Bash or WSL.');
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
