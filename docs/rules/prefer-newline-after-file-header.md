---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/prefer-newline-after-file-header
description: Require a newline after file header.
since: v0.9.0
---

# ntnyq/prefer-newline-after-file-header

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

> Require a newline after file header.

## :book: Rule Details

This rule reports when no newline after file-header.

::: correct

```ts eslint-check
/**
 * @file eslint config
 */

export const foobar = 'foobar'
```

:::

::: incorrect

```ts eslint-check
/**
 * @file eslint config
 */
export const foobar = 'foobar'
```

:::

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.9.0

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/prefer-newline-after-file-header.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/prefer-newline-after-file-header.test.ts)