import { READINESS_RULES } from './rules.js';

export function evaluateReadiness(scan, config = {}) {
  const results = READINESS_RULES.map((rule) => {
    const passed = Boolean(rule.evaluate(scan, config));
    return {
      id: rule.id,
      title: rule.title,
      area: rule.area,
      weight: rule.weight,
      severity: rule.severity,
      passed,
      score: passed ? rule.weight : 0,
      message: passed ? '' : rule.message,
      recommendation: passed ? '' : rule.recommendation
    };
  });

  const maxScore = results.reduce((sum, r) => sum + r.weight, 0);
  const rawScore = results.reduce((sum, r) => sum + r.score, 0);
  const score = Math.round((rawScore / maxScore) * 100);
  const failed = results.filter((r) => !r.passed);
  const blockers = failed.filter((r) => r.severity === 'blocker');
  const warnings = failed.filter((r) => r.severity === 'warning');

  const routeGaps = (scan.routes.expected || []).filter((route) => !route.found);
  const envGaps = (scan.env.required || []).filter((env) => !env.documented);

  return {
    generatedAt: new Date().toISOString(),
    root: scan.root,
    framework: scan.framework,
    productName: config.productName || 'Unknown Product',
    score,
    threshold: config.readinessThreshold ?? 85,
    status: score >= (config.readinessThreshold ?? 85) && blockers.length === 0 ? 'ready' : 'not-ready',
    maxScore,
    rawScore,
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    blockers,
    warnings,
    routeGaps,
    envGaps,
    results,
    summary: summarize(score, blockers.length, warnings.length)
  };
}

function summarize(score, blockerCount, warningCount) {
  if (score >= 85 && blockerCount === 0) return 'Launch candidate: no blocking issue detected.';
  if (blockerCount > 0) return `Not ready: ${blockerCount} blocker(s) must be fixed before launch.`;
  return `Needs improvement: ${warningCount} warning(s) should be reviewed before launch.`;
}
