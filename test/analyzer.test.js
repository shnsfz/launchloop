import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { analyzeReadinessWithAi } from '../src/ai/analyzer.js';

function scan() {
  return {
    routes: {
      discovered: ['/pricing']
    },
    integrations: {
      stripe: true,
      posthog: false
    },
    packageJson: {
      scripts: {
        test: 'node --test'
      }
    },
    configuredExpectedRoutes: []
  };
}

function report() {
  return {
    productName: 'Demo',
    score: 72,
    threshold: 85,
    status: 'not-ready',
    framework: 'nextjs',
    blockers: [
      {
        id: 'env-example',
        title: 'Environment variables are documented',
        area: 'Deployment',
        severity: 'blocker',
        recommendation: 'Add .env.example.'
      }
    ],
    warnings: [],
    routeGaps: [],
    envGaps: []
  };
}

test('auto mode skips AI when the configured key is missing', async () => {
  const result = await analyzeReadinessWithAi(scan(), report(), {}, { mode: 'auto' });

  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'missing-env:DEEPSEEK_API_KEY');
});

test('force mode fails when the configured key is missing', async () => {
  await assert.rejects(
    () => analyzeReadinessWithAi(scan(), report(), {}, { mode: 'force' }),
    /Missing DEEPSEEK_API_KEY/
  );
});

test('AI response is parsed into launch-readiness metadata', async () => {
  const originalKey = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test-key';

  try {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Fix deployment docs first.',
                risks: ['Env setup is not reproducible.'],
                nextActions: ['Add a safe env example.'],
                briefAddendum: 'Keep the change limited to deployment documentation.'
              })
            }
          }
        ],
        usage: {
          total_tokens: 42
        }
      })
    });

    const result = await analyzeReadinessWithAi(scan(), report(), {}, { mode: 'force', fetchImpl });

    assert.equal(result.skipped, false);
    assert.equal(result.provider, 'deepseek');
    assert.equal(result.model, 'deepseek-v4-flash');
    assert.equal(result.summary, 'Fix deployment docs first.');
    assert.deepEqual(result.risks, ['Env setup is not reproducible.']);
    assert.deepEqual(result.nextActions, ['Add a safe env example.']);
    assert.equal(result.briefAddendum, 'Keep the change limited to deployment documentation.');
    assert.equal(result.usage.total_tokens, 42);
  } finally {
    if (originalKey === undefined) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = originalKey;
    }
  }
});

test('force mode loads the configured API key from root .env when process env is missing', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'launchloop-ai-env-'));
  await writeFile(path.join(root, '.env'), 'DEEPSEEK_API_KEY=dotenv-test-key\n', 'utf8');

  const originalKey = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;

  try {
    const fetchImpl = async (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer dotenv-test-key');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'AI key loaded from local env file.',
                  risks: [],
                  nextActions: []
                })
              }
            }
          ]
        })
      };
    };

    const result = await analyzeReadinessWithAi({ ...scan(), root }, report(), {}, { mode: 'force', fetchImpl });

    assert.equal(result.skipped, false);
    assert.equal(result.summary, 'AI key loaded from local env file.');
  } finally {
    if (originalKey === undefined) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = originalKey;
    }
  }
});
