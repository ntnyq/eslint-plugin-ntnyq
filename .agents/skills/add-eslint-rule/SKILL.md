---
name: add-eslint-rule
description: Add ESLint rules to eslint-plugin-ntnyq following this repository's implementation, registration, testing, and documentation conventions. Use when adding a rule or completing the delivery of a new rule in this repository.
---

# Add an ESLint Rule

Work from the repository root. Read the applicable `AGENTS.md`, then inspect the
current implementation. Treat the source as authoritative if interfaces or
structure have changed since this skill was written.

## 1. Define behavior and choose a reference

Establish the rule ID, supported syntax, defaults, options, diagnostic locations,
and boundaries for automatic fixes and suggestions. Read the closest rule,
matching tests, and rule documentation together:

| Scenario                        | Reference in `src/rules/`              | Focus                                                                              |
| ------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Configurable call checks        | `no-only-tests.ts`                     | Object options, static member access, optional calls, opt-in fixes                 |
| Bindings and Vue script regions | `no-restricted-bindings.ts`            | Scope manager, runtime versus type bindings, parser services, report-only behavior |
| Statement spacing               | `padding-line-between-statements.ts`   | Variadic options, schema definitions, comments, line endings                       |
| Return annotations              | `no-explicit-void-return-type.ts`      | No options, code paths, automatic fixes versus suggestions                         |
| Object formatting               | `return-object-multiline.ts`           | Parentheses, TypeScript wrappers, indentation, safe whitespace fixes               |
| Complex semantic changes        | `prefer-object-method-syntax/index.ts` | Rule-private helpers, lexical bindings, fix limitations                            |

This is a general JavaScript/TypeScript plugin. Vue support is rule-specific;
do not assume every rule targets SFCs or `<script setup>`. The plugin exports
`meta` and `rules` and does not provide built-in `configs`.

## 2. Files and registration

Use the actual kebab-case rule ID in place of `example-rule`:

| Action   | File                               | Convention                                                                                                   |
| -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Add      | `src/rules/example-rule.ts`        | Default-export `createESLintRule<Options, MessageIds>(...)`; export `RULE_NAME`, `Options`, and `MessageIds` |
| Add      | `tests/rules/example-rule.test.ts` | Use `runRuleTests` from `tests/helpers/ruleTester.ts`                                                        |
| Add      | `docs/rules/example-rule.md`       | English rule page with scope, examples, options, fix boundaries, and implementation links                    |
| Update   | `src/rules/index.ts`               | Import the default rule with a camelCase name and add `'example-rule': exampleRule` in alphabetical order    |
| Generate | `README.md`, `docs/rules/index.md` | Run `pnpm docs:generate` after registration and metadata are ready                                           |

For complex rules, use `src/rules/example-rule/index.ts` with private camelCase
helper modules beside it, following `prefer-object-method-syntax/`. Keep the test
and documentation filenames unchanged. Put reusable helpers in `src/utils/` only
when they have a shared purpose, and maintain `src/utils/index.ts` as appropriate.

`src/index.ts` already re-exports `src/rules/index.ts`; adding a rule does not
require a new top-level export or a separate `src/types/` tree. Rule option and
message types stay in the rule module. Do not expose them through the public
entry point unless a public API change is requested.

The sidebar in `docs/.vitepress/config/theme.ts` derives its rule list from
`rules`. No manual sidebar or guide enumeration is required. The generated tables
come from `scripts/updateRuleDocs.ts`, which also checks that every registered
rule has a matching test and documentation page. Do not edit table contents by
hand or modify their `<!-- rules:start -->` / `<!-- rules:end -->` markers.

Update these only when the rule needs them:

- `docs/.vitepress/config/eslint.ts`: Enable the rule for rendered documentation
  diagnostics, with meaningful defaults or explicit options. Check interactions
  with the other enabled rules; configuration-only rules need deliberate setup.
- `tests/docs.test.ts`: Add diagnostic assertions for examples whose rendered
  results need regression coverage. Existing coverage is specific to the padding
  rule, not a generic validator for every rule page.
- `tests/compatibility.test.ts`: Exercise default-parser behavior and relevant
  defaults, schema, or fixer behavior against both supported ESLint versions.
- `tests/eslint-plugin.test.ts` and `tests/fixtures/integrations/eslint-plugin/`:
  Extend fixtures when end-to-end plugin loading or configuration needs coverage;
  the existing integration test is not an exact list of all registered rules.

Do not edit `dist/` manually. Ordinary rule additions do not require changes to
`src/meta.ts`, the package version, build entry points, or dependencies.

## 3. Implementation conventions

Follow `.editorconfig`, `.oxfmtrc.jsonc`, and `eslint.config.mjs`: TypeScript ESM,
two-space indentation, LF, single quotes, no semicolons, trailing commas, and an
80-column target. Use extensionless relative imports in plugin source and tests,
matching nearby files, and `import type` for type-only dependencies. Keep
diagnostics, comments, test descriptions, and public documentation in English.

The following outline shows a rule without options; implement the actual visitors
and messages for the requested behavior:

```ts
import { createESLintRule } from '../utils'

export const RULE_NAME = 'example-rule'

export type MessageIds = 'unexpected'
export type Options = []

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      recommended: false,
      description: 'disallow the targeted pattern',
    },
    schema: [],
    messages: {
      unexpected: 'Unexpected pattern.',
    },
  },
  create(context) {
    // Inspect the relevant nodes and report with messageId: 'unexpected'.
    return {}
  },
})
```

- `RULE_NAME` is unprefixed; the configuration key is `ntnyq/example-rule`.
  `createESLintRule` generates `meta.docs.url` using the rule ID.
- Import shared AST types and constants from `src/eslint.ts` where available,
  such as `Tree`, `RuleListener`, and `AST_NODE_TYPES`. Use precise types and
  narrowing instead of `any`. Preserve the existing ESLint host compatibility
  boundary in `createESLintRule`; do not duplicate its casts in ordinary rules.
- Choose `problem`, `suggestion`, or `layout` to match the behavior. Set
  `docs.recommended` deliberately; it does not create a recommended configuration.
- Keep option types, schema, defaults, implementation, and documentation aligned.
  Single-object rules typically use `Options = [{ ... }]`, a
  `const defaultOptions: Options[0]`, `meta.defaultOptions: [defaultOptions]`, and
  `create(context, [options])`. Defaults belong in `meta`, not at the rule's top
  level. Rules without options use `Options = []` and `schema: []`.
- `createESLintRule` merges defaults per option position, deeply merges objects,
  and replaces arrays. Test omitted options and partial objects as well as
  explicitly empty arrays. Variadic rules such as padding use their own option
  shape and schema; do not force them into a single-object tuple.
- Reject unknown object properties and constrain values with `enum`, `required`,
  `uniqueItems`, and ranges where appropriate. Include property descriptions.
- `MessageIds` is a string union matching `meta.messages` keys. Report with
  `context.report({ node, messageId, data })`, choosing the smallest useful
  diagnostic range. Use `context.sourceCode` and its scope APIs rather than
  legacy context methods.

## 4. Scope and fix boundaries

Use the AST and scope manager for binding-sensitive behavior. Account for
shadowing, import aliases, type-only syntax, computed properties, optional chains,
and TypeScript expression wrappers when they affect the rule. Decide explicitly
which dynamic cases are skipped instead of matching identifier text accidentally.

For Vue-aware rules, follow `no-restricted-bindings` and its tests: narrow the
required parser services, inspect real script ranges, and handle ordinary and
setup scripts independently. A `.vue` filename alone does not establish a script
region. Script visitors do not automatically check template expressions. Keep
parser configuration in tests and user documentation; do not add a runtime parser
dependency merely to inspect services supplied by the configured parser.

Declare `meta.fixable` only when fixes exist: `'whitespace'` for whitespace-only
changes or `'code'` for code changes. Declare `meta.hasSuggestions` only when
suggestions exist. Fix opt-in is rule-specific; rules such as `no-only-tests` and
`prefer-object-method-syntax` default `fix` to `false`, while formatting rules may
fix by default. Choose and document the new rule's behavior explicitly.

Preserve comments, parentheses, separators, ASI behavior, line endings, evaluation
order, and lexical bindings. If an automatic change cannot preserve semantics,
report without a fix. Suggestions may propose a manual-review tradeoff only when
the message explains it, following the function-conversion and return-type rules.
Do not silently convert unsafe fixes into equally unexplained suggestions.

## 5. Tests

Import the default rule and `RULE_NAME` from its module, and import `Options` and
`MessageIds` with `import type`. This minimal example uses an existing rule;
replace its module and cases with the new rule's behavior:

```ts
import rule, { RULE_NAME } from '../../src/rules/no-only-tests'
import { runRuleTests } from '../helpers/ruleTester'
import type { MessageIds, Options } from '../../src/rules/no-only-tests'

await runRuleTests<Options, MessageIds>({
  name: RULE_NAME,
  rule,
  valid: [{ code: 'test("case", () => {})' }],
  invalid: [
    {
      code: 'test.only("case", () => {})',
      options: { fix: true },
      errors: ['unexpected'],
      output: 'test("case", () => {})',
    },
  ],
})
```

The helper defaults to `@typescript-eslint/parser` and accepts either the options
tuple or its object shorthand for a single-object tuple. Keep the generics so
options and message IDs remain checked. Use `$` from the same helper for unindented
multiline fixtures when useful. For Vue fixtures, explicitly override
`languageOptions` with `vue-eslint-parser`, delegate script parsing to
`@typescript-eslint/parser`, and set a `.vue` filename.

Cover the relevant boundaries:

- Valid and invalid defaults; diagnostic counts, message IDs, interpolation, and
  meaningful locations. Add regression cases for every behavior change.
- Each option, important combinations, omitted options, partial defaults, and
  empty collections. Test schema rejection through `Linter` using the registered
  plugin, following `no-restricted-bindings.test.ts`; do not weaken behavioral
  test types merely to pass malformed options.
- Supported JS/TS syntax and source modes, out-of-scope input, binding identity,
  and Vue script combinations where applicable. Use `Linter` for default-parser
  cases because the shared runner uses the TypeScript parser.
- Complete fixed output, comments, LF/CRLF, and syntax wrappers. Keep recursive
  fix checking enabled. Assert `output: null` for reported cases without a fix,
  and verify suggestion messages and outputs when suggestions are provided.
- Fix stability and semantic regressions for complex changes. With
  `verifyAndFix`, check a second pass returns unchanged output and `fixed: false`.
  Report-only boundaries should retain diagnostics without fixes.

When shared helpers change, run tests for every affected rule. Add type regression
cases in `*.test-d.ts` only when changing a type contract; test helper changes
belong alongside `tests/helpers/ruleTester.test-d.ts`.

## 6. Documentation

Use the closest existing rule page as a template. Frontmatter includes
`pageClass: rule-details`, `sidebarDepth: 0`, `title: ntnyq/example-rule`, and an
accurate `description`. Match the heading to the full rule name and follow it
with a blockquoted description. Include wrench or suggestion notices only when
the rule supports them.

Follow the existing section conventions:

1. `## :book: Rule Details`: Explain checked and ignored cases with accepted and
   reported examples. Include rationale or interactions with core rules when useful.
2. `## :wrench: Options`: Show the actual `Options` shape, defaults, and each
   field's meaning. State when there are no options. Explain opt-in fixes,
   array replacement, and required configuration when applicable.
3. Scope, parser configuration, and fix limitations as needed. Show complete flat
   config when the rule requires a parser or special setup.
4. `## :rocket: Version`: Keep this and frontmatter `since` consistent with the
   confirmed introduction version. If no release target is established, mark it
   unreleased rather than claiming it exists in the current published version.
   Do not bump `package.json` as part of adding the rule.
5. `## :mag: Implementation`: Link to the real source and test paths under
   `https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/`. Directory-based rules
   must link to their `index.ts`.

Put accepted rule input in `::: correct` and reported input in `::: incorrect`,
with blank lines around delimiters and fences. Keep configuration and type
snippets in ordinary fences. A reported case without a fix is still incorrect;
explain the manual change without implying an automatic conversion.

Rendered diagnostics use `eslint-check` fences and
`docs/.vitepress/config/eslint.ts`. The container renderer in
`docs/.vitepress/config.ts` adds `eslint-check` to an immediately following code
fence. This repository uses a shared ESLint configuration rather than per-page
profiles. Existing `// options: [{ ... }]` comments are explanatory only; the
renderer does not parse them or apply their options. For non-default examples,
use an ESLint rule configuration comment with the full `ntnyq/example-rule` ID,
or configure the renderer explicitly. Verify that the intended options actually
take effect. Changes to the shared configuration affect other rule pages too.
Vue examples need matching parser/file handling before they can render meaningful
diagnostics.

Check that correct snippets produce no diagnostics and incorrect snippets report
the intended rule under the actual configuration. `pnpm docs:check` verifies
generated tables and file presence; it does not validate all example diagnostics.
Build the docs and add focused diagnostic assertions when necessary. Preserve
intentional spacing examples with the existing `<!-- prettier-ignore -->` or
`<!-- eslint-skip -->` patterns where appropriate, and verify that formatting has
not changed what the example demonstrates.

## 7. Generate and validate

Use the Node version selected by `.node-version` and pnpm from `packageManager`
in `package.json`. If dependencies are missing, run
`pnpm install --frozen-lockfile`.

During implementation, run the targeted rule tests with the actual filename:

```sh
pnpm exec vitest run tests/rules/example-rule.test.ts
```

Once the rule is registered and its page and tests exist, generate the rule tables
from a fresh build, then run the same full validation used by CI:

```sh
pnpm docs:generate
pnpm run release:check
git diff --check
git status --short
```

`release:check` covers the build, generated docs check, formatting, lint, source /
test / docs / tooling type checks, full tests, and documentation build. It does
not publish or bump versions. Format only task-related files if checks fail;
avoid bulk fixes to unrelated files. Consult `.github/workflows/ci.yml` for the
current Node matrix; passing locally does not mean the full matrix has run.

Before delivery, verify that rule IDs, filenames, registry entries, documentation
titles, and links agree; schema, types, defaults, diagnostics, and examples agree;
and fixes or suggestions match their documented boundaries. Inspect the generated
tables and confirm the diff contains only task-related changes.

Report the behavior, options, fix limitations, and checks performed, including any
blocked checks and their cause. If a commit is requested, follow the repository's
Conventional Commit style, for example `feat: implement rule example-rule`.
Adding a rule does not include a release or push.
