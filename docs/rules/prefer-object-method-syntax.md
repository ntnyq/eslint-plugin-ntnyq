---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/prefer-object-method-syntax
description: Prefer method syntax for inline functions in object literals.
since: v0.15.0
---

# ntnyq/prefer-object-method-syntax

> Prefer method syntax for inline functions in object literals.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.
- :bulb: Some problems reported by this rule are manually fixable by [editor suggestions](https://eslint.org/docs/latest/extend/custom-rules#providing-suggestions).

## Why this rule?

The ESLint core [`object-shorthand`](https://eslint.org/docs/latest/rules/object-shorthand) rule already prefers method syntax for anonymous function expressions:

```ts
const object = {
  method: function () {},
}
```

However, its primary responsibility is broader: it also handles property shorthand, long-form syntax, and consistency across an object. Arrow functions are allowed by default. The `avoidExplicitReturnArrows` option only checks a subset of block-bodied arrow functions and does not report arrows that use lexical bindings such as `this`, `arguments`, `super`, or `new.target`.

The core rule also skips named function expressions and fixes anonymous ordinary function expressions even though converting one to a method removes its constructibility and changes its `prototype` behavior.

This rule focuses only on inline functions used as object property values. It:

- checks function expressions and, by default, arrow functions;
- reports expression-bodied and block-bodied arrows;
- still reports arrows that require lexical bindings, while withholding unsafe fixes;
- reports named function expressions without removing their inner binding;
- supports exact property-name exceptions;
- keeps automatic fixing opt-in and limited to the safe subset.

To avoid duplicate reports, configure the core rule to handle only property shorthand:

```ts
export default [
  {
    rules: {
      'object-shorthand': ['error', 'properties'],
      'ntnyq/prefer-object-method-syntax': 'error',
    },
  },
]
```

## :book: Rule Details

This rule reports function expressions and disallowed arrow functions used directly as object property values.

::: correct

```ts eslint-check
const dispose = () => {}

const object = {
  dispose,

  method() {},

  async asyncMethod() {},

  *iterator() {},

  get value() {
    return this.internalValue
  },

  set value(value) {
    this.internalValue = value
  },
}
```

:::

::: incorrect

```ts eslint-check
const object = {
  method: function () {},
  asyncMethod: async function () {},
  iterator: function* () {},
  dispose: () => {},
  calculate: value => value * 2,
}
```

:::

Named function expressions are also reported, but are not automatically fixed because method syntax cannot preserve their inner name binding:

```ts
const object = {
  recursive: function inner() {
    return inner()
  },
}
```

The non-computed `__proto__` form is ignored because it changes the created object's prototype rather than defining a normal property:

```ts
const object = {
  __proto__: function () {},
}
```

## :wrench: Options

```ts
export type Options = [
  {
    allowArrowFunctions?: boolean | 'singleLineOnly'
    allowedPropertyNames?: string[]
    fix?: boolean
  },
]
```

Defaults:

- `allowArrowFunctions`: `false`
- `allowedPropertyNames`: `[]`
- `fix`: `false`

### `allowArrowFunctions`

This option controls which arrow functions are allowed as object property
values:

- `false` reports all arrow functions;
- `true` allows all arrow functions;
- `'singleLineOnly'` allows single-line arrow functions but still reports
  multi-line arrow functions.

Function expressions are still reported for every option value.

```ts eslint-check
// options: [{ allowArrowFunctions: true }]
const object = {
  allowed: () => {},
  reported: function () {},
}
```

With `'singleLineOnly'`, multi-line arrow functions can be automatically fixed
when `fix` is also enabled and the conversion is safe:

```ts eslint-check
// options: [{ allowArrowFunctions: 'singleLineOnly', fix: true }]
const name = computed({
  get: () => model.value.name,
  read: () =>
    // Keep this expression comment.
    model.value.name,
  set: value => {
    model.value = { ...model.value, name: value }
  },
})
```

With `--fix`, the multi-line `set` property becomes:

```ts
const name = computed({
  get: () => model.value.name,
  read() {
    // Keep this expression comment.
    return model.value.name
  },
  set(value) {
    model.value = { ...model.value, name: value }
  },
})
```

### `allowedPropertyNames`

Static property names in this list are ignored for both function expressions and arrow functions.

```ts eslint-check
// options: [{ allowedPropertyNames: ['computed', 'get', 'set'] }]
const object = {
  computed: () => value,
  get: function () {},
  ['set']: value => update(value),
}
```

Identifier, string, number, and statically computed property names are supported. A dynamic computed property cannot match this option:

```ts
const object = {
  [methodName]: () => {},
}
```

### `fix`

When `true`, the rule automatically fixes only conversions that preserve the relevant function semantics.

The rule can automatically convert:

- anonymous async, generator, and async-generator function expressions;
- block-bodied arrow functions that do not depend on lexical bindings;
- multi-line expression-bodied arrow functions that do not depend on lexical
  bindings.

The fixer introduces an explicit `return` when converting a multi-line
expression-bodied arrow. Comments before the returned expression stay above
the generated `return` statement.

```ts
const before = {
  load: async function () {},
  iterate: function* () {},
  dispose: () => {
    cleanup()
  },
}

const after = {
  async load() {},
  *iterate() {},
  dispose() {
    cleanup()
  },
}
```

The rule does not automatically fix:

- ordinary function expressions, because methods are not constructible and do not have the same `prototype` property;
- named function expressions, because their inner name binding would be removed;
- single-line expression-bodied arrows;
- arrows that use lexical `this`, `arguments`, `super`, or `new.target`;
- arrows containing direct `eval(...)`, which can access lexical bindings dynamically;
- conversions that would remove or relocate comments.

For example, this arrow must retain the surrounding class instance as its `this` value:

```ts
class Controller {
  #document = document

  create() {
    return {
      dispose: () => {
        this.#document.removeEventListener('click', handleClick)
      },
    }
  }
}
```

A semantics-preserving manual refactor keeps the arrow in the same lexical scope:

```ts
class Controller {
  #document = document

  create() {
    const dispose = () => {
      this.#document.removeEventListener('click', handleClick)
    }

    return {
      dispose,
    }
  }
}
```

Editor suggestions may be available for conversions that require manual review. In particular, the suggestion for an ordinary function expression warns that the resulting method will no longer be constructible.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.15.0

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/prefer-object-method-syntax.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/prefer-object-method-syntax.test.ts)
