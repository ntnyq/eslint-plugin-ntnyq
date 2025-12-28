# AI Coding Agent Guide for eslint-plugin-ntnyq

This repository is an ESLint plugin targeting ESLint v9 (Flat config) with TypeScript AST via `@typescript-eslint/utils`. The goal is to help you implement and maintain rules efficiently with correct build/test workflows and project conventions.

## Architecture

- **Plugin entry**: `src/index.ts` exports `plugin` with `meta` and `rules`. `meta` comes from `src/meta.ts` and reads `name`/`version` from `package.json`.
- **Rules**: Each rule lives in `src/rules/<rule-name>.ts` and is registered in `src/rules/index.ts` using the kebab-case key. Keep the object keys sorted (`@keep-sorted`).
- **Rule helper**: Use `src/utils/createRule.ts`:
  - `createESLintRule()` wraps rule creation, merges option defaults, and injects `meta.docs.url` like `https://eslint-plugin.ntnyq.com/rules/<rule>.html`.
  - Expose `defaultOptions` in both `meta.defaultOptions` and the top-level `defaultOptions` for ESLint.
- **Types & constants**:
  - Type imports are centralized in `src/types.ts` (re-export of `@typescript-eslint/utils`).
  - Common strings and lifecycle selectors are in `src/constants.ts` (`PROGRAM_EXIT`, `SPECIAL_CHAR`).
  - Option resolution uses `src/utils/resolveOptions.ts` for single-object option tuple.
  - Deep merge utility in `src/utils/merge.ts` (used by rule helper).

## Development Workflows

- **Install**: Use pnpm.

```sh
pnpm install
```

- **Lint**: Flat config via `eslint.config.mjs`. Tests disable `vitest/no-standalone-expect` to favor `eslint-vitest-rule-tester`.

```sh
pnpm lint
```

- **Typecheck**:

```sh
pnpm typecheck
```

- **Build**: Outputs ESM to `dist` using `tsdown` with `.mjs` and `.d.mts`.

```sh
pnpm build
pnpm dev    # watch mode
```

- **Test**: Unit tests with Vitest and `eslint-vitest-rule-tester`; integration tests run ESLint across fixtures.

```sh
pnpm test
```

- **Release checks**: Combines lint, typecheck, and tests.

```sh
pnpm run release:check
```

- **Docs**: Static docs in `docs/` powered by Vite. Rule pages correspond to rule names.

```sh
pnpm docs:dev
pnpm docs:build
```

## Rule Implementation Pattern

- **File shape**:
  - Export `RULE_NAME` and types: `MessageIds`, `Options`.
  - `defaultOptions` as the first tuple element type (`Options[0]`).
  - `export default createESLintRule<Options, MessageIds>({...})`.
- **Meta**:
  - Set `meta.type` (e.g., `problem`, `suggestion`, `layout`).
  - Define `meta.docs.description` and `meta.docs.recommended`.
  - Provide `meta.schema` describing options and `meta.messages` for diagnostics.
  - Include `defaultOptions: [defaultOptions]` in both `meta` and top-level.
- **Options**:
  - For single-object options, resolve with `resolveOptions(context.options, defaultOptions)`.
  - For array/object deep defaults, rely on auto-merging in `createRule()`.
- **Fixers**:
  - Use `fixable: 'code'` or `'whitespace'` when safe. Examples:
    - `no-duplicate-exports`: aggregates nodes, then fixes/removes duplicates at `Program:exit` using `fixer.remove` or `fixer.replaceText`.
    - `prefer-newline-after-file-header`: inserts newline(s) after a detected file header block.
- **Aggregation**:
  - Use `PROGRAM_EXIT` from `src/constants.ts` to batch and report once the tree is complete.
- **Utilities**:
  - Use `SPECIAL_CHAR` and `@ntnyq/utils/join` to construct replacement strings consistently.

## Testing Pattern

- **Runner**: `tests/internal.ts` provides `run()` wrapping `eslint-vitest-rule-tester` with the TypeScript parser.
- **Writing cases**:
  - Use `run<Options>({ name, rule, valid: [...], invalid: [...] })`.
  - Prefer `$` (unindent) for multi-line code samples.
  - Validate `errors` and `output` via snapshots or inline expectations.
- **Integration test**: `tests/eslint-plugin.test.ts` runs ESLint against `tests/fixtures/integrations/eslint-plugin/` to ensure plugin wiring.

## Conventions & Gotchas

- **ESM only**: `type: "module"`; imports/exports are ESM. Build artifacts are `.mjs` and `.d.mts`.
- **Rule naming**: File name, `RULE_NAME`, docs page, and registry key must match (kebab-case).
- **Sorted exports**: Respect `@keep-sorted` comments in `src/index.ts` and `src/rules/index.ts`.
- **Flat config**: Consumers expect ESLint v9 + flat config (see README usage). Ensure examples reflect flat config.
- **AST types**: Import node/tokens via `src/types.ts` aliases to keep imports consistent.
- **Snapshots**: Many tests assert snapshots (`__snapshots__/`). Update snapshots intentionally after valid changes.

## Examples

- **Adding a new rule**:
  1. Create `src/rules/my-new-rule.ts` following the `createESLintRule` pattern.
  2. Register it in `src/rules/index.ts` (sorted key).
  3. Add tests under `tests/rules/my-new-rule.test.ts` using `run()`.
  4. Add docs in `docs/rules/my-new-rule.md` and link from `docs/rules/index.md`.
  5. Run `pnpm run release:check`.

- **Aggregating duplicates** (see `no-duplicate-exports`): collect in arrays during traversal, group by keys, then report/fix in `Program:exit`.

## References

- Key files: `src/utils/createRule.ts`, `src/rules/index.ts`, `src/index.ts`, `eslint.config.mjs`, `vitest.config.ts`, `tsdown.config.ts`.
- Docs site: `https://eslint-plugin.ntnyq.com` (URLs injected via rule helper).

If anything here feels incomplete or unclear (e.g., preferred schema patterns, fixer safety guidelines), tell me which areas to expand and I’ll iterate.
