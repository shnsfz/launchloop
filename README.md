# LaunchLoop

English | [中文](#中文)

## English

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
node src/cli.js check --no-ai
DEEPSEEK_API_KEY=... node src/cli.js check --ai
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
- DeepSeek is the default provider. Set `DEEPSEEK_API_KEY` in your shell before using AI mode.

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

LaunchLoop does not read `.env`, `.env.local`, or other real secret files during scans.

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

## 中文

[English](#english) | 中文

LaunchLoop 是一个面向独立开发者和小型软件作者的开源产品闭环智能体。

它会扫描一个软件项目，判断这个项目是否已经具备面向真实用户发布的基础条件，为 Codex、Claude Code 等编码智能体生成任务说明，验证基础发布路由，并把产品闭环记忆记录在 `.launchloop/` 目录下。

## 核心闭环

1. 扫描代码仓库和产品界面。
2. 识别发布阻塞项和产品缺口。
3. 为 AI 编码智能体生成聚焦的修复 brief。
4. 在发布前验证实现结果。
5. 保存报告和产品记忆，进入下一轮闭环。

## 快速开始

```bash
node src/cli.js init
node src/cli.js scan
node src/cli.js check
node src/cli.js check --no-ai
DEEPSEEK_API_KEY=... node src/cli.js check --ai
node src/cli.js brief --target codex
node src/cli.js verify --url http://localhost:3000
node src/cli.js report
```

运行内置示例：

```bash
npm run check:example
npm run brief:example
```

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
- DeepSeek 是默认模型提供方。使用 AI 模式前，请在 shell 中设置 `DEEPSEEK_API_KEY`。

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

LaunchLoop 在扫描过程中不会读取 `.env`、`.env.local` 或其他真实 secret 文件。

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

## 理念

快速构建，但必须闭环。

发布不只是合并代码。发布意味着真实用户能够理解、试用、信任、付费，并从你的产品中获得价值。
