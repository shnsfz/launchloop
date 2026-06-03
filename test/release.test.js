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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('release gate has a working build script', () => {
  const result = runNpm(['run', 'build']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('CLI version matches package version', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const result = spawnSync('node', ['src/cli.js', '--version'], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.stdout.trim(), packageJson.version);
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

test('README foregrounds the core launch repair workflow', () => {
  const readme = readFileSync('README.md', 'utf8');

  assert.match(readme, /ranked launch blockers/);
  assert.match(readme, /agent-ready repair brief/);
  assert.match(readme, /rerun/);
  assert.match(readme, /understand/);
  assert.match(readme, /try/);
  assert.match(readme, /trust/);
  assert.match(readme, /pay/);
  assert.match(readme, /benefit/);
  assert.match(readme, /Static evidence/);
  assert.match(readme, /AI judgment/);
  assert.doesNotMatch(readme, /## Security/);
  assert.doesNotMatch(readme, /## 安全/);
});

test('package includes trust and production docs', () => {
  const result = runNpm(['pack', '--dry-run', '--json']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const [pack] = JSON.parse(result.stdout);
  const paths = pack.files.map((file) => file.path);

  assert.ok(paths.includes('SECURITY.md'));
  assert.ok(paths.includes('docs/production-standard.md'));
});

test('production standard is an executable product contract', () => {
  const standard = readFileSync('docs/production-standard.md', 'utf8');

  for (const section of [
    '## 1. Scope',
    '## 4. Evidence Model',
    '## 5. Decision Model',
    '## 6. Outcome Standard for Checked Products',
    '## 7. v0.1 Readiness Rule Matrix',
    '## 8. CLI Behavior Standard',
    '## 9. JSON Report Contract',
    '## 11. Agent Brief Standard',
    '## 15. Package and Release Standard',
    '## 17. Dogfood Standard Before Public Announcement',
    '## 20. Production-Ready Definition of Done'
  ]) {
    assert.match(standard, new RegExp(escapeRegExp(section)));
  }
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
