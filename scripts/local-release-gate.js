import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertReadyReportJson } from './readiness-report.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packDir = mkdtempSync(path.join(tmpdir(), 'launchloop-pack-'));

run('npm', ['test']);
run('npm', ['run', 'build']);
run('npm', ['pack', '--dry-run']);

const pack = run('npm', ['pack', '--pack-destination', packDir, '--silent'], {
  stdio: 'pipe'
});
const tarballName = pack.stdout.trim().split(/\r?\n/).at(-1);
const tarballPath = path.join(packDir, tarballName);

if (!tarballName || !existsSync(tarballPath)) {
  fail(`npm pack did not create a tarball under ${packDir}`);
}

console.log(`Tarball: ${tarballPath}`);

run('npm', ['install', '-g', tarballPath]);
run('launchloop', ['--version']);

const exampleCheck = run('launchloop', ['check', 'examples/nextjs-saas', '--no-ai', '--json'], {
  stdio: 'pipe'
});
assertReady('installed example check', exampleCheck.stdout);

run('launchloop', ['brief', 'examples/nextjs-saas', '--target', 'codex']);

const selfCheck = run('launchloop', ['check', '.', '--no-ai', '--json'], {
  stdio: 'pipe'
});
assertReady('installed self check', selfCheck.stdout);

console.log('Local release gate passed.');

function run(command, args, options = {}) {
  console.log(`\n$ ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio || 'inherit'
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }

  return result;
}

function assertReady(label, rawJson) {
  try {
    assertReadyReportJson(rawJson, label);
    console.log(`${label}: ready`);
  } catch (error) {
    fail(error.message);
  }
}

function fail(message) {
  console.error(`Local release gate failed: ${message}`);
  process.exit(1);
}
