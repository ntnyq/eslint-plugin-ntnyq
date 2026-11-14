---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/padding-line-between-statements
description: Require or disallow padding lines between statements.
since: unreleased
---

# ntnyq/padding-line-between-statements

> Require or disallow padding lines between statements.

- :wrench: The `--fix` option can automatically fix some problems reported by this rule.

## Motivation and references

This rule references ESLint's
[`padding-line-between-statements`](https://eslint.org/docs/latest/rules/padding-line-between-statements)
and its [implementation](https://github.com/eslint/eslint/blob/v10.14.0/lib/rules/padding-line-between-statements.js).
ESLint deprecated the core rule in **v8.53.0** and plans to remove it in
**v11.0.0** as part of [deprecating formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/).

The motivation is to keep statement padding checks available without adding
`@stylistic/eslint-plugin` just for this rule. This plugin implements the check
directly, without loading ESLint's deprecated rule or depending on Stylistic.
It follows the core rule's option format and statement selectors.

The original discussion focused on separating preparation, guards, loops, and
final returns with blank lines, while keeping related variable declarations
together. Statement boundaries can enforce much of that style; semantic
groupings still require human judgment.

## :book: Rule Details

The rule checks adjacent statements in programs, blocks, static blocks,
TypeScript namespace bodies, and switch case bodies. It also checks adjacent
`case` / `default` clauses. It does not require padding at the start or end of
a block, between object properties or class members, or between `if` and `else`.

No checks run until options are configured. For example, require a blank line
before control statements, `return`, and `throw`, and after control statements:

```js
import pluginNtnyq from 'eslint-plugin-ntnyq'

export default [
  {
    plugins: { ntnyq: pluginNtnyq },
    rules: {
      'ntnyq/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'if',
            'for',
            'while',
            'do',
            'switch',
            'try',
            'return',
            'throw',
          ],
        },
        {
          blankLine: 'always',
          prev: ['if', 'for', 'while', 'do', 'switch', 'try'],
          next: '*',
        },
      ],
    },
  },
]
```

With that configuration:

::: correct

```ts
function collect(values: string[]) {
  const result: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      continue
    }

    seen.add(value)
    result.push(value)
  }

  return result
}
```

:::

::: incorrect

```ts
function collect(values: string[]) {
  const result: string[] = []
  for (const value of values) {
    result.push(value)
  }
  return result
}
```

:::

## :wrench: Options

Options are a list of objects, rather than a single object containing a list:

```ts
type Options = {
  blankLine: 'always' | 'never' | 'any'
  prev: StatementType | StatementType[]
  next: StatementType | StatementType[]
}[]
```

- `always`: require at least one blank line; existing extra blank lines are allowed.
- `never`: disallow blank lines.
- `any`: allow either style, useful for overriding an earlier match.
- `prev` / `next`: match the previous / following statement, with arrays matching any listed selector.

**The last matching configuration wins.** Unmatched pairs are allowed.
For example, separate declarations from other statements while leaving consecutive
declarations unrestricted:

```js
rules: {
  'ntnyq/padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
    { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
  ],
}
```

### Statement selectors

| Selector                                               | Matches                                                                                             |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `*`                                                    | Any statement, including TypeScript declarations                                                    |
| `block`                                                | A standalone block statement                                                                        |
| `block-like`                                           | A statement ending in a block or switch closing brace, a block-bodied `do` loop, or an IIFE         |
| `break`, `continue`, `debugger`, `return`, `throw`     | The corresponding statements                                                                        |
| `case`, `default`                                      | Switch clauses                                                                                      |
| `class`, `const`, `let`, `var`, `import`, `export`     | Statements beginning with the corresponding keyword                                                 |
| `do`, `for`, `if`, `switch`, `try`, `while`, `with`    | Statements beginning with the corresponding keyword; `for` includes `for-in` and `for-of`           |
| `function`                                             | Function declarations                                                                               |
| `empty`                                                | Empty statements (`;`)                                                                              |
| `directive`                                            | Directive prologue statements, such as `'use strict'`                                               |
| `expression`                                           | Expression statements excluding directives                                                          |
| `iife`                                                 | Immediately invoked function or arrow function expressions, optionally preceded by a unary operator |
| `cjs-import`                                           | Variable declarations whose first initializer starts with `require(`                                |
| `cjs-export`                                           | Assignments to `exports`, `exports.*`, `exports[...]`, or the corresponding `module.exports` forms  |
| `multiline-block-like`, `multiline-expression`         | The corresponding category spanning multiple lines                                                  |
| `multiline-const`, `multiline-let`, `multiline-var`    | Declarations beginning with that keyword and spanning multiple lines                                |
| `singleline-const`, `singleline-let`, `singleline-var` | Declarations beginning with that keyword and occupying one line                                     |

Labels are unwrapped for matching. As with the core rule, `export const` matches
`export`, not `const`, and `async function` matches `function`. TypeScript-only
selectors such as `interface` or `type` are not supported; use `*` to include
those declarations. This is not a replacement for Stylistic's additional
TypeScript selectors.

### Comments and fixes

Blank lines on either side of a comment count as padding. Empty lines inside a
block comment do not. Insertions preserve trailing comments and the file's
line ending style, including CRLF, and keep ASI protection semicolons attached
to their following expressions.

For `never`, a diagnostic is reported but no automatic fix is offered when
multiple whitespace gaps are separated by comments. This preserves comment
placement for manual review.

### JavaScript, TypeScript, and Vue

JavaScript works with ESLint's default parser. TypeScript requires
`@typescript-eslint/parser`. Vue SFCs require `vue-eslint-parser`, delegating
TypeScript script contents to `@typescript-eslint/parser` as usual:

```js
import parserTypeScript from '@typescript-eslint/parser'
import parserVue from 'vue-eslint-parser'

// Add these entries alongside the plugin and rule configuration above.
export default [
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: { parser: parserTypeScript },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: { parser: parserTypeScript },
    },
  },
]
```

Both `<script>` and `<script setup>` are checked. The rule never inserts padding
between separate script blocks and does not check template expressions.
No type-aware parser configuration is needed.

## :rocket: Version

This rule has not been released yet.

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/padding-line-between-statements.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/padding-line-between-statements.test.ts)
