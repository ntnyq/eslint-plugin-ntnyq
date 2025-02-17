# Guide

## Install

::: code-group

```shell [npm]
npm i eslint-plugin-ntnyq -D
```

```shell [yarn]
yarn add eslint-plugin-ntnyq -D
```

```shell [pnpm]
pnpm add eslint-plugin-ntnyq -D
```

:::

## Basic Usage

Highly recommended to use `eslint.config.mjs` as config file.

```ts [eslint.config.mjs] twoslash
// @ts-check

import pluginNtnyq from 'eslint-plugin-ntnyq'

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  // other configs
  {
    name: 'ntnyq',
    plugins: {
      ntnyq: pluginNtnyq,
    },
    rules: {
      'ntnyq/no-duplicate-exports': 'error',
    },
  },
]
```
