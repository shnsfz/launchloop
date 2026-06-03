# Security

LaunchLoop is designed to run locally against product repositories without exposing real secrets.

## Secret Handling

- LaunchLoop does not use `.env`, `.env.local`, `.env.production`, or other real secret values as scan evidence.
- AI mode may load only the configured provider key, such as `DEEPSEEK_API_KEY`, from process env, `.env`, or `.env.local` when it is needed for the provider call.
- Use `.env.example`, `.env.template`, or `.env.local.example` to document required variable names with placeholder values.
- Put real API keys in shell environment variables, a local secret manager, or gitignored `.env` files.
- Do not commit real API keys, tokens, cookies, or credentials.

## AI Review

AI review is optional. When enabled, LaunchLoop sends static scan facts and readiness results to the configured provider. It may use the configured provider API key to authenticate the request, but it must not include secret values in the review payload.

Use `--no-ai` for a fully offline deterministic scan:

```bash
launchloop check . --no-ai
```

Use `--ai` only when you intentionally want model-backed judgment:

```bash
DEEPSEEK_API_KEY=... launchloop check . --ai
```

## Evidence Boundary

- Static evidence comes from files, routes, package scripts, dependencies, env examples, and product content.
- AI judgment is advisory. It must not be treated as proof of legal compliance, pricing correctness, security correctness, or vendor availability.

## Reporting Issues

If LaunchLoop prints a real secret value or includes one in a report or AI review payload, treat it as a security bug. Rotate the exposed credential and report the issue with reproduction steps and the affected file path.
