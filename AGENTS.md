# AGENTS

This repository is an ESM ESLint plugin with a docs workspace.

## Runbook

- Install: `pnpm install`
- Build plugin: `pnpm run build`
- Test rules: `pnpm run test`
- Typecheck: `pnpm run typecheck`
- Lint: `pnpm run lint`
- Format: `pnpm run format` (uses oxfmt)
- Docs dev: `pnpm run docs:dev`
- Docs build: `pnpm run docs:build`
- Release gate: `pnpm run release:check`

## Project Map

- Plugin entry: [src/index.ts](src/index.ts)
- Rule registry: [src/rules/index.ts](src/rules/index.ts)
- Rule implementations: [src/rules](src/rules)
- Rule helpers: [src/utils/createRule.ts](src/utils/createRule.ts), [src/utils/merge.ts](src/utils/merge.ts), [src/utils/resolveOptions.ts](src/utils/resolveOptions.ts)
- Test helpers: [tests/internal.ts](tests/internal.ts)
- Rule tests: [tests/rules](tests/rules)
- Integration fixtures: [tests/fixtures/integrations/eslint-plugin](tests/fixtures/integrations/eslint-plugin)
- User docs: [README.md](README.md), [docs/guide/index.md](docs/guide/index.md), [docs/rules/index.md](docs/rules/index.md)

## Conventions For Changes

- Follow the existing rule shape: export `RULE_NAME`, `Options`, `MessageIds`, and default rule module.
- Register new rules in [src/rules/index.ts](src/rules/index.ts) and plugin exports in [src/index.ts](src/index.ts).
- Use [tests/internal.ts](tests/internal.ts) `run()` helper for rule tests; parser setup is centralized there.
- Keep import/export order stable where `@keep-sorted` markers exist.
- Prefer editing source under [src](src) and regenerate [dist](dist) with build; do not hand-edit generated output.

## Gotchas

- Formatting is oxfmt, not Prettier. Run `pnpm run format` when in doubt.
- Docs is a separate workspace package under [docs](docs); use root scripts or `pnpm -C docs ...`.

## Quick Agent Checklist

1. Run `pnpm run test` and `pnpm run typecheck` before making rule changes.
2. Add or update tests in [tests/rules](tests/rules) for every rule behavior change.
3. Run `pnpm run release:check` before finalizing substantial changes.
4. If rule behavior changes, update docs under [docs/rules](docs/rules).
