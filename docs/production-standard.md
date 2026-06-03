# LaunchLoop v0.1 Production Standard

LaunchLoop v0.1 is production-ready when it helps a real solo software builder make a better launch decision in one local session.

The standard is not "the CLI runs." The standard is that LaunchLoop can inspect a software repository, separate evidence from guesswork, identify launch blockers, generate a useful repair brief, and help the builder decide whether a real user can understand, try, trust, pay for, and benefit from the checked product.

This document is the production contract for v0.1. It defines what LaunchLoop evaluates, what evidence it may use, what outputs it must produce, what it must not do, and what evidence must exist before v0.1 is publicly announced as production-ready.

## 1. Scope

### 1.1 Product Scope

LaunchLoop v0.1 is a local CLI product for solo software builders and small AI-assisted product teams.

It answers one practical question:

> Is this repository ready enough for a real external user to evaluate, try, trust, pay for, and get value from the product?

LaunchLoop v0.1 is not a deployment platform, cloud dashboard, compliance scanner, legal generator, marketing automation system, or autonomous PR agent.

### 1.2 Checked Product Scope

The checked product is the repository passed to LaunchLoop through commands such as:

```bash
launchloop check .
launchloop brief . --target codex
launchloop verify . --url http://localhost:3000
```

LaunchLoop should work best for web products, micro-SaaS products, AI-built tools, landing-page-driven software products, and early-stage software businesses.

### 1.3 Runtime Scope

LaunchLoop itself is production-ready only when:

- CLI commands behave predictably.
- Static mode works without network access or AI credentials.
- AI mode is optional and bounded.
- Reports are written in stable Markdown and JSON formats.
- Agent briefs are specific enough for Codex, Claude Code, Cursor, or a generic coding agent.
- Real secret values are never used as scan evidence and are never printed.
- The local release gate passes from the packaged CLI, not only from source code.

## 2. Core Principle

A software product is not launch-ready just because it builds.

A launch-ready product gives a real user five outcomes:

1. Understand: the user can tell who the product is for, what problem it solves, what result it promises, and what action to take next.
2. Try: the user can reach a signup, login, onboarding, dashboard, demo, or first-value path.
3. Trust: the user and operator have enough confidence to use the product safely.
4. Pay: the product has an explicit pricing, billing, paid-boundary, waitlist, or interest-collection path.
5. Benefit: the user can reach an activation path, and the builder has at least one signal that value was delivered.

LaunchLoop should favor small, measurable launch loops over broad growth automation.

## 3. Key Terms

| Term | Meaning |
|---|---|
| Checked product | The repository being scanned or verified by LaunchLoop. |
| Static evidence | Evidence detected from repository files, package scripts, routes, dependencies, env examples, configuration, and product copy. |
| AI judgment | Optional model-backed review that can summarize risks and next actions, but must not change deterministic facts or invent missing evidence. |
| Blocker | A missing or unsafe condition that prevents a launch-ready decision. |
| Warning | A meaningful launch-readiness gap that should be reviewed but does not always block v0.1 readiness by itself. |
| Ready | Score is at or above the configured threshold and there are no blockers. |
| Not ready | Score is below the configured threshold or at least one blocker exists. |
| Repair brief | A focused handoff for a coding agent to fix the next smallest launch blocker or high-value warning. |
| Product loop | A short cycle: inspect, decide, repair, validate, record signal, repeat. |

## 4. Evidence Model

LaunchLoop v0.1 must separate deterministic evidence from AI judgment.

### 4.1 Allowed Static Evidence

LaunchLoop may use:

- Repository file existence.
- `package.json` scripts and dependencies.
- Detected framework and route files.
- Product copy in source, Markdown, MDX, JSON, and common frontend files.
- `.env.example`, `.env.template`, and `.env.local.example` key names.
- Configured expected routes.
- Configured required environment variable names.
- Configured protected paths.
- Known integration package names.
- Local smoke verification results.

### 4.2 Disallowed Evidence

LaunchLoop must not use the following as positive scan evidence:

- Real secret values from `.env`, `.env.local`, `.env.production`, or equivalent files.
- Generated `.launchloop` reports, handoffs, memory, or playbooks.
- Model-invented claims.
- Pricing claims not visible in the repository or configuration.
- Legal claims not visible in the repository.
- Undocumented assumptions about a vendor, customer, jurisdiction, or deployment environment.

### 4.3 Conservative Evidence Rule

If LaunchLoop cannot find evidence, it must treat the condition as missing.

For v0.1, missing evidence may become either a blocker or a warning depending on severity. LaunchLoop must not silently assume that a product has pricing, onboarding, support, legal basics, observability, or safe environment handling.

### 4.4 AI Evidence Boundary

AI mode may:

- Summarize static findings.
- Explain risks.
- Suggest next actions.
- Add a brief addendum for the coding agent.

AI mode must not:

- Change the deterministic score.
- Turn missing evidence into passing evidence.
- Invent secrets, legal claims, pricing promises, vendor choices, customer claims, or compliance status.
- Recommend irreversible production actions without human confirmation.

## 5. Decision Model

### 5.1 Score

LaunchLoop v0.1 uses a 100-point readiness score.

Each rule has:

- Rule id.
- Title.
- Area.
- Severity.
- Weight.
- Pass/fail result.
- Recommendation.

The score is:

```text
score = round(passed_weight / total_weight * 100)
```

### 5.2 Default Threshold

The default readiness threshold is:

```text
85 / 100
```

A project is ready only when:

```text
score >= readinessThreshold
AND blocker count == 0
```

Otherwise it is `not-ready`.

### 5.3 Route and Env Gaps

Configured expected route gaps and required env var documentation gaps must be surfaced in reports.

For v0.1, these gaps must at minimum appear in:

- JSON report.
- Markdown report.
- AI review payload when AI is enabled.
- Generated repair brief when relevant.

If a configured required env var is missing from env examples and is necessary for launch, it should be promoted to a blocker in a later rule update.

### 5.4 Status Labels

LaunchLoop v0.1 uses two public status labels only:

| Status | Meaning |
|---|---|
| `ready` | Score is at or above threshold and no blocker exists. |
| `not-ready` | Score is below threshold or at least one blocker exists. |

Do not add ambiguous public labels such as `almost-ready`, `maybe`, or `ship-it` in v0.1.

## 6. Outcome Standard for Checked Products

### 6.1 Understand

The checked product should make its audience, problem, promise, and primary call to action clear enough for a first-time user.

Minimum evidence may include:

- README product description.
- Landing page copy.
- Route content.
- CTA copy.
- Product positioning in local product memory.

A product passes the Understand outcome when LaunchLoop can detect enough evidence that a user can answer:

- Who is this for?
- What pain does it solve?
- What result does it promise?
- What should I do next?

Typical warning signals:

- No README.
- Vague product description.
- No detectable CTA.
- No clear target user.
- No clear first action.

The minimum repair should be small:

- Add or improve README.
- Add a landing page value proposition.
- Add a visible CTA.
- Clarify target user and promised outcome.

### 6.2 Try

The checked product should expose a first-use path.

Acceptable first-use paths include:

- Signup.
- Login.
- Onboarding.
- Dashboard.
- Demo.
- Playground.
- CLI quick start.
- Documented no-account usage path.

A product passes the Try outcome when a real user can reach the first meaningful product experience without unclear setup.

Typical warning signals:

- No signup/login route.
- No dashboard or onboarding route.
- No demo path.
- No documented reason that accounts are unnecessary.
- Expected routes are configured but not detected.

The minimum repair should be small:

- Add or document a first-use path.
- Add a route link from the public surface.
- Document why the product does not require accounts.
- Add a smoke-verifiable expected route.

### 6.3 Trust

The checked product should give users and operators enough confidence to use it safely.

Trust includes:

- Environment variable documentation.
- Secret hygiene.
- Support or feedback channel.
- Legal basics before collecting user data or payment data.
- Error monitoring or error-reporting path.
- Build and test validation commands.
- Deployment notes or deployment configuration.

A product fails Trust with a blocker when:

- Required production environment variables are undocumented.
- Real root `.env`-style files appear unignored.
- LaunchLoop would need real secret values to prove readiness.

Typical warning signals:

- No support channel.
- No privacy or terms basics.
- No error monitoring.
- No build command.
- No test command.
- No deployment path or deployment notes.

The minimum repair should be small:

- Add `.env.example` with placeholder values only.
- Ignore real `.env` files.
- Add support or feedback channel.
- Add privacy and terms basics where user data, analytics, accounts, or payment are involved.
- Add test/build scripts or document validation commands.
- Add deployment notes or a deployment config.

### 6.4 Pay

The checked product should make the revenue boundary explicit.

For v0.1, LaunchLoop does not require Stripe, Paddle, Lemon Squeezy, or a complete billing system.

Acceptable v0.1 evidence includes:

- `/pricing` route.
- Pricing copy.
- Paid plan boundary.
- Billing dependency.
- Checkout route.
- Waitlist.
- Interest collection form.
- Explicit statement that the current product is free and how monetization will be evaluated.

A product fails Pay with a blocker when no pricing, billing, paid-boundary, free/waitlist, or interest-collection path is visible.

The minimum repair should be small:

- Add a `/pricing` page.
- Add a paid-boundary note.
- Add waitlist or interest collection.
- Document that the current version is intentionally free.

LaunchLoop must not invent pricing.

### 6.5 Benefit

The checked product should lead users to an activation path and help the builder know whether value was delivered.

Minimum evidence may include:

- Onboarding route.
- Dashboard route.
- First-value page.
- Activation event.
- Analytics event definition.
- Local product memory documenting activation, retention, or revenue events.

A product passes the Benefit outcome when it can answer:

- What is the first unit of value?
- Where does the user reach it?
- How can the builder tell whether it happened?

Typical warning signals:

- No onboarding/dashboard path.
- No activation event.
- No analytics signal.
- No next product loop recorded.

The minimum repair should be small:

- Add first-run guidance.
- Define activation event.
- Stub analytics events.
- Record next loop in product memory.

## 7. v0.1 Readiness Rule Matrix

LaunchLoop v0.1 keeps the total score at 100 points.

| Rule ID | Area | Severity | Weight | Passing Evidence |
|---|---|---|---:|---|
| `product-readme` | Product Clarity | Warning | 8 | `README.md` exists. |
| `value-proposition` | Product Clarity | Warning | 8 | Value proposition or CTA is detectable. |
| `pricing-path` | Revenue Readiness | Blocker | 10 | Pricing route, pricing copy, billing path, paid boundary, or interest path exists. |
| `auth-path` | User Access | Warning | 8 | Login/signup/auth path exists, or no-account usage is documented. |
| `onboarding-path` | Activation | Warning | 7 | Onboarding, dashboard, first-run, or first-value path exists. |
| `env-example` | Deployment | Blocker | 10 | `.env.example`, `.env.template`, or equivalent safe env example exists. |
| `deployment-config` | Deployment | Warning | 7 | Build script, deployment config, Dockerfile, or deployment notes exist. |
| `analytics-events` | Observability | Warning | 8 | Analytics integration, event definitions, or tracking stubs exist. |
| `error-monitoring` | Observability | Warning | 6 | Error boundary, Sentry-like integration, or error reporting path exists. |
| `support-channel` | Support | Warning | 6 | Support email, feedback link, issue template, community link, or in-app feedback exists. |
| `legal-basics` | Trust | Warning | 6 | Privacy and/or terms basics exist where needed. |
| `secret-hygiene` | AI Coding Safety | Blocker | 8 | Real root `.env`-style files are ignored and are not used as evidence. |
| `test-script` | Validation | Warning | 4 | Test script or documented validation command exists. |
| `build-script` | Validation | Warning | 4 | Build script or documented build validation exists. |

Rule changes must preserve:

- Stable rule ids unless a breaking change is explicitly documented.
- Total score of 100 unless a migration note is added.
- Explicit severity for every rule.
- Actionable recommendation for every failed rule.

## 8. CLI Behavior Standard

LaunchLoop v0.1 must expose these commands:

```text
launchloop init [root] [--product "Product Name"] [--force]
launchloop scan [root] [--json]
launchloop check [root] [--json] [--ai|--no-ai]
launchloop brief [root] [--target codex|claude|cursor|generic] [--out path] [--ai|--no-ai]
launchloop verify [root] [--url http://localhost:3000]
launchloop report [root]
launchloop --version
launchloop --help
```

### 8.1 `init`

`launchloop init` must create:

```text
.launchloop/config.json
.launchloop/reports/
.launchloop/handoffs/
.launchloop/memory/
.launchloop/playbooks/
```

It must not overwrite existing config unless `--force` is supplied.

### 8.2 `scan`

`launchloop scan` must:

- Inspect the repository.
- Write `.launchloop/reports/last-scan.json`.
- Print framework, route count, and env example status in non-JSON mode.
- Print full JSON when `--json` is supplied.

### 8.3 `check`

`launchloop check` must:

- Run static scan.
- Evaluate readiness rules.
- Optionally run AI review depending on AI mode.
- Write `.launchloop/reports/launch-readiness.md`.
- Write `.launchloop/reports/launch-readiness.json`.
- Write `.launchloop/reports/last-scan.json`.
- Print score, status, summary, blockers, warnings, AI status, and report paths in non-JSON mode.
- Print valid JSON only when `--json` is supplied.

### 8.4 `brief`

`launchloop brief` must:

- Run a fresh readiness check.
- Generate a focused coding-agent handoff.
- Support `codex`, `claude`, `cursor`, and `generic` targets.
- Write `.launchloop/handoffs/{target}-brief.md` by default.
- Support `--out path`.
- Avoid broad refactor instructions.
- Prioritize the next smallest useful repair.

### 8.5 `verify`

`launchloop verify` must:

- Use configured `appUrl` or `--url`.
- Check configured expected routes or `/` by default.
- Perform basic HTTP GET smoke checks.
- Treat 2xx and 3xx responses as reachable.
- Write `.launchloop/reports/verify.md`.
- Write `.launchloop/reports/verify.json`.

### 8.6 `report`

`launchloop report` must:

- Print the latest readiness report path.
- Run `check` first if no report exists.

## 9. JSON Report Contract

`launchloop check --json` must return valid JSON.

The report should include:

```json
{
  "generatedAt": "ISO-8601 timestamp",
  "root": "absolute repository path",
  "framework": "detected framework",
  "productName": "configured product name",
  "score": 0,
  "threshold": 85,
  "status": "ready or not-ready",
  "maxScore": 100,
  "rawScore": 0,
  "passed": 0,
  "total": 0,
  "blockers": [],
  "warnings": [],
  "routeGaps": [],
  "envGaps": [],
  "results": [],
  "summary": "",
  "ai": {}
}
```

Each rule result must include:

```json
{
  "id": "rule-id",
  "title": "Human readable title",
  "area": "Area",
  "weight": 0,
  "severity": "blocker or warning",
  "passed": true,
  "score": 0,
  "message": "",
  "recommendation": ""
}
```

The JSON output must be machine-readable by coding agents and release scripts.

## 10. Markdown Report Contract

The Markdown readiness report must include:

- Title.
- Generated timestamp.
- Product name.
- Repository root.
- Detected framework.
- Score.
- Status.
- Summary.
- AI review section when AI was attempted or skipped.
- Blocking issues.
- Warnings.
- Expected route gaps.
- Required env var gaps.
- Detected routes.
- Detected integrations.
- Rule results table.
- Next loop recommendations.

The report should be readable by a solo builder and usable as evidence for the next repair brief.

## 11. Agent Brief Standard

Every generated coding-agent brief must include:

1. Mission.
2. Product context.
3. Agent operating instructions.
4. Current findings.
5. Implementation scope.
6. Out of scope.
7. Protected paths.
8. Acceptance criteria.
9. Validation commands.
10. Final response required from the coding agent.

### 11.1 Brief Mission

The mission must ask the coding agent to improve launch readiness to at least the configured threshold without unrelated refactors.

### 11.2 Current Findings

The brief must include the top blockers and warnings, ordered by launch impact.

### 11.3 Scope Control

Allowed changes may include:

- Product clarity pages.
- Onboarding pages.
- Pricing or paid-boundary pages.
- Support or feedback channels.
- Legal basics.
- Env examples with placeholders only.
- Analytics event stubs.
- Error monitoring stubs.
- Minimal tests or smoke checks.

Out-of-scope changes must include:

- Full redesigns.
- Framework replacement.
- Package manager replacement.
- New auth, database, billing, or analytics vendor without existing evidence.
- Invented API keys, secrets, pricing, legal claims, or customer claims.
- Irreversible billing, data deletion, or production deployment without human confirmation.

### 11.4 Target-Specific Behavior

For Codex-targeted briefs:

- Instruct the agent to read `AGENTS.md` if present.
- Prefer small, reviewable diffs.

For Claude Code-targeted briefs:

- Instruct the agent to read `CLAUDE.md` if present.
- Plan before editing.
- Implement the smallest safe change set.

For Cursor-targeted briefs:

- Respect editor/project rules.
- Prefer local edits near relevant product surfaces.

For generic briefs:

- Inspect the repository before editing.
- Follow existing style, routing, package manager, and test conventions.

## 12. Configuration Standard

Default config must include:

```json
{
  "schemaVersion": 1,
  "productName": "My Product",
  "appUrl": "http://localhost:3000",
  "expectedRoutes": ["/", "/pricing", "/signup", "/login", "/dashboard"],
  "primaryCtaText": ["Get started", "Start free", "Sign up", "Try it now"],
  "requiredEnvVars": [],
  "protectedPaths": [
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    ".env",
    ".env.local"
  ],
  "readinessThreshold": 85,
  "ai": {
    "mode": "auto",
    "provider": "deepseek",
    "model": "deepseek-v4-flash",
    "baseUrl": "https://api.deepseek.com",
    "apiKeyEnv": "DEEPSEEK_API_KEY",
    "timeoutMs": 30000
  },
  "handoff": {
    "defaultTarget": "generic",
    "validationCommands": ["npm test", "npm run build"]
  }
}
```

Config loading must merge user overrides with defaults.

Config must not require AI credentials for static mode.

## 13. AI Mode Standard

LaunchLoop v0.1 supports three AI modes:

| Mode | Meaning |
|---|---|
| `off` | Do not call a model. |
| `auto` | Run static checks first, then call AI only when issues exist. |
| `force` | Force model-backed review. |

CLI flags must map as follows:

| Flag | Mode |
|---|---|
| `--no-ai` | `off` |
| `--ai` | `force` |
| no flag | Configured mode, default `auto` |

### 13.1 Missing Credential Behavior

Missing AI credentials must not block static mode.

In `auto` mode, missing credentials should produce a skipped AI review status.

In `force` mode, missing credentials may fail with a clear error that tells the user how to set the provider key or run with `--no-ai`.

### 13.2 Provider Key Loading

LaunchLoop may load only the configured AI provider key from:

- Process environment.
- `.env`.
- `.env.local`.

This exception is allowed only for making the provider request.

The provider key value must not be printed, stored in reports, sent as scan evidence, or included in agent briefs.

### 13.3 AI Output Format

AI review should return compact structured output with:

```json
{
  "summary": "",
  "risks": [],
  "nextActions": [],
  "briefAddendum": ""
}
```

If model output is not valid JSON, LaunchLoop may fall back to a plain summary, but it must not treat unstructured AI text as deterministic evidence.

## 14. Security Standard

LaunchLoop v0.1 must be safe to run on a local product repository.

### 14.1 Secret Handling

LaunchLoop must not:

- Print real secret values.
- Use real secret values as positive evidence.
- Include real secret values in reports.
- Include real secret values in agent briefs.
- Ask coding agents to inspect or expose secrets.

LaunchLoop must:

- Encourage `.env.example` or `.env.template` with placeholder values only.
- Detect root `.env`-style files that are not ignored.
- Treat unignored root secret files as a blocker.
- Keep `.env` and `.env.local` in protected paths by default.

### 14.2 Generated Artifact Isolation

LaunchLoop must ignore generated `.launchloop` artifacts during product content scanning so that previous reports or briefs do not create false positives.

### 14.3 Human Confirmation Boundary

Generated briefs must require human confirmation before:

- Irreversible billing changes.
- Production deployment.
- Data deletion.
- Credential rotation.
- Legal commitment.
- Customer communication that could create commercial obligations.

### 14.4 Legal Boundary

LaunchLoop may detect whether legal basics exist.

LaunchLoop must not generate jurisdiction-specific legal documents as a v0.1 production claim.

## 15. Package and Release Standard

LaunchLoop v0.1 must pass the local release gate before being announced as production-ready.

The local release gate must verify:

```bash
npm test
npm run build
npm pack --dry-run
npm pack --pack-destination <temp-dir> --silent
npm install -g <generated-tarball>
launchloop --version
launchloop check examples/nextjs-saas --no-ai --json
launchloop brief examples/nextjs-saas --target codex
launchloop check . --no-ai --json
```

The gate passes only when:

- All commands exit successfully.
- Packaged CLI can run after global install.
- Example project returns `ready`.
- LaunchLoop self-check returns `ready`.
- Generated JSON is valid.
- No tests or generated `.launchloop` artifacts are included in the npm package unless explicitly intended.

The npm package should include runtime files, docs, examples, and security guidance.

## 16. Test Standard

v0.1 must include automated tests covering at least:

- Empty or scaffolded project is `not-ready`.
- Launch-basic project can become `ready`.
- Scoring threshold and blocker behavior.
- Next.js App Router route detection.
- `.launchloop` artifacts do not create false positives.
- Ignored root `.env` is allowed.
- Unignored root `.env` is flagged.
- Generated brief includes required handoff sections.
- Codex brief references `AGENTS.md`.
- Claude Code brief references `CLAUDE.md`.
- Static mode works without AI credentials.
- `--ai` missing credential error is clear.
- Markdown report renders core sections.
- JSON report is parseable and stable enough for release scripts.

## 17. Dogfood Standard Before Public Announcement

Before publicly announcing v0.1 as production-ready, run LaunchLoop on at least five repositories or test fixtures:

1. Empty or scaffolded project: prove blockers are clear, useful, and not noisy.
2. Half-built SaaS: prove the generated brief leads to a small useful repair.
3. Already launched product: prove warnings identify missing trust, revenue, observability, support, or activation gaps.
4. LaunchLoop itself: prove the tool can evaluate its own launch readiness.
5. Secret-risk fixture: prove real `.env` files are not printed, not used as evidence, and are flagged when unignored.

For each run, record:

- Repository or fixture name.
- Product type.
- Initial score.
- Initial status.
- Top blockers.
- Top warnings.
- Generated report path.
- Generated brief path.
- Whether AI was off, auto, or forced.
- Fixes made.
- Validation commands run.
- Final score.
- Final status.
- False positives observed.
- False negatives observed.
- Remaining risks.
- Next product loop.

Public announcement requires:

- Local release gate passed.
- All five dogfood runs recorded.
- At least one half-built SaaS repair completed using generated brief.
- No known secret exposure issue.
- README quick start works from the packaged CLI.
- `SECURITY.md` exists and matches the secret-handling standard.
- `production-standard.md` matches actual CLI behavior.

## 18. Non-Goals for v0.1

LaunchLoop v0.1 does not include:

- Cloud dashboard.
- Hosted account system.
- Automated PR creation.
- Stripe API sync.
- PostHog API sync.
- GitHub API sync.
- Production deployment automation.
- Jurisdiction-specific legal document generation.
- Full compliance certification.
- Uptime monitoring.
- Team workflow management.
- Autonomous code modification.

These may be considered for future versions only after v0.1 proves the local product loop.

## 19. v0.2 Candidate Improvements

Potential future improvements:

- Explicit rule schema versioning.
- Configurable rule severity.
- Custom rule packs.
- Richer framework support.
- Stronger no-account product detection.
- First-class activation event config.
- GitHub issue or PR handoff.
- Hosted dashboard.
- Historical score trend.
- External analytics integration.
- Deployment provider integration.
- Stronger supply-chain checks.
- Support for non-JavaScript repositories.

Future improvements must not weaken the v0.1 principle:

> LaunchLoop should help a real builder make a better launch decision from evidence, not from wishful thinking.

## 20. Production-Ready Definition of Done

LaunchLoop v0.1 is production-ready when all of the following are true:

- `launchloop check . --no-ai` produces deterministic Markdown and JSON reports.
- `launchloop brief . --target codex` produces a focused repair handoff.
- `launchloop check . --ai` works when the configured provider key is available.
- Missing AI credentials do not block static mode.
- Real `.env` values are not printed, stored, or used as scan evidence.
- Generated `.launchloop` artifacts do not affect scan results.
- Readiness status is based on score threshold and blocker count.
- Reports expose blockers, warnings, route gaps, env gaps, rule results, and next loop recommendations.
- Briefs include scope, non-goals, protected paths, acceptance criteria, validation commands, and final response requirements.
- `launchloop verify` can smoke-check expected routes.
- `npm run release:local` passes.
- The packaged CLI works after global install.
- The npm package contains runtime files, docs, examples, and security guidance.
- Dogfood evidence exists for empty, half-built, launched, self-check, and secret-risk projects.
- Remaining risks are documented before public announcement.
