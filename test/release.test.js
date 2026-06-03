import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { assertReadyReportJson } from '../scripts/readiness-report.js';

function runNpm(args) {
  return spawnSync('npm', args, {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('release gate has a working build script', () => {
  const result = runNpm(['run', 'build']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('npm package contains runtime files without the test suite', () => {
  const result = runNpm(['pack', '--dry-run', '--json']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const [pack] = JSON.parse(result.stdout);
  const paths = pack.files.map((file) => file.path);

  assert.ok(paths.includes('package.json'));
  assert.ok(paths.includes('README.md'));
  assert.ok(paths.includes('src/cli.js'));
  assert.ok(paths.includes('examples/nextjs-saas/package.json'));
  assert.equal(paths.some((file) => file.startsWith('test/')), false);
  assert.equal(paths.some((file) => file.startsWith('.launchloop/') || file.includes('/.launchloop/')), false);
});

test('README points to a single local release gate command', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const readme = readFileSync('README.md', 'utf8');

  assert.equal(packageJson.scripts['release:local'], 'node scripts/local-release-gate.js');
  assert.match(readme, /npm run release:local/);
  assert.doesNotMatch(readme, /npm install -g "\.\/\$TARBALL"/);
});

test('README states the production value contract', () => {
  const readme = readFileSync('README.md', 'utf8');

  assert.match(readme, /understand/);
  assert.match(readme, /try/);
  assert.match(readme, /trust/);
  assert.match(readme, /pay/);
  assert.match(readme, /benefit/);
  assert.match(readme, /Static evidence/);
  assert.match(readme, /AI judgment/);
});

test('package includes trust and production docs', () => {
  const result = runNpm(['pack', '--dry-run', '--json']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const [pack] = JSON.parse(result.stdout);
  const paths = pack.files.map((file) => file.path);

  assert.ok(paths.includes('SECURITY.md'));
  assert.ok(paths.includes('docs/production-standard.md'));
});

test('release gate readiness assertion fails on not-ready reports', () => {
  const report = {
    status: 'not-ready',
    score: 92,
    blockers: [
      {
        title: 'No local .env files detected in project root'
      }
    ]
  };

  assert.throws(
    () => assertReadyReportJson(JSON.stringify(report), 'self-check'),
    /self-check is not ready: 92\/100, blockers: No local \.env files detected in project root/
  );
});

test('release gate readiness assertion accepts ready reports', () => {
  const report = {
    status: 'ready',
    score: 100,
    blockers: []
  };

  assert.doesNotThrow(() => assertReadyReportJson(JSON.stringify(report), 'example-check'));
});
