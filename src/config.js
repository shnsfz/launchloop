import path from 'node:path';
import { exists, readJson, writeJson, writeText, ensureDir } from './lib/fs.js';

export const DEFAULT_CONFIG = {
  schemaVersion: 1,
  productName: 'My Product',
  appUrl: 'http://localhost:3000',
  expectedRoutes: ['/', '/pricing', '/signup', '/login', '/dashboard'],
  primaryCtaText: ['Get started', 'Start free', 'Sign up', 'Try it now'],
  requiredEnvVars: [],
  protectedPaths: [
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    '.env',
    '.env.local'
  ],
  readinessThreshold: 85,
  handoff: {
    defaultTarget: 'generic',
    validationCommands: ['npm test', 'npm run build']
  }
};

export function launchloopDir(root) {
  return path.join(root, '.launchloop');
}

export function configPath(root) {
  return path.join(launchloopDir(root), 'config.json');
}

export async function loadConfig(root) {
  const loaded = await readJson(configPath(root), {});
  return mergeConfig(DEFAULT_CONFIG, loaded || {});
}

function mergeConfig(base, override) {
  return {
    ...base,
    ...override,
    expectedRoutes: override.expectedRoutes ?? base.expectedRoutes,
    primaryCtaText: override.primaryCtaText ?? base.primaryCtaText,
    requiredEnvVars: override.requiredEnvVars ?? base.requiredEnvVars,
    protectedPaths: override.protectedPaths ?? base.protectedPaths,
    handoff: {
      ...base.handoff,
      ...(override.handoff || {})
    }
  };
}

export async function initProject(root, options = {}) {
  const dir = launchloopDir(root);
  await ensureDir(dir);
  await ensureDir(path.join(dir, 'reports'));
  await ensureDir(path.join(dir, 'handoffs'));
  await ensureDir(path.join(dir, 'memory'));
  await ensureDir(path.join(dir, 'playbooks'));

  const cfgPath = configPath(root);
  const alreadyExists = await exists(cfgPath);
  if (alreadyExists && !options.force) {
    return { created: false, path: cfgPath };
  }

  const cfg = {
    ...DEFAULT_CONFIG,
    productName: options.productName || DEFAULT_CONFIG.productName
  };

  await writeJson(cfgPath, cfg);
  await writeText(path.join(dir, 'memory', 'product.md'), productMemoryTemplate(cfg.productName));
  await writeText(path.join(dir, 'playbooks', 'launch-readiness.md'), launchReadinessPlaybook());
  return { created: true, path: cfgPath };
}

function productMemoryTemplate(productName) {
  return `# Product Memory: ${productName}\n\n## Positioning\n\n- Target user:\n- Problem:\n- Promise:\n- Primary CTA:\n\n## Revenue Model\n\n- Pricing model:\n- Paid boundary:\n- Billing provider:\n\n## Product Signals\n\n- Activation event:\n- Retention event:\n- Revenue event:\n\n## Launch History\n\n| Date | Change | Hypothesis | Result | Next Action |\n|---|---|---|---|---|\n`;
}

function launchReadinessPlaybook() {
  return `# Launch Readiness Playbook\n\nUse this checklist before asking a coding agent to ship a public-facing change.\n\n## Blocking checks\n\n- The product has a clear value proposition.\n- New users can find a sign-up or trial path.\n- Pricing or monetization path is explicit.\n- Production environment variables are documented.\n- Build and test commands are known.\n- Sensitive .env files are not committed.\n\n## Agent handoff rule\n\nEvery coding-agent brief should include: goal, non-goals, files likely to change, protected files, acceptance criteria, validation commands, and rollback notes.\n`;
}
