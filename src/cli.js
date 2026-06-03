#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { initProject, loadConfig, launchloopDir } from './config.js';
import { scanProject } from './scanners/index.js';
import { evaluateReadiness } from './checks/engine.js';
import { generateAgentBrief } from './briefs/generator.js';
import { renderCheckReport, renderVerifyReport } from './reports/markdown.js';
import { verifyRoutes } from './verify/smoke.js';
import { writeJson, writeText, readJson, exists } from './lib/fs.js';

const VERSION = '0.1.0';

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const rest = argv.slice(1);

  try {
    switch (command) {
      case 'init':
        await commandInit(rest);
        break;
      case 'scan':
        await commandScan(rest);
        break;
      case 'check':
        await commandCheck(rest);
        break;
      case 'brief':
        await commandBrief(rest);
        break;
      case 'verify':
        await commandVerify(rest);
        break;
      case 'report':
        await commandReport(rest);
        break;
      case '--version':
      case '-v':
        console.log(VERSION);
        break;
      case '--help':
      case '-h':
      case undefined:
        printHelp();
        break;
      default:
        fail(`Unknown command: ${command}`);
    }
  } catch (error) {
    fail(error.stack || error.message || String(error));
  }
}

async function commandInit(argv) {
  const { root, flags } = parseRootAndFlags(argv);
  const result = await initProject(root, {
    force: Boolean(flags.force),
    productName: stringFlag(flags.product) || stringFlag(flags.name)
  });

  if (result.created) {
    console.log(`LaunchLoop initialized at ${relative(result.path)}`);
  } else {
    console.log(`LaunchLoop already exists at ${relative(result.path)}. Use --force to overwrite config.`);
  }
}

async function commandScan(argv) {
  const { root, flags } = parseRootAndFlags(argv);
  const config = await loadConfig(root);
  const scan = await scanProject(root, config);
  const outPath = path.join(launchloopDir(root), 'reports', 'last-scan.json');
  await writeJson(outPath, scan);

  if (flags.json) {
    console.log(JSON.stringify(scan, null, 2));
    return;
  }

  console.log(`Scan written to ${relative(outPath)}`);
  console.log(`Framework: ${scan.framework}`);
  console.log(`Routes detected: ${scan.routes.discovered.length}`);
  console.log(`Env examples: ${scan.env.examples.length > 0 ? scan.env.examples.join(', ') : 'none'}`);
}

async function commandCheck(argv) {
  const { root, flags } = parseRootAndFlags(argv);
  const { scan, report, markdownPath, jsonPath } = await runCheck(root);

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`Launch readiness: ${report.score}/100 (${report.status})`);
  console.log(report.summary);
  if (report.blockers.length > 0) {
    console.log('\nBlockers:');
    for (const blocker of report.blockers) console.log(`- ${blocker.title}: ${blocker.recommendation}`);
  }
  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of report.warnings.slice(0, 8)) console.log(`- ${warning.title}: ${warning.recommendation}`);
  }
  console.log(`\nReport: ${relative(markdownPath)}`);
  console.log(`JSON: ${relative(jsonPath)}`);
  void scan;
}

async function commandBrief(argv) {
  const { root, flags } = parseRootAndFlags(argv);
  const target = stringFlag(flags.target) || 'generic';
  const config = await loadConfig(root);
  const { scan, report } = await runCheck(root);
  const brief = generateAgentBrief(report, scan, config, target);
  const defaultPath = path.join(launchloopDir(root), 'handoffs', `${target}-brief.md`);
  const outPath = stringFlag(flags.out) ? path.resolve(root, stringFlag(flags.out)) : defaultPath;
  await writeText(outPath, brief);
  console.log(`Agent brief written to ${relative(outPath)}`);
}

async function commandVerify(argv) {
  const { root, flags } = parseRootAndFlags(argv);
  const config = await loadConfig(root);
  const baseUrl = stringFlag(flags.url) || config.appUrl;
  if (!baseUrl) fail('Missing URL. Use --url http://localhost:3000 or set appUrl in .launchloop/config.json.');

  const routes = config.expectedRoutes || ['/'];
  const result = await verifyRoutes(baseUrl, routes);
  const markdown = renderVerifyReport(result);
  const dir = path.join(launchloopDir(root), 'reports');
  const markdownPath = path.join(dir, 'verify.md');
  const jsonPath = path.join(dir, 'verify.json');
  await writeText(markdownPath, markdown);
  await writeJson(jsonPath, result);

  console.log(`Verify: ${result.ok ? 'PASS' : 'FAIL'}`);
  for (const route of result.routes) {
    console.log(`- ${route.ok ? 'PASS' : 'FAIL'} ${route.route} ${route.status ?? ''} ${route.note}`);
  }
  console.log(`Report: ${relative(markdownPath)}`);
}

async function commandReport(argv) {
  const { root } = parseRootAndFlags(argv);
  const reportPath = path.join(launchloopDir(root), 'reports', 'launch-readiness.md');
  if (!(await exists(reportPath))) {
    console.log('No report found. Running launchloop check first.');
    await runCheck(root);
  }
  console.log(`Report: ${relative(reportPath)}`);
}

async function runCheck(root) {
  const config = await loadConfig(root);
  const scan = await scanProject(root, config);
  const report = evaluateReadiness(scan, config);
  const markdown = renderCheckReport(report, scan);
  const dir = path.join(launchloopDir(root), 'reports');
  const scanPath = path.join(dir, 'last-scan.json');
  const markdownPath = path.join(dir, 'launch-readiness.md');
  const jsonPath = path.join(dir, 'launch-readiness.json');
  await writeJson(scanPath, scan);
  await writeJson(jsonPath, report);
  await writeText(markdownPath, markdown);
  return { scan, report, markdownPath, jsonPath };
}

function parseRootAndFlags(argv) {
  const parsed = parseFlags(argv);
  const rootArg = parsed.positionals[0] || '.';
  return {
    root: path.resolve(process.cwd(), rootArg),
    flags: parsed.flags
  };
}

function parseFlags(argv) {
  const flags = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const withoutPrefix = token.slice(2);
    if (withoutPrefix.includes('=')) {
      const [key, ...rest] = withoutPrefix.split('=');
      flags[key] = rest.join('=');
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags[withoutPrefix] = next;
      i += 1;
    } else {
      flags[withoutPrefix] = true;
    }
  }

  return { flags, positionals };
}

function stringFlag(value) {
  return typeof value === 'string' ? value : '';
}

function printHelp() {
  console.log(`LaunchLoop ${VERSION}\n\nUsage:\n  launchloop init [root] [--product "Product Name"] [--force]\n  launchloop scan [root] [--json]\n  launchloop check [root] [--json]\n  launchloop brief [root] [--target codex|claude|cursor|generic] [--out path]\n  launchloop verify [root] [--url http://localhost:3000]\n  launchloop report [root]\n\nExamples:\n  launchloop init . --product "My SaaS"\n  launchloop check .\n  launchloop brief . --target codex\n  launchloop verify . --url http://localhost:3000\n`);
}

function relative(filePath) {
  return path.relative(process.cwd(), filePath) || '.';
}

function fail(message) {
  console.error(`LaunchLoop error: ${message}`);
  process.exit(1);
}

main();
