---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/indent-unindent
description: Enforce stable indentation in unindent tagged templates.
since: v0.16.0
---

# ntnyq/indent-unindent

> Enforce stable indentation in unindent tagged templates.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix all problems reported by this rule.

## Why this rule?

This rule is a local variant of
[`antfu/indent-unindent`](https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/indent-unindent.ts).
The upstream rule normalizes tagged template indentation by prefixing the
configured indentation to every content line, including an empty line.

That behavior creates a one-time formatting conflict when a template contains
an empty line:

```text
Prettier output:        ["  first", "",   "  second"]
antfu --fix output:     ["  first", "  ", "  second"]
this rule --fix output: ["  first", "",   "  second"]
```

Prettier deliberately preserves whitespace in template literals because it can
be part of the runtime value. Consequently, after the upstream ESLint fixer
inserts indentation into the empty line, a later Prettier pass keeps it. The
file has changed once depending on formatter order and now contains trailing
whitespace.

This rule keeps the upstream rule's intended indentation and options, but
normalizes every whitespace-only content line to a truly empty line. The result
is stable across repeated ESLint and Prettier runs and does not introduce
trailing whitespace.

Do not enable both rules. Their fixes disagree on empty lines, so replace the
upstream rule in your configuration:

```js
export default [
  {
    rules: {
      'antfu/indent-unindent': 'off',
      'ntnyq/indent-unindent': 'error',
    },
  },
]
```

## :book: Rule Details

By default, the rule checks `$`, `unindent`, and `unIndent` tagged templates and
uses two additional spaces relative to the tag's containing line.

::: correct

```ts eslint-check
const value = $`
  first
  second
`

function render() {
  return unindent`
    first
    second
  `
}
```

:::

::: incorrect

```ts eslint-check
const value = $`
first
second
`

function render() {
  return unindent`
  first
  second
  `
}
```

:::

Templates containing interpolations and templates whose tag is not a plain
identifier are ignored, matching the upstream rule:

```ts
const interpolated = $`hello ${name}`
const raw = String.raw`first`
```

## Automatic fixes

The fixer:

1. removes the common indentation and leading or trailing blank lines;
2. applies the configured indentation to non-empty content lines;
3. converts whitespace-only content lines to empty lines;
4. aligns the closing backtick with the tagged expression's containing line.

Because this is a layout rule for a deliberately selected unindent tag, every
reported problem is automatically fixable. As with the upstream rule, enabling
it opts the selected tags into rewriting the raw template contents.

## :wrench: Options

The rule accepts the same options as `antfu/indent-unindent`:

```js
export default [
  {
    rules: {
      'ntnyq/indent-unindent': [
        'error',
        {
          indent: 4,
          tags: ['dedent'],
        },
      ],
    },
  },
]
```

### `indent`

- Type: `number`
- Default: `2`

The number of spaces added relative to the containing line.

### `tags`

- Type: `string[]`
- Default: `['$', 'unindent', 'unIndent']`

The identifier names whose tagged templates are checked.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.16.0

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/indent-unindent.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/indent-unindent.test.ts)
