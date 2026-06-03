import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAgentBrief } from '../src/briefs/generator.js';

function report() {
  return {
    productName: 'Demo Product',
    score: 64,
    threshold: 85,
    blockers: [
      {
        id: 'env-example',
        severity: 'blocker',
        area: 'Deployment',
        title: 'Environment variables are documented',
        recommendation: 'Add .env.example with safe placeholder values.'
      }
    ],
    warnings: []
  };
}

function scan() {
  return {
    framework: 'nextjs'
  };
}

test('brief contains required handoff sections', () => {
  const brief = generateAgentBrief(report(), scan(), {}, 'codex');
  const requiredSections = [
    '## Mission',
    '## Product Context',
    '## Agent Operating Instructions',
    '## Current Findings',
    '## Implementation Scope',
    '## Out of Scope',
    '## Protected Paths',
    '## Acceptance Criteria',
    '## Validation Commands',
    '## Final Response Required From Coding Agent'
  ];

  for (const section of requiredSections) {
    assert.match(brief, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
  }
});

test('brief target guidance matches coding agent conventions', () => {
  assert.match(generateAgentBrief(report(), scan(), {}, 'codex'), /Read `AGENTS\.md`/);
  assert.match(generateAgentBrief(report(), scan(), {}, 'claude'), /Read `CLAUDE\.md`/);

  const generic = generateAgentBrief(report(), scan(), {}, 'generic');
  assert.doesNotMatch(generic, /Read `AGENTS\.md`/);
  assert.doesNotMatch(generic, /Read `CLAUDE\.md`/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
