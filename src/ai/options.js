export const DEFAULT_AI_CONFIG = {
  mode: 'auto',
  provider: 'deepseek',
  model: 'deepseek-v4-flash',
  baseUrl: 'https://api.deepseek.com',
  apiKeyEnv: 'DEEPSEEK_API_KEY',
  timeoutMs: 30000
};

export function normalizeAiConfig(config = {}) {
  return {
    ...DEFAULT_AI_CONFIG,
    ...(config.ai || {})
  };
}

export function decideAiMode(flags = {}, config = {}) {
  if (flags['no-ai']) return 'off';
  if (flags.ai) return 'force';

  const mode = normalizeAiConfig(config).mode;
  return ['auto', 'off', 'force'].includes(mode) ? mode : 'auto';
}

export function shouldRunAi(report, mode = 'auto') {
  if (mode === 'off') return false;
  if (mode === 'force') return true;

  return (
    report.status !== 'ready' ||
    report.blockers.length > 0 ||
    report.warnings.length > 0 ||
    report.routeGaps.length > 0 ||
    report.envGaps.length > 0
  );
}
