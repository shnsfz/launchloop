export function renderCheckReport(report, scan) {
  const lines = [];
  lines.push(`# LaunchLoop Readiness Report`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Product: ${report.productName}`);
  lines.push(`Root: \`${report.root}\``);
  lines.push(`Framework: ${report.framework}`);
  lines.push('');
  lines.push(`## Score`);
  lines.push('');
  lines.push(`**${report.score} / 100**`);
  lines.push('');
  lines.push(`Status: **${report.status}**`);
  lines.push('');
  lines.push(report.summary);
  lines.push('');

  if (report.blockers.length > 0) {
    lines.push('## Blocking Issues');
    lines.push('');
    for (const issue of report.blockers) {
      lines.push(`### ${issue.title}`);
      lines.push('');
      lines.push(`Area: ${issue.area}`);
      lines.push('');
      lines.push(issue.message);
      lines.push('');
      lines.push(`Recommendation: ${issue.recommendation}`);
      lines.push('');
    }
  }

  if (report.warnings.length > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (const issue of report.warnings) {
      lines.push(`- **${issue.title}** (${issue.area}): ${issue.recommendation}`);
    }
    lines.push('');
  }

  if (report.routeGaps.length > 0) {
    lines.push('## Expected Route Gaps');
    lines.push('');
    for (const gap of report.routeGaps) {
      lines.push(`- Missing configured route: \`${gap.route}\``);
    }
    lines.push('');
  }

  if (report.envGaps.length > 0) {
    lines.push('## Required Env Var Gaps');
    lines.push('');
    for (const gap of report.envGaps) {
      lines.push(`- Missing from env example: \`${gap.key}\``);
    }
    lines.push('');
  }

  lines.push('## Detected Routes');
  lines.push('');
  if (scan.routes.discovered.length === 0) {
    lines.push('No route files detected.');
  } else {
    for (const route of scan.routes.discovered) lines.push(`- \`${route}\``);
  }
  lines.push('');

  lines.push('## Detected Integrations');
  lines.push('');
  for (const [name, detected] of Object.entries(scan.integrations)) {
    if (detected) lines.push(`- ${name}`);
  }
  if (!Object.values(scan.integrations).some(Boolean)) lines.push('No known integration detected.');
  lines.push('');

  lines.push('## Rule Results');
  lines.push('');
  lines.push('| Rule | Area | Weight | Result |');
  lines.push('|---|---|---:|---|');
  for (const result of report.results) {
    lines.push(`| ${escapePipe(result.title)} | ${escapePipe(result.area)} | ${result.weight} | ${result.passed ? 'PASS' : 'FAIL'} |`);
  }
  lines.push('');

  lines.push('## Next Loop');
  lines.push('');
  const topIssues = [...report.blockers, ...report.warnings].slice(0, 5);
  if (topIssues.length === 0) {
    lines.push('No immediate launch-readiness task detected. Start collecting product signals from real users.');
  } else {
    topIssues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.recommendation}`);
    });
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderVerifyReport(result) {
  const lines = [];
  lines.push('# LaunchLoop Verify Report');
  lines.push('');
  lines.push(`Generated: ${result.generatedAt}`);
  lines.push(`Base URL: ${result.baseUrl}`);
  lines.push('');
  lines.push('| Route | Status | OK | Note |');
  lines.push('|---|---:|---|---|');
  for (const route of result.routes) {
    lines.push(`| \`${route.route}\` | ${route.status ?? ''} | ${route.ok ? 'PASS' : 'FAIL'} | ${escapePipe(route.note || '')} |`);
  }
  lines.push('');
  lines.push(`Overall: **${result.ok ? 'PASS' : 'FAIL'}**`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function escapePipe(value) {
  return String(value).replace(/\|/g, '\\|');
}
