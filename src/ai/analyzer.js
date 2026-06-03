import { callDeepSeekChat } from './deepseek.js';
import { normalizeAiConfig, shouldRunAi } from './options.js';

export async function analyzeReadinessWithAi(scan, report, config = {}, options = {}) {
  const aiConfig = normalizeAiConfig(config);
  const mode = options.mode || aiConfig.mode;

  if (!shouldRunAi(report, mode)) {
    return skipped(aiConfig, 'static-check-sufficient');
  }

  if (aiConfig.provider !== 'deepseek') {
    return skipped(aiConfig, `unsupported-provider:${aiConfig.provider}`);
  }

  const apiKey = process.env[aiConfig.apiKeyEnv];
  if (!apiKey) {
    if (mode === 'force') {
      throw new Error(`Missing ${aiConfig.apiKeyEnv}. Set it or run with --no-ai.`);
    }
    return skipped(aiConfig, `missing-env:${aiConfig.apiKeyEnv}`);
  }

  const response = await callDeepSeekChat({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    timeoutMs: aiConfig.timeoutMs,
    messages: buildMessages(scan, report, config),
    fetchImpl: options.fetchImpl
  });

  const parsed = parseAiJson(response.content);
  return {
    enabled: true,
    skipped: false,
    provider: aiConfig.provider,
    model: aiConfig.model,
    summary: parsed.summary || '',
    risks: asStringArray(parsed.risks),
    nextActions: asStringArray(parsed.nextActions),
    briefAddendum: parsed.briefAddendum || '',
    usage: response.usage
  };
}

function skipped(aiConfig, reason) {
  return {
    enabled: false,
    skipped: true,
    provider: aiConfig.provider,
    model: aiConfig.model,
    reason
  };
}

function buildMessages(scan, report, config) {
  const payload = {
    productName: report.productName,
    score: report.score,
    threshold: report.threshold,
    status: report.status,
    framework: report.framework,
    blockers: report.blockers.map(issueSummary),
    warnings: report.warnings.map(issueSummary),
    routeGaps: report.routeGaps,
    envGaps: report.envGaps,
    discoveredRoutes: scan.routes.discovered,
    integrations: Object.fromEntries(
      Object.entries(scan.integrations).filter(([, detected]) => detected)
    ),
    packageScripts: scan.packageJson.scripts || {},
    configuredExpectedRoutes: scan.configuredExpectedRoutes || [],
    protectedPaths: config.protectedPaths || []
  };

  return [
    {
      role: 'system',
      content: [
        'You are LaunchLoop, a launch-readiness agent for solo software builders.',
        'Use the static scan facts as evidence. Do not invent secrets, pricing promises, legal claims, or vendor choices.',
        'Return compact JSON only with keys: summary, risks, nextActions, briefAddendum.',
        'Each risks and nextActions item must be a short string.'
      ].join(' ')
    },
    {
      role: 'user',
      content: JSON.stringify(payload, null, 2)
    }
  ];
}

function issueSummary(issue) {
  return {
    id: issue.id,
    title: issue.title,
    area: issue.area,
    severity: issue.severity,
    recommendation: issue.recommendation
  };
}

function parseAiJson(content) {
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {
      summary: content.trim(),
      risks: [],
      nextActions: []
    };
  }
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
}
