import path from 'node:path';
import { exists, readText } from '../lib/fs.js';

const LOCAL_ENV_FILES = ['.env', '.env.local'];

export async function resolveApiKey(aiConfig, root) {
  const fromProcess = process.env[aiConfig.apiKeyEnv];
  if (fromProcess) return fromProcess;

  return readLocalEnvValue(root, aiConfig.apiKeyEnv);
}

async function readLocalEnvValue(root, key) {
  if (!root) return '';

  for (const file of LOCAL_ENV_FILES) {
    const filePath = path.join(root, file);
    if (!(await exists(filePath))) continue;

    const value = parseDotenvValue(await readText(filePath), key);
    if (value) return value;
  }

  return '';
}

function parseDotenvValue(raw, key) {
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const withoutExport = trimmed.startsWith('export ') ? trimmed.slice('export '.length).trim() : trimmed;
    const separator = withoutExport.indexOf('=');
    const name = withoutExport.slice(0, separator).trim();
    if (name !== key) continue;

    return stripQuotes(withoutExport.slice(separator + 1).trim());
  }

  return '';
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
