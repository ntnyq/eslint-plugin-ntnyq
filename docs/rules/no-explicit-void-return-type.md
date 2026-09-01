---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/no-explicit-void-return-type
description: Disallow explicit void return types on function implementations.
since: v0.16.0
---

# ntnyq/no-explicit-void-return-type

> Disallow explicit `void` return types on function implementations.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.
- :bulb: Some problems reported by this rule are manually fixable by [editor suggestions](https://eslint.org/docs/latest/extend/custom-rules#providing-suggestions).

## Why this rule?

TypeScript can infer `void` and `Promise<void>` from implementations that
complete without returning a value. Omitting those annotations reduces repeated
type information while preserving `void` where it forms part of an API
contract, such as a callback type, interface, overload, or ambient declaration.

This rule therefore reports only function implementations whose complete return
type annotation is exactly `void` or `Promise<void>`:

```ts
function cleanup(): void {}
async function load(): Promise<void> {}
```

It does not ban the `void` type generally:

```ts
type Cleanup = () => void

interface Service {
  cleanup(): void
  load(): Promise<void>
}

declare function cleanup(): void
```

### Why not ESLint or typescript-eslint rules?

The related rules solve different problems:

- ESLint [`no-void`](https://eslint.org/docs/latest/rules/no-void) disallows the
  JavaScript `void` operator, such as `void expression`. It does not inspect
  TypeScript return type annotations.
- typescript-eslint
  [`no-invalid-void-type`](https://typescript-eslint.io/rules/no-invalid-void-type/)
  disallows `void` outside return types and configured generic type arguments.
  It intentionally allows `(): void` and `Promise<void>`, which are the forms
  this rule targets on implementations.
- typescript-eslint
  [`no-confusing-void-expression`](https://typescript-eslint.io/rules/no-confusing-void-expression/)
  checks where expressions whose type is `void` are used. It does not remove
  explicit return annotations and requires type information.
- typescript-eslint
  [`explicit-function-return-type`](https://typescript-eslint.io/rules/explicit-function-return-type/)
  enforces the opposite convention by requiring explicit return types. Do not
  enable it for the same functions as this rule.

## :book: Rule Details

::: correct

```ts eslint-check
function cleanup() {
  cleanupResource()
}

const dispose = () => {
  cleanupResource()
}

async function load() {
  await loadResource()
}

type Cleanup = () => void

interface Service {
  cleanup(): void
  load(): Promise<void>
}
```

:::

::: incorrect

```ts eslint-check
function cleanup(): void {
  cleanupResource()
}

const dispose = (): void => {
  cleanupResource()
}

async function load(): Promise<void> {
  await loadResource()
}
```

:::

The rule matches only the complete annotations `void` and `Promise<void>`.
Related types such as `PromiseLike<void>`, `Promise<void | undefined>`, and
`globalThis.Promise<void>` are outside its scope.

## Automatic fixes

The rule removes the complete return type annotation, including its leading
colon:

```ts
const before = (): void => {
  cleanupResource()
}

const after = () => {
  cleanupResource()
}
```

An annotation is automatically removed only when all of these conditions hold:

- the function has a block body and is not a generator;
- at least one reachable control-flow path returns normally;
- the implementation has no `return` statement with a value;
- `void` belongs to a non-async function, or `Promise<void>` belongs to an
  `async` function;
- removing the annotation would not remove a comment.

For this subset, TypeScript continues to infer `void` or `Promise<void>`.

### Why fixes are partial

Removing an annotation can change inference even though it cannot change the
emitted JavaScript. For example:

```ts
const returnsUndefined = (): void => {
  return undefined
}
// Inferred without the annotation: () => undefined

const fails = async (): Promise<void> => {
  throw new Error('failed')
}
// Inferred without the annotation: () => Promise<never>
```

An explicit `Promise<void>` can also provide contextual typing to a non-async
Promise factory:

```ts
const createTask = (): Promise<void> => new Promise(resolve => resolve())
```

Removing this annotation can infer `Promise<unknown>` and make the zero-argument
`resolve()` call invalid. Recursive functions can similarly lose the annotation
that breaks an inference cycle.

Because ESLint automatic fixes should not introduce type errors or silently
change a public type, the rule withholds `--fix` for expression-bodied arrows,
value-returning implementations, functions that only throw or loop, non-async
`Promise<void>` implementations, mismatched async annotations, generators, and
annotations containing comments.

When removing the annotation would not discard a comment, these uncertain cases
receive an editor suggestion instead. The suggestion is manual because the
developer must decide whether the newly inferred type is intended.

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.16.0

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-explicit-void-return-type.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/no-explicit-void-return-type.test.ts)
