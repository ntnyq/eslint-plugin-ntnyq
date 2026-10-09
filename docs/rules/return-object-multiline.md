---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/return-object-multiline
description: Require multiline formatting for directly returned objects.
since: unreleased
---

# ntnyq/return-object-multiline

> Require multiline formatting for directly returned objects.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/latest/use/command-line-interface#--fix) can automatically fix problems reported by this rule.

## :book: Rule Details

This rule checks object literals returned directly by a `return` statement or
an expression-bodied arrow function. The opening brace, each property or spread,
and the closing brace must be separated by line breaks. A property may itself
span multiple lines, but the next property must start after its last line.
Empty returned objects must also have their braces on separate lines.

Enable the rule after registering the plugin as `ntnyq`:

```js
export default [
  {
    rules: {
      'ntnyq/return-object-multiline': 'error',
    },
  },
]
```

::: correct

```ts eslint-check
function getUser() {
  return {
    name: 'Alice',
    age: 18,
  }
}

const getArrowUser = () => ({
  name: 'Alice',
  age: 18,
})
```

:::

::: incorrect

```ts eslint-check
function getUser() {
  return { name: 'Alice', age: 18 }
}

// prettier-ignore
const getArrowUser = () => ({
  name: 'Alice', age: 18,
})

function getEmpty() {
  return {}
}
```

:::

### Scope

Parentheses around an object do not exempt it. Ordinary variable initializers
and nested object values are not checked. Objects returned by nested functions
are checked independently.

```ts
const user = { name: 'Alice', age: 18 }

function getUser() {
  return {
    profile: { name: 'Alice', age: 18 },
  }
}
```

The rule does not resolve variables or inspect objects inside conditional,
logical, call, array, or TypeScript wrapper expressions. These are outside its
scope:

```ts
function getUser() {
  return user
}

const getConditional = () => (ready ? { name: 'Alice' } : {})
const getFallback = () => cached || {}
const getWrapped = () => wrap({ name: 'Alice' })
const getArray = () => [{ name: 'Alice' }]
const getAsserted = () => ({ name: 'Alice' }) as const
const getChecked = () => ({ name: 'Alice' }) satisfies User
```

Comments may share lines with braces or properties. Indentation, comma placement,
and nested object formatting are left to other rules or a formatter.

## Automatic fixes

Run ESLint with `--fix` to insert the required line breaks, including for empty
objects. The fixer replaces only whitespace before properties and closing
braces, keeping comments, commas, property values, and parentheses intact. It
never inserts a line break between `return` and its argument.

Existing line breaks are preserved. New line breaks use CRLF when the file
contains CRLF, otherwise LF. The fixer does not add indentation or trailing
commas; use your formatter or other layout rules for those conventions.

## :wrench: Options

Nothing.

## :rocket: Version

This rule has not been released yet.

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/return-object-multiline.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/return-object-multiline.test.ts)
