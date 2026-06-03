import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export async function readJson(filePath, fallback = null) {
  try {
    const raw = await readText(filePath);
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function writeText(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, value, 'utf8');
}

export async function listFilesRecursive(root, options = {}) {
  const maxFiles = options.maxFiles ?? 5000;
  const ignoreDirs = new Set(options.ignoreDirs ?? [
    'node_modules', '.git', '.next', '.launchloop', 'dist', 'build', 'coverage', '.turbo', '.vercel'
  ]);
  const results = [];

  async function walk(dir) {
    if (results.length >= maxFiles) return;
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) await walk(full);
      } else if (entry.isFile()) {
        results.push(full);
      }
    }
  }

  await walk(root);
  return results;
}

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

export function stripExt(filePath) {
  return filePath.replace(/\.(tsx|ts|jsx|js|mdx|md)$/i, '');
}
