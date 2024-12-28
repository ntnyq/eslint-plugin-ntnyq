---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/no-duplicate-exports
description: Disallow duplicate exports statement.
since: v0.8.1
---

# ntnyq/no-duplicate-exports

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

> Disallow duplicate exports statement.

## :book: Rule Details

This rule reports multiple same export all statement.

### Good

```ts
export * from './foobar'

export * as foobar from './foobar'

export type * from './foobar'

export type * as Foobar from './foobar'

export { foo, bar } from './foobar'
```

### Bad

```ts
export * from './foobar'
export * from './foobar'

export * as foobar from './foobar'
export * as foobar from './foobar'

export type * from './foobar'
export type * from './foobar'

export type * as Foobar from './foobar'
export type * as Foobar from './foobar'

export { foo } from './foobar'
export { bar } from './foobar'
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.8.1

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-duplicate-exports.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-duplicate-exports.test.ts)