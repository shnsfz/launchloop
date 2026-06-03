# LaunchLoop v0.1 Production Standard

LaunchLoop v0.1 is production-ready when it helps a real solo builder make a better launch decision in one local session.

The standard is not "the CLI runs." The standard is that a real user can understand, try, trust, pay for, and benefit from the product being checked.

## User Outcomes

### 1. Understand

The checked product must make its audience, problem, promise, and primary call to action clear enough for a first-time user.

LaunchLoop checks for README/product copy, value proposition signals, and visible calls to action. A missing value proposition is a launch-readiness warning because users cannot adopt a product they cannot quickly understand.

### 2. Try

The checked product must expose a first-use path such as signup, login, onboarding, dashboard, demo, or a documented reason accounts are not required.

LaunchLoop checks route files, product content, and auth/onboarding integrations. A product without a trial or first-value path may build successfully while still being unusable by real users.

### 3. Trust

The checked product must give users and operators enough confidence to use it safely.

LaunchLoop checks env example files, unignored root `.env` files, support channels, legal basics, error monitoring, and validation scripts. Trust also means LaunchLoop itself must not print real secret values or use them as scan evidence.

### 4. Pay

The checked product must have a pricing, billing, paid-boundary, or interest-collection path.

LaunchLoop does not require Stripe or a full billing system for v0.1. It does require the builder to make the revenue boundary explicit enough that users know whether the product is free, paid, waitlisted, or collecting interest.

### 5. Benefit

The checked product must lead users toward an activation path, and the builder must have at least a minimal signal that value was delivered.

LaunchLoop checks onboarding/dashboard paths and analytics-related signals. It favors small, measurable launch loops over broad growth automation.

## v0.1 Acceptance Criteria

- `launchloop check . --no-ai` produces a deterministic score, blockers, warnings, Markdown report, and JSON report.
- `launchloop brief . --target codex` produces a focused agent handoff with goal, non-goals, likely files, acceptance criteria, validation commands, and rollback notes.
- `launchloop check . --ai` works when `DEEPSEEK_API_KEY` is supplied in the process environment.
- Missing AI credentials do not block static mode.
- Real `.env` values are not used as scan evidence or printed.
- AI mode can load the configured provider key from process env, `.env`, or `.env.local` when needed for the provider request.
- `npm run release:local` completes tests, build, package dry-run, real tarball generation, global install, and installed-CLI checks.
- The npm package contains runtime files, docs, examples, and security guidance, but not tests or generated `.launchloop` artifacts.

## Non-Goals for v0.1

- Cloud dashboard
- Automated PR creation
- Stripe/PostHog/GitHub API sync
- Jurisdiction-specific legal document generation
- Production deployment automation

## Dogfood Evidence to Collect Before Public Announcement

Run LaunchLoop on at least three projects before announcing v0.1 as production-ready:

1. Empty or scaffolded project: prove blockers are clear and not noisy.
2. Half-built SaaS: prove the generated brief leads to a small useful repair.
3. Already launched project: prove warnings identify missing trust, revenue, observability, or support gaps.

For each project, record:

- Initial score
- Top blockers
- Generated brief path
- Fixes made
- Final score
- Remaining risks
