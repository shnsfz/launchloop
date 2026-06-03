import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { exists, listFilesRecursive, readJson, readText, toPosix } from '../lib/fs.js';

const SOURCE_EXT = /\.(tsx|ts|jsx|js|mdx|md|json)$/i;
const ROUTE_EXT = /\.(tsx|ts|jsx|js|mdx)$/i;

export async function scanProject(root, config = {}) {
  const absoluteRoot = path.resolve(root);
  const packageJson = await readJson(path.join(absoluteRoot, 'package.json'), null);
  const allFiles = await listFilesRecursive(absoluteRoot);
  const relFiles = allFiles.map((f) => toPosix(path.relative(absoluteRoot, f)));

  const scan = {
    root: absoluteRoot,
    generatedAt: new Date().toISOString(),
    packageJson: summarizePackage(packageJson),
    framework: detectFramework(packageJson, relFiles),
    files: await scanImportantFiles(absoluteRoot),
    env: await scanEnv(absoluteRoot),
    routes: scanRoutes(relFiles),
    content: await scanContent(absoluteRoot, allFiles),
    integrations: detectIntegrations(packageJson, allFiles, absoluteRoot),
    configuredExpectedRoutes: config.expectedRoutes || [],
    configuredRequiredEnvVars: config.requiredEnvVars || []
  };

  scan.routes.expected = (config.expectedRoutes || []).map((route) => ({
    route,
    found: scan.routes.discovered.includes(route)
  }));

  scan.env.required = (config.requiredEnvVars || []).map((key) => ({
    key,
    documented: scan.env.exampleKeys.includes(key)
  }));

  return scan;
}

function summarizePackage(packageJson) {
  if (!packageJson) {
    return {
      found: false,
      scripts: {},
      dependencies: [],
      devDependencies: []
    };
  }

  return {
    found: true,
    name: packageJson.name,
    version: packageJson.version,
    scripts: packageJson.scripts || {},
    dependencies: Object.keys(packageJson.dependencies || {}),
    devDependencies: Object.keys(packageJson.devDependencies || {})
  };
}

function detectFramework(packageJson, relFiles) {
  const deps = new Set([
    ...Object.keys(packageJson?.dependencies || {}),
    ...Object.keys(packageJson?.devDependencies || {})
  ]);

  if (deps.has('next')) return 'nextjs';
  if (deps.has('@remix-run/react') || deps.has('@remix-run/node')) return 'remix';
  if (deps.has('astro')) return 'astro';
  if (deps.has('@sveltejs/kit')) return 'sveltekit';
  if (deps.has('vite')) return 'vite';
  if (deps.has('express')) return 'express';
  if (relFiles.some((f) => f.startsWith('src/app/') || f.startsWith('app/'))) return 'nextjs-app-router-like';
  if (relFiles.some((f) => f.startsWith('src/pages/') || f.startsWith('pages/'))) return 'pages-router-like';
  return 'unknown';
}

async function scanImportantFiles(root) {
  const names = [
    'README.md',
    'package.json',
    '.env.example',
    '.env.template',
    '.env',
    '.env.local',
    'vercel.json',
    'netlify.toml',
    'Dockerfile',
    'docker-compose.yml',
    'LICENSE',
    'AGENTS.md',
    'CLAUDE.md',
    'privacy.md',
    'terms.md',
    'SECURITY.md',
    'CONTRIBUTING.md',
    '.github/ISSUE_TEMPLATE/bug_report.md',
    '.github/ISSUE_TEMPLATE/feature_request.md'
  ];

  const result = {};
  for (const name of names) {
    result[name] = await exists(path.join(root, name));
  }
  return result;
}

async function scanEnv(root) {
  const envExampleCandidates = ['.env.example', '.env.template', '.env.local.example'];
  const envFiles = ['.env', '.env.local', '.env.production'];
  const exampleKeys = new Set();
  const examples = [];

  for (const file of envExampleCandidates) {
    const full = path.join(root, file);
    if (await exists(full)) {
      examples.push(file);
      const raw = await readText(full);
      for (const key of extractEnvKeys(raw)) exampleKeys.add(key);
    }
  }

  const committedEnvFiles = [];
  for (const file of envFiles) {
    if (await exists(path.join(root, file)) && !(await isIgnoredEnvFile(root, file))) {
      committedEnvFiles.push(file);
    }
  }

  return {
    examples,
    exampleKeys: [...exampleKeys].sort(),
    committedEnvFiles
  };
}

async function isIgnoredEnvFile(root, file) {
  const gitResult = spawnSync('git', ['check-ignore', '--quiet', '--', file], {
    cwd: root,
    stdio: 'ignore'
  });

  if (gitResult.status === 0) return true;
  return isIgnoredByRootGitignore(await readRootGitignore(root), file);
}

async function readRootGitignore(root) {
  const filePath = path.join(root, '.gitignore');
  if (!(await exists(filePath))) return '';
  return readText(filePath);
}

function isIgnoredByRootGitignore(raw, file) {
  let ignored = false;

  for (const line of raw.split(/\r?\n/)) {
    const pattern = line.trim();
    if (!pattern || pattern.startsWith('#')) continue;

    const negated = pattern.startsWith('!');
    const normalized = (negated ? pattern.slice(1) : pattern).replace(/^\//, '');
    if (gitignorePatternMatches(normalized, file)) {
      ignored = !negated;
    }
  }

  return ignored;
}

function gitignorePatternMatches(pattern, file) {
  if (pattern === file) return true;
  if (pattern.endsWith('*')) return file.startsWith(pattern.slice(0, -1));
  return false;
}

function extractEnvKeys(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => line.split('=')[0].trim())
    .filter(Boolean);
}

function scanRoutes(relFiles) {
  const discovered = new Set();
  const routeFiles = [];

  for (const file of relFiles) {
    if (!ROUTE_EXT.test(file)) continue;

    const route = routeFromFile(file);
    if (route) {
      discovered.add(route);
      routeFiles.push({ file, route });
    }
  }

  return {
    discovered: [...discovered].sort((a, b) => a.localeCompare(b)),
    routeFiles,
    expected: []
  };
}

function routeFromFile(file) {
  const normalized = toPosix(file);
  const appPrefixes = ['src/app/', 'app/'];
  const pagesPrefixes = ['src/pages/', 'pages/'];

  for (const prefix of appPrefixes) {
    if (normalized.startsWith(prefix) && /\/page\.(tsx|ts|jsx|js|mdx)$/i.test(normalized)) {
      const withoutPrefix = normalized.slice(prefix.length);
      const dir = withoutPrefix.replace(/(^|\/)page\.(tsx|ts|jsx|js|mdx)$/i, '');
      return normalizeRoute(dir);
    }
  }

  for (const prefix of pagesPrefixes) {
    if (normalized.startsWith(prefix) && ROUTE_EXT.test(normalized)) {
      const withoutPrefix = normalized.slice(prefix.length).replace(ROUTE_EXT, '');
      return normalizeRoute(withoutPrefix);
    }
  }

  return null;
}

function normalizeRoute(value) {
  let route = value
    .replace(/\/index$/i, '')
    .replace(/\(.*?\)\//g, '')
    .replace(/\(.*?\)$/g, '')
    .replace(/\/+/g, '/');

  if (!route || route === 'page') return '/';
  if (!route.startsWith('/')) route = `/${route}`;
  return route;
}

async function scanContent(root, allFiles) {
  const candidates = allFiles.filter((file) => SOURCE_EXT.test(file));
  const haystackParts = [];
  const matchedFiles = [];

  for (const file of candidates.slice(0, 1200)) {
    try {
      const raw = await readText(file);
      if (raw.length > 250_000) continue;
      haystackParts.push(raw.slice(0, 60_000));
      matchedFiles.push(toPosix(path.relative(root, file)));
    } catch {
      // ignore unreadable files
    }
  }

  const haystack = haystackParts.join('\n').toLowerCase();
  const readme = await safeRead(path.join(root, 'README.md'));

  return {
    scannedFiles: matchedFiles.length,
    readmeLength: readme.length,
    keywords: {
      valueProp: hasAny(haystack, ['save time', 'increase revenue', 'automate', 'for teams', 'for developers', 'for founders', 'turn your', 'helps you']),
      pricing: hasAny(haystack, ['pricing', 'price', 'subscribe', 'subscription', 'billing', 'checkout', 'stripe', 'paddle', 'lemon squeezy']),
      auth: hasAny(haystack, ['sign in', 'signin', 'login', 'logout', 'sign up', 'signup', 'clerk', 'nextauth', 'supabase.auth']),
      onboarding: hasAny(haystack, ['onboarding', 'welcome', 'first run', 'getting started', 'complete setup', 'create your first']),
      analytics: hasAny(haystack, ['posthog', 'plausible', 'google analytics', 'gtag', 'mixpanel', 'analytics.track', 'capture(']),
      errorMonitoring: hasAny(haystack, ['sentry', 'rollbar', 'bugsnag', 'error boundary', 'errorboundary', 'captureexception']),
      support: hasAny(haystack, ['support@', 'feedback', 'contact us', 'discord', 'slack community', 'github issue']),
      legal: hasAny(haystack, ['privacy policy', 'terms of service', 'cookie policy', 'data processing']),
      cta: hasAny(haystack, ['get started', 'start free', 'try it now', 'sign up', 'book a demo'])
    }
  };
}

async function safeRead(file) {
  try {
    return await readText(file);
  } catch {
    return '';
  }
}

function hasAny(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

function detectIntegrations(packageJson, allFiles, root) {
  const deps = new Set([
    ...Object.keys(packageJson?.dependencies || {}),
    ...Object.keys(packageJson?.devDependencies || {})
  ]);

  const depHas = (values) => values.some((value) => deps.has(value));

  return {
    stripe: depHas(['stripe', '@stripe/stripe-js']),
    paddle: depHas(['@paddle/paddle-js']),
    lemonSqueezy: depHas(['@lemonsqueezy/lemonsqueezy.js']),
    posthog: depHas(['posthog-js', 'posthog-node']),
    plausible: depHas(['plausible-tracker', 'next-plausible']),
    sentry: depHas(['@sentry/nextjs', '@sentry/node', '@sentry/react']),
    clerk: depHas(['@clerk/nextjs', '@clerk/clerk-react']),
    nextAuth: depHas(['next-auth']),
    supabase: depHas(['@supabase/supabase-js']),
    resend: depHas(['resend']),
    vercel: allFiles.some((file) => path.basename(file) === 'vercel.json')
  };
}
