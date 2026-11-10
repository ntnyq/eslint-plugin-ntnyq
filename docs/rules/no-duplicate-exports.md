---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/no-duplicate-exports
description: Disallow duplicate exports statement.
since: v0.8.1
---

# ntnyq/no-duplicate-exports

> Disallow duplicate exports statement.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports multiple same export all statement.

::: correct

```ts eslint-check
export * from './foobar'

export * as foobar from './foobar'

export { bar, foo } from './foobar'

export type * from './foobar'

export type * as Foobar from './foobar'
```

:::

::: incorrect

```ts eslint-check
export * from './foobar'
export * from './foobar'

export { foo } from './foobar'
export { bar } from './foobar'

export * as foobar from './foobar'
export * as foobar from './foobar'

export type * from './foobar'
export type * from './foobar'

export type * as Foobar from './foobar'
export type * as Foobar from './foobar'
```

:::

## :wrench: Options

```ts
export type Options = [
  {
    style?: 'inline' | 'separate'
  },
]
```

Default to `separate`.

With `inline`, type specifiers can be merged into a value export from the same
source. A group containing only `export type` declarations stays type-only, so
fixing cannot introduce a runtime dependency. Mixed groups are merged at the
first value export to preserve module evaluation order.

Declarations with different import attributes or namespace export names remain
separate. Fixes preserve comments; a declaration containing an internal comment
may be reported without an automatic fix.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.8.1

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-duplicate-exports.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/tree/main/tests/rules/no-duplicate-exports.test.ts)
