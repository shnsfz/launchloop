const TARGET_TITLES = {
  codex: 'Codex Agent Brief',
  claude: 'Claude Code Agent Brief',
  cursor: 'Cursor Agent Brief',
  generic: 'Generic Coding Agent Brief'
};

export function generateAgentBrief(report, scan, config = {}, target = 'generic') {
  const normalizedTarget = normalizeTarget(target);
  const title = TARGET_TITLES[normalizedTarget] || TARGET_TITLES.generic;
  const issues = [...report.blockers, ...report.warnings];
  const topIssues = issues.slice(0, 6);
  const protectedPaths = config.protectedPaths || [];
  const validationCommands = config.handoff?.validationCommands || ['npm test', 'npm run build'];

  const lines = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Product: ${report.productName}`);
  lines.push(`Readiness score: ${report.score}/100`);
  lines.push(`Framework: ${scan.framework}`);
  lines.push('');
  lines.push('## Mission');
  lines.push('');
  lines.push(`Improve this project from launch-readiness score ${report.score} to at least ${report.threshold}, without introducing unrelated refactors.`);
  lines.push('');
  lines.push('## Product Context');
  lines.push('');
  lines.push('- This project is being prepared for real external users, not just local demo usage.');
  lines.push('- Prioritize changes that make the product understandable, usable, observable, and monetizable.');
  lines.push('- Keep the implementation small, explicit, and easy to review.');
  lines.push('');

  addTargetSpecificGuidance(lines, normalizedTarget);

  lines.push('## Current Findings');
  lines.push('');
  if (topIssues.length === 0) {
    lines.push('No launch-readiness blockers were detected. Focus on product-signal instrumentation and release notes.');
  } else {
    for (const issue of topIssues) {
      lines.push(`- **${issue.severity.toUpperCase()} / ${issue.area} / ${issue.title}**: ${issue.recommendation}`);
    }
  }
  lines.push('');

  if (report.ai && !report.ai.skipped) {
    lines.push('## AI Review');
    lines.push('');
    lines.push(`Provider: ${report.ai.provider}`);
    lines.push('');
    lines.push(`Model: ${report.ai.model}`);
    lines.push('');
    if (report.ai.summary) {
      lines.push(report.ai.summary);
      lines.push('');
    }
    if (report.ai.risks?.length > 0) {
      lines.push('Risks:');
      lines.push('');
      for (const risk of report.ai.risks) lines.push(`- ${risk}`);
      lines.push('');
    }
    if (report.ai.briefAddendum) {
      lines.push('Agent handoff note:');
      lines.push('');
      lines.push(report.ai.briefAddendum);
      lines.push('');
    }
  }

  lines.push('## Implementation Scope');
  lines.push('');
  lines.push('Allowed changes:');
  lines.push('');
  lines.push('- Add or improve pages related to onboarding, pricing, support, legal basics, or product clarity.');
  lines.push('- Add .env.example or update deployment documentation without real secrets.');
  lines.push('- Add analytics event stubs or integration placeholders if the project already has an analytics provider.');
  lines.push('- Add minimal tests or smoke checks for changed user flows.');
  lines.push('');

  lines.push('## Out of Scope');
  lines.push('');
  lines.push('- Do not redesign the entire product.');
  lines.push('- Do not replace the framework or package manager.');
  lines.push('- Do not add a database, payment provider, or auth vendor unless the existing project already indicates that choice.');
  lines.push('- Do not invent secrets, API keys, credentials, legal claims, or pricing promises.');
  lines.push('');

  lines.push('## Protected Paths');
  lines.push('');
  if (protectedPaths.length > 0) {
    for (const file of protectedPaths) lines.push(`- \`${file}\``);
  } else {
    lines.push('No protected paths configured.');
  }
  lines.push('');

  lines.push('## Acceptance Criteria');
  lines.push('');
  if (topIssues.length === 0) {
    lines.push('- Existing build and test commands pass.');
    lines.push('- A short release note is added under `.launchloop/memory/product.md`.');
  } else {
    for (const issue of topIssues) {
      lines.push(`- ${acceptanceFor(issue)}`);
    }
  }
  lines.push('- Run `launchloop check` after changes and include the new score in the final response.');
  lines.push('');

  lines.push('## Validation Commands');
  lines.push('');
  for (const command of validationCommands) lines.push(`- \`${command}\``);
  lines.push('- `launchloop check`');
  lines.push('');

  lines.push('## Final Response Required From Coding Agent');
  lines.push('');
  lines.push('Return:');
  lines.push('');
  lines.push('1. Files changed.');
  lines.push('2. Launch-readiness issues addressed.');
  lines.push('3. Validation commands run and results.');
  lines.push('4. Remaining risks or manual decisions.');
  lines.push('5. Recommended next product loop.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function normalizeTarget(target) {
  if (target === 'claude-code') return 'claude';
  if (target === 'openai-codex') return 'codex';
  return ['codex', 'claude', 'cursor', 'generic'].includes(target) ? target : 'generic';
}

function addTargetSpecificGuidance(lines, target) {
  lines.push('## Agent Operating Instructions');
  lines.push('');
  if (target === 'codex') {
    lines.push('- Read `AGENTS.md` if present and follow project-specific setup, style, testing, and PR instructions.');
    lines.push('- Keep diffs focused. Prefer small, reviewable commits or patches.');
  } else if (target === 'claude') {
    lines.push('- Read `CLAUDE.md` if present. Treat it as project memory and workflow guidance.');
    lines.push('- Plan before editing, then implement the smallest safe change set.');
  } else if (target === 'cursor') {
    lines.push('- Respect existing project rules and editor instructions.');
    lines.push('- Prefer edits near the relevant product surface instead of broad refactors.');
  } else {
    lines.push('- Inspect the repository before editing.');
    lines.push('- Follow existing style, routing, package manager, and test conventions.');
  }
  lines.push('- Never expose or read real secret values. Use placeholder names only.');
  lines.push('- Ask for human confirmation before making irreversible billing, data deletion, or production deployment changes.');
  lines.push('');
}

function acceptanceFor(issue) {
  const map = {
    'pricing-path': 'A pricing, billing, or paid-plan placeholder path is visible and linked from the public product surface.',
    'env-example': '.env.example or .env.template documents all required variables with safe placeholder values.',
    'secret-hygiene': 'Real .env-style files are excluded from version control and are not read or printed.',
    'product-readme': 'README.md explains the product, target user, setup path, and support channel.',
    'value-proposition': 'The landing page or README states who the product is for, what pain it solves, and the primary CTA.',
    'auth-path': 'A login/signup path exists or the README explains why auth is not required.',
    'onboarding-path': 'A first-run or dashboard path exists and points the user to the first meaningful action.',
    'analytics-events': 'Primary CTA, signup, activation, and paid-conversion events are defined or stubbed.',
    'error-monitoring': 'An error boundary or error-reporting path exists for production issues.',
    'support-channel': 'Users can report bugs or send feedback through a visible channel.',
    'legal-basics': 'Privacy and terms basics are available before collecting user data or payments.',
    'test-script': 'A test script exists or validation commands are documented.',
    'build-script': 'A build script exists and passes locally or in CI.'
  };
  return map[issue.id] || issue.recommendation;
}
