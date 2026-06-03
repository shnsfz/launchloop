# LaunchLoop

LaunchLoop is an open-source product agent for solo software builders.

It scans a software project, checks whether it is ready for real users, generates an agent brief for tools such as Codex or Claude Code, verifies basic launch routes, and records product-loop memory under `.launchloop/`.

## Core Loop

1. Scan the repo and product surface.
2. Detect launch blockers and product gaps.
3. Generate focused briefs for AI coding agents.
4. Verify the implementation before launch.
5. Save reports and product memory for the next loop.

## Quick Start

```bash
node src/cli.js init
node src/cli.js scan
node src/cli.js check
node src/cli.js brief --target codex
node src/cli.js verify --url http://localhost:3000
node src/cli.js report
```

Run against the included example:

```bash
npm run check:example
npm run brief:example
```

## Commands

```text
launchloop init [root] [--product "Product Name"] [--force]
launchloop scan [root] [--json]
launchloop check [root] [--json]
launchloop brief [root] [--target codex|claude|cursor|generic] [--out path]
launchloop verify [root] [--url http://localhost:3000]
launchloop report [root]
```

## What LaunchLoop Checks

- Product clarity
- Onboarding path
- Pricing and billing readiness
- Authentication basics
- Environment variable hygiene
- Deployment readiness
- Analytics events
- Error monitoring
- Support and feedback channels
- Legal basics
- AI-generated code safety
- Build and test scripts

## Philosophy

Build fast, but close the loop.

Shipping is not just merging code. Shipping means a real user can understand, try, trust, pay for, and benefit from your product.
