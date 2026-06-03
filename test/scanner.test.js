import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { scanProject } from '../src/scanners/index.js';

async function tempProject(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'launchloop-scan-'));

  for (const [name, content] of Object.entries(files)) {
    const fullPath = path.join(root, name);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf8');
  }

  return root;
}

test('detects Next.js App Router root page as /', async () => {
  const root = await tempProject({
    'package.json': JSON.stringify({ dependencies: { next: '15.0.0' } }),
    'src/app/page.tsx': 'export default function Page() { return "Home"; }'
  });

  const scan = await scanProject(root);

  assert.deepEqual(scan.routes.discovered, ['/']);
  assert.deepEqual(scan.routes.routeFiles, [{ file: 'src/app/page.tsx', route: '/' }]);
});

test('ignores LaunchLoop generated artifacts during content scanning', async () => {
  const root = await tempProject({
    'package.json': JSON.stringify({ name: 'plain-project' }),
    'README.md': 'Plain local project.',
    '.launchloop/reports/launch-readiness.md': [
      'pricing',
      'stripe',
      'posthog',
      'sentry',
      'support@example.com',
      'privacy policy',
      'get started'
    ].join('\n'),
    '.launchloop/handoffs/codex-brief.md': 'signup dashboard onboarding billing analytics'
  });

  const scan = await scanProject(root);

  assert.equal(scan.content.keywords.pricing, false);
  assert.equal(scan.content.keywords.analytics, false);
  assert.equal(scan.content.keywords.errorMonitoring, false);
  assert.equal(scan.content.keywords.support, false);
  assert.equal(scan.content.keywords.legal, false);
  assert.equal(scan.content.keywords.cta, false);
});
