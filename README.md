# LaunchLoop

English | [中文](#中文)

## English

LaunchLoop is a launch-readiness gate for AI-built products.

It turns a software repo into one practical decision: can a real user understand it, try it, trust it, pay for it, and benefit from it? If not, LaunchLoop shows the blocking gaps and writes a focused brief for Codex, Claude Code, Cursor, or another coding agent to fix the next smallest launch blocker.

## Core Value

AI coding agents can generate product code quickly. They do not automatically know whether the product is launchable.

LaunchLoop closes that gap by checking the product surface, repo setup, deployment signals, trust basics, revenue path, observability, and validation commands. The output is not a generic checklist; it is a release decision, a blocker list, and an agent-ready repair brief.

## Production Standard

A project is not launch-ready just because code builds. LaunchLoop uses five real-user outcomes as the standard:

1. Understand: a first-time user can tell who the product is for, what pain it solves, and what action to take.
2. Try: a user can reach a signup, onboarding, demo, or first-value path without unclear setup.
3. Trust: the project documents env vars, avoids secret exposure, offers support/legal basics, and has an error-reporting path.
4. Pay: the product has a pricing, billing, paid-boundary, or interest-collection path.
5. Benefit: the user can reach an activation path and the builder can measure whether value was delivered.

See [docs/production-standard.md](docs/production-standard.md) for the v0.1 acceptance standard.

## What LaunchLoop Produces

- Launch readiness score with blockers and warnings.
- Markdown and JSON reports under `.launchloop/reports/`.
- A focused coding-agent brief under `.launchloop/handoffs/`.
- Basic route verification for configured launch routes.
- Local product memory for the next product loop.

## Evidence Model

LaunchLoop separates Static evidence from AI judgment.

- Static evidence comes from files, package scripts, routes, dependencies, env examples, and detected product content.
- AI judgment is optional. It can summarize risks and next actions, but it must not invent secrets, pricing promises, legal claims, or vendor choices.
- Project scanning does not use values from `.env`, `.env.local`, or other real secret files.
- AI mode may load only the configured provider key, such as `DEEPSEEK_API_KEY`, from process env, `.env`, or `.env.local` when the key is missing from the shell environment.

## Quick Start

After the package is published:

```bash
npx launchloop init . --product "My SaaS"
npx launchloop check . --no-ai
npx launchloop brief . --target codex
```

Optional AI review:

```bash
DEEPSEEK_API_KEY=... npx launchloop check . --ai
```

From this source repo:

```bash
node src/cli.js init
node src/cli.js check --no-ai
node src/cli.js brief --target codex
```

Run against the included example:

```bash
npm run check:example
npm run brief:example
```

Local release gate:

```bash
npm run release:local
```

This command runs tests, build, package dry-run, real tarball generation, global install, and installed-CLI checks.

## Commands

```text
launchloop init [root] [--product "Product Name"] [--force]
launchloop scan [root] [--json]
launchloop check [root] [--json] [--ai|--no-ai]
launchloop brief [root] [--target codex|claude|cursor|generic] [--out path] [--ai|--no-ai]
launchloop verify [root] [--url http://localhost:3000]
launchloop report [root]
```

## AI Mode

LaunchLoop combines deterministic scanning with model-backed product judgment.

- Default mode is `auto`: run static checks first, then call the configured model only when the static report has launch-readiness issues.
- Use `--no-ai` when static rules are enough or when you want fully offline output.
- Use `--ai` to force a model-backed review.
- DeepSeek is the default provider. Set `DEEPSEEK_API_KEY` in your shell or a gitignored local `.env` file before using AI mode.

Default AI config:

```json
{
  "ai": {
    "mode": "auto",
    "provider": "deepseek",
    "model": "deepseek-v4-flash",
    "baseUrl": "https://api.deepseek.com",
    "apiKeyEnv": "DEEPSEEK_API_KEY"
  }
}
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

## Security

See [SECURITY.md](SECURITY.md). The short version: keep real secrets in shell environment variables, a local secret manager, or gitignored `.env` files. LaunchLoop documents required env names through examples and does not use secret values as scan evidence.

## Philosophy

Build fast, but close the loop.

Shipping is not just merging code. Shipping means a real user can understand, try, trust, pay for, and benefit from your product.

## 中文

[English](#english) | 中文

LaunchLoop 是一个面向 AI 构建产品的发布就绪闸门。

它把一个软件仓库转化成一个实际判断：真实用户是否能理解、试用、信任、付费，并从产品中获得价值？如果还不能，LaunchLoop 会指出阻塞项，并为 Codex、Claude Code、Cursor 或其他编码智能体生成聚焦的最小修复 brief。

## 核心价值

AI 编码智能体可以很快生成产品代码，但它不会天然知道这个产品是否真的能上线。

LaunchLoop 补上这个缺口：检查产品界面、仓库配置、部署信号、信任基础、收入路径、可观测性和验证命令。输出不是泛泛的 checklist，而是发布判断、阻塞项列表和可交给编码智能体的修复任务。

## 生产标准

代码能构建不等于产品能发布。LaunchLoop 用五个真实用户结果作为标准：

1. 理解：第一次看到产品的人能知道它服务谁、解决什么痛点、下一步该做什么。
2. 试用：用户能进入注册、引导、演示或首次价值路径，而不是卡在不清楚的配置里。
3. 信任：项目说明环境变量，避免 secret 暴露，有支持/法律基础，并具备错误报告路径。
4. 付费：产品有定价、计费、付费边界或意向收集路径。
5. 获益：用户能到达激活路径，开发者也能衡量用户是否获得价值。

v0.1 验收标准见 [docs/production-standard.md](docs/production-standard.md)。

## LaunchLoop 产出什么

- 带阻塞项和警告的发布就绪分数。
- `.launchloop/reports/` 下的 Markdown 和 JSON 报告。
- `.launchloop/handoffs/` 下的编码智能体 brief。
- 对配置的发布路由做基础验证。
- 记录下一轮产品闭环所需的本地产品记忆。

## 证据模型

LaunchLoop 区分 Static evidence 和 AI judgment。

- Static evidence 来自文件、package scripts、路由、依赖、env 示例和检测到的产品内容。
- AI judgment 是可选的。它可以总结风险和下一步，但不能编造 secret、定价承诺、法律声明或供应商选择。
- 项目扫描不会使用 `.env`、`.env.local` 或其他真实 secret 文件里的值。
- AI 模式在 shell 环境变量缺失时，可以只从 `.env` 或 `.env.local` 加载配置的供应商 key，例如 `DEEPSEEK_API_KEY`。

## 快速开始

包发布后：

```bash
npx launchloop init . --product "My SaaS"
npx launchloop check . --no-ai
npx launchloop brief . --target codex
```

可选 AI 评审：

```bash
DEEPSEEK_API_KEY=... npx launchloop check . --ai
```

在当前源码仓库中运行：

```bash
node src/cli.js init
node src/cli.js check --no-ai
node src/cli.js brief --target codex
```

运行内置示例：

```bash
npm run check:example
npm run brief:example
```

本地发布验收：

```bash
npm run release:local
```

这个命令会依次执行测试、构建、发布包 dry-run、真实 tarball 生成、全局安装和已安装 CLI 检查。

## 命令

```text
launchloop init [root] [--product "Product Name"] [--force]
launchloop scan [root] [--json]
launchloop check [root] [--json] [--ai|--no-ai]
launchloop brief [root] [--target codex|claude|cursor|generic] [--out path] [--ai|--no-ai]
launchloop verify [root] [--url http://localhost:3000]
launchloop report [root]
```

## AI 模式

LaunchLoop 会把确定性的静态扫描和大模型产品判断结合起来。

- 默认模式是 `auto`：先执行静态检查，只有当静态报告发现发布就绪问题时，才调用配置的大模型。
- 使用 `--no-ai` 可以只执行静态规则，适合离线场景或静态规则已经足够的情况。
- 使用 `--ai` 可以强制执行大模型评审。
- DeepSeek 是默认模型提供方。使用 AI 模式前，请在 shell 或被 git 忽略的本地 `.env` 文件中设置 `DEEPSEEK_API_KEY`。

默认 AI 配置：

```json
{
  "ai": {
    "mode": "auto",
    "provider": "deepseek",
    "model": "deepseek-v4-flash",
    "baseUrl": "https://api.deepseek.com",
    "apiKeyEnv": "DEEPSEEK_API_KEY"
  }
}
```

## LaunchLoop 检查什么

- 产品清晰度
- 新用户引导路径
- 定价和收费就绪度
- 登录和注册基础能力
- 环境变量安全与说明
- 部署就绪度
- 分析埋点
- 错误监控
- 支持和反馈渠道
- 隐私、条款等法律基础
- AI 生成代码的安全边界
- 构建和测试脚本

## 安全

见 [SECURITY.md](SECURITY.md)。简短原则：真实 secret 只放在 shell 环境变量、本机 secret manager 或被 git 忽略的 `.env` 文件里。LaunchLoop 只通过示例记录必要环境变量名称，不把 secret 值作为扫描证据。

## 理念

快速构建，但必须闭环。

发布不只是合并代码。发布意味着真实用户能够理解、试用、信任、付费，并从你的产品中获得价值。
