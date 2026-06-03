import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const roots = ['src', 'scripts'];
const files = roots.flatMap((root) => findJavaScriptFiles(root)).sort();
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    failed = true;
    process.stderr.write(result.stderr || result.stdout);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} runtime JavaScript files.`);

function findJavaScriptFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      files.push(...findJavaScriptFiles(filePath));
    } else if (filePath.endsWith('.js')) {
      files.push(filePath);
    }
  }

  return files;
}
