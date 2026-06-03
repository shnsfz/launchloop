import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateReadiness } from '../src/checks/engine.js';
import { READINESS_RULES } from '../src/checks/rules.js';

function baseScan(overrides = {}) {
  return {
    root: '/tmp/project',
    framework: 'nextjs',
    files: {
      'README.md': false,
      '.env.example': false,
      '.env.template': false,
      '.env': false,
      '.env.local': false,
      'vercel.json': false,
      'netlify.toml': false,
      'Dockerfile': false,
      'docker-compose.yml': false,
      'privacy.md': false,
      'terms.md': false,
      '.github/ISSUE_TEMPLATE/bug_report.md': false,
      '.github/ISSUE_TEMPLATE/feature_request.md': false
    },
    packageJson: {
      found: true,
      scripts: {}
    },
    env: {
      examples: [],
      exampleKeys: [],
      committedEnvFiles: [],
      required: []
    },
    routes: {
      discovered: [],
      expected: []
    },
    content: {
      keywords: {
        valueProp: false,
        cta: false,
        pricing: false,
        auth: false,
        onboarding: false,
        analytics: false,
        errorMonitoring: false,
        support: false,
        legal: false
      }
    },
    integrations: {
      stripe: false,
      paddle: false,
      lemonSqueezy: false,
      posthog: false,
      plausible: false,
      sentry: false,
      clerk: false,
      nextAuth: false,
      supabase: false
    },
    ...overrides
  };
}

test('empty project is not ready and has blockers', () => {
  const report = evaluateReadiness(baseScan(), { productName: 'Empty' });
  assert.equal(report.status, 'not-ready');
  assert.ok(report.blockers.length >= 1);
  assert.ok(report.score < 50);
});

test('project with launch basics can be ready', () => {
  const scan = baseScan({
    files: {
      'README.md': true,
      '.env.example': true,
      '.env.template': false,
      '.env': false,
      '.env.local': false,
      'vercel.json': true,
      'netlify.toml': false,
      'Dockerfile': false,
      'docker-compose.yml': false,
      'privacy.md': true,
      'terms.md': true,
      '.github/ISSUE_TEMPLATE/bug_report.md': true,
      '.github/ISSUE_TEMPLATE/feature_request.md': true
    },
    packageJson: {
      found: true,
      scripts: { build: 'next build', test: 'node --test' }
    },
    env: {
      examples: ['.env.example'],
      exampleKeys: ['NEXT_PUBLIC_POSTHOG_KEY'],
      committedEnvFiles: [],
      required: []
    },
    routes: {
      discovered: ['/', '/pricing', '/signup', '/dashboard'],
      expected: []
    },
    content: {
      keywords: {
        valueProp: true,
        cta: true,
        pricing: true,
        auth: true,
        onboarding: true,
        analytics: true,
        errorMonitoring: true,
        support: true,
        legal: true
      }
    },
    integrations: {
      stripe: true,
      posthog: true,
      sentry: true,
      clerk: true
    }
  });
  const report = evaluateReadiness(scan, { productName: 'Ready', readinessThreshold: 85 });
  assert.equal(report.status, 'ready');
  assert.equal(report.score, 100);
});

test('readiness rule matrix keeps stable ids, severities, and 100 total points', () => {
  const matrix = READINESS_RULES.map((rule) => ({
    id: rule.id,
    severity: rule.severity,
    weight: rule.weight
  }));

  assert.equal(READINESS_RULES.reduce((sum, rule) => sum + rule.weight, 0), 100);
  assert.deepEqual(matrix, [
    { id: 'product-readme', severity: 'warning', weight: 8 },
    { id: 'value-proposition', severity: 'warning', weight: 8 },
    { id: 'pricing-path', severity: 'blocker', weight: 10 },
    { id: 'auth-path', severity: 'warning', weight: 8 },
    { id: 'onboarding-path', severity: 'warning', weight: 7 },
    { id: 'env-example', severity: 'blocker', weight: 10 },
    { id: 'deployment-config', severity: 'warning', weight: 7 },
    { id: 'analytics-events', severity: 'warning', weight: 8 },
    { id: 'error-monitoring', severity: 'warning', weight: 6 },
    { id: 'support-channel', severity: 'warning', weight: 6 },
    { id: 'legal-basics', severity: 'warning', weight: 6 },
    { id: 'secret-hygiene', severity: 'blocker', weight: 8 },
    { id: 'test-script', severity: 'warning', weight: 4 },
    { id: 'build-script', severity: 'warning', weight: 4 }
  ]);
});
