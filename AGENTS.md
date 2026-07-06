# Repository Guidelines

## Project Structure & Module Organization

Core plugin code lives in `src/`. ESLint rules are in `src/rules/`, shared
helpers in `src/utils/`, and the public plugin entry point is `src/index.ts`.
Tests mirror this layout under `tests/`; rule tests belong in `tests/rules/`,
while reusable test setup lives in `tests/internal.ts`. Rule documentation is
kept in `docs/rules/`, and the VitePress site configuration is under
`docs/.vitepress/`. Static site assets belong in `docs/public/`. Build output is
generated in `dist/` and should not be edited directly.

## Build, Test, and Development Commands

Use pnpm 11 (declared in `package.json`).

- `pnpm install --frozen-lockfile` installs the exact locked dependencies.
- `pnpm dev` rebuilds the plugin in watch mode.
- `pnpm build` creates ESM output and declarations with tsdown.
- `pnpm test` runs the Vitest suite once.
- `pnpm lint` checks the repository with ESLint.
- `pnpm typecheck` runs strict TypeScript checks without emitting files.
- `pnpm format:check` verifies oxfmt formatting; `pnpm format` applies it.
- `pnpm docs:dev` starts the documentation site locally.
- `pnpm run release:check` runs the full pre-release validation suite.

## Coding Style & Naming Conventions

Follow `.editorconfig` and `.oxfmtrc.jsonc`: two-space indentation, LF endings,
single quotes, no semicolons, trailing commas, and an 80-column target. Keep
TypeScript ESM-compatible and preserve strict typing; use `import type` for
type-only imports. Rule files and rule IDs use kebab-case, for example
`no-only-tests.ts` and `RULE_NAME = 'no-only-tests'`. Use camelCase for
functions and variables and PascalCase for types. Export new rules through
`src/rules/index.ts` and add matching documentation.

## Testing Guidelines

Vitest and `eslint-vitest-rule-tester` drive the tests. Name files
`*.test.ts`, mirror the source area, and cover both `valid` and `invalid` rule
cases, including diagnostics and fixer output where applicable. Update
snapshots only when the changed output is intentional. There is no configured
coverage threshold, but every behavior change should include a regression
test. CI tests supported Node.js versions 22, 24, and 26.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style subjects such as
`feat: implement rule no-only-tests`, `docs: ...`, and `chore(deps): ...`. Keep
subjects imperative and narrowly scoped. Pull requests should explain the
behavioral change, link related issues when available, and list validation
performed. Include tests and rule documentation for user-visible rule changes;
attach screenshots only for documentation UI changes. Ensure build, format,
lint, typecheck, and tests pass before requesting review.
