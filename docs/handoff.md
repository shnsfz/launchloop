# LaunchLoop Handoff

## Product Definition

LaunchLoop is an open-source product-loop agent for solo software builders. It combines deterministic launch-readiness checks with model-backed product judgment, generates focused coding-agent briefs, verifies launch routes, and records product-loop memory.

## v0.1 Scope

The first release focuses on launch readiness, not full growth automation.

### Included

- Repo scan
- Launch readiness score
- DeepSeek-backed AI review when `DEEPSEEK_API_KEY` is available
- `--no-ai` static mode for deterministic/offline checks
- Markdown and JSON reports
- Agent brief generation for Codex, Claude Code, Cursor, and generic coding agents
- Basic route verification through HTTP GET checks
- Local `.launchloop/` memory and playbook files

### Excluded

- Cloud dashboard
- Stripe/PostHog/GitHub API sync
- Automated coding-agent invocation
- Automatic PR creation
- Legal document generation with jurisdiction-specific claims
- Production deployment automation

## User Journey

1. Developer runs `launchloop init` inside a software project.
2. LaunchLoop creates `.launchloop/config.json` and product memory files.
3. Developer runs `launchloop check`.
4. LaunchLoop scans routes, package scripts, env hygiene, integrations, and product content.
5. LaunchLoop outputs readiness score and blockers.
6. Developer runs `launchloop brief --target codex` or `launchloop brief --target claude`.
7. Coding agent implements focused fixes.
8. Developer runs `launchloop check` and `launchloop verify` again.
9. LaunchLoop report becomes a release gate before public launch.

## Design Principles

- Do not compete with coding agents. Make coding agents more successful.
- Prefer launch-readiness outcomes over generic documentation generation.
- Never print secret values or use them as scan evidence. AI mode may load only the configured provider key for the provider request.
- Keep v0.1 local-first and zero-runtime-dependency.
- Call the model only when it adds judgment; static facts should stay static.
- Every recommendation must become a small, testable agent brief.
