import test from 'node:test';
import assert from 'node:assert/strict';
import { callDeepSeekChat } from '../src/ai/deepseek.js';
import { decideAiMode, normalizeAiConfig, shouldRunAi } from '../src/ai/options.js';

function report(overrides = {}) {
  return {
    status: 'not-ready',
    blockers: [],
    warnings: [],
    routeGaps: [],
    envGaps: [],
    ...overrides
  };
}

test('decideAiMode lets --no-ai override config and --ai force a call', () => {
  assert.equal(decideAiMode({ 'no-ai': true }, { ai: { mode: 'auto' } }), 'off');
  assert.equal(decideAiMode({ ai: true }, { ai: { mode: 'off' } }), 'force');
  assert.equal(decideAiMode({}, { ai: { mode: 'off' } }), 'off');
  assert.equal(decideAiMode({}, { ai: { mode: 'auto' } }), 'auto');
});

test('auto mode calls AI only when static readiness has issues', () => {
  assert.equal(shouldRunAi(report({ status: 'ready' }), 'auto'), false);
  assert.equal(shouldRunAi(report({ blockers: [{ id: 'pricing-path' }] }), 'auto'), true);
  assert.equal(shouldRunAi(report({ warnings: [{ id: 'support-channel' }] }), 'auto'), true);
  assert.equal(shouldRunAi(report({ routeGaps: [{ route: '/pricing' }] }), 'auto'), true);
  assert.equal(shouldRunAi(report({ status: 'ready' }), 'force'), true);
  assert.equal(shouldRunAi(report({ blockers: [{ id: 'pricing-path' }] }), 'off'), false);
});

test('normalizeAiConfig defaults to DeepSeek without exposing secrets', () => {
  const config = normalizeAiConfig({});

  assert.equal(config.provider, 'deepseek');
  assert.equal(config.model, 'deepseek-v4-flash');
  assert.equal(config.baseUrl, 'https://api.deepseek.com');
  assert.equal(config.apiKeyEnv, 'DEEPSEEK_API_KEY');
});

test('callDeepSeekChat sends OpenAI-compatible chat completion request', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"summary":"AI review","risks":[],"nextActions":[]}'
            }
          }
        ],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 8,
          total_tokens: 20
        }
      })
    };
  };

  const result = await callDeepSeekChat({
    apiKey: 'test-key',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-flash',
    messages: [{ role: 'user', content: 'Return JSON.' }],
    fetchImpl
  });

  assert.equal(result.content, '{"summary":"AI review","risks":[],"nextActions":[]}');
  assert.equal(result.usage.total_tokens, 20);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.deepseek.com/chat/completions');
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-key');

  const body = JSON.parse(requests[0].options.body);
  assert.equal(body.model, 'deepseek-v4-flash');
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.deepEqual(body.thinking, { type: 'disabled' });
});
