---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/prefer-newline-after-file-header
description: Require a newline after file header.
since: v0.9.0
---

# ntnyq/prefer-newline-after-file-header

> Require a newline after file header.

- 💼 This rule is enabled in the ✅ `recommended` [config](https://eslint-plugin.ntnyq.com/guide/#the-recommended-preset).

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

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

::: correct

```ts eslint-check
// @file eslint config

export const foobar = 'foobar'
```

:::

::: correct

```ts eslint-check
/**
 * @file eslint config
 */
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

```ts
export type Options = [
  {
    tags?: string[]
  },
]
```

Default to:

```json
{
  "tags": [
    "@author",
    "@category",
    "@copyright",
    "@date",
    "@file",
    "@fileoverview",
    "@license",
    "@module",
    "@overview"
  ]
}
```

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.9.0

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/prefer-newline-after-file-header.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/prefer-newline-after-file-header.test.ts)
