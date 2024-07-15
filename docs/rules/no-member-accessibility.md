---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/no-member-accessibility
description: disallow usage of typescript member accessibility.
since: v0.0.1
---

# ntnyq/no-member-accessibility

💼 This rule is enabled in the 🌐 `all` config.

> disallow usage of typescript member accessibility.

## :book: Rule Details

This rule reports usage of TypeScript member accessibility.

### Good

```ts
class Test {
  x: number

  constructor(x: number) {
    this.x = x
  }

  get internalValue() {
    return this.x
  }

  set internalValue(value: number) {
    this.x = value
  }

  square(): number {
    return this.x * this.x
  }

  half(): number {
    return this.x / 2
  }
}
```

### Bad

```ts
class Test {
  private x: number

  public constructor(x: number) {
    this.x = x
  }

  protected get internalValue() {
    return this.x
  }

  protected set internalValue(value: number) {
    this.x = value
  }

  public square(): number {
    return this.x * this.x
  }

  private half(): number {
    return this.x / 2
  }
}
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-ntnyq v0.0.1

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-member-accessibility.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-member-accessibility.test.ts)
