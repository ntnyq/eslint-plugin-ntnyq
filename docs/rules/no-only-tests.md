---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/no-only-tests
description: Disallow use `.only` blocks in tests.
since: v0.15.0
---

# ntnyq/no-only-tests

> Disallow use `.only` blocks in tests.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports while using `.only` blocks in tests.

::: correct

```ts eslint-check
describe('some describe block', () => {})
it('some assertion', () => {})
other.only('this is allowed by default', () => {})
```

:::

::: incorrect

```ts eslint-check
describe.only('focused suite', () => {})
it.only('focused case', () => {})
test.only('focused test', () => {})
```

:::

## :wrench: Options

```ts
export type Options = [
  {
    block?: string[]
    focus?: string[]
    functions?: string[]
    fix?: boolean
  },
]
```

Defaults:

- `block`: `['describe', 'it', 'context', 'test', 'tape', 'fixture', 'serial', 'Feature', 'Scenario', 'Given', 'And', 'When', 'Then']`
- `focus`: `['only']`
- `functions`: `[]`
- `fix`: `false`

### `block`

List of block names that should not be focused. Wildcard suffix `*` is supported.

```ts eslint-check
// options: [{ block: ['test*'] }]
testResource.only('resource test', () => {})
```

### `focus`

List of focus method names.

```ts eslint-check
// options: [{ focus: ['focus'] }]
test.focus('focused test', () => {})
```

### `functions`

List of direct function names to disallow.

```ts eslint-check
// options: [{ functions: ['fit', 'xit'] }]
xit('skipped test', () => {})
```

### `fix`

When `true`, the rule removes focus method usage such as `.only` or `.focus`.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.15.0

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-only-tests.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/no-only-tests.test.ts)
