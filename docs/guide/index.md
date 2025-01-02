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
  ...pluginNtnyq.configs.recommended,
]
```

### The recommended preset

The `recommended` config enables a subset of [the rules](#rules) that should be most useful to most users.

_See [src/configs/recommended.ts](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/configs/recommended.ts) for more details._

## Advanced Usage

Override/add specific rules configurations.

_See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)_.

```ts [eslint.config.mjs] twoslash
// @noErrors
// @ts-check

import { createConfig } from 'eslint-plugin-ntnyq'

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  // other configs
  createConfig({
    name: 'ntnyq/recommended',
    files: ['**/*.?([cm])[jt]s?(x)'],
    rules: {
      'ntnyq/no-member-accessibility': 'error',
    },
  }),
]
```

## Options of `createConfig`

All fields of ESLint `Linter.Config` are supported, but bellow fields have default value:

### files

The files to be linted.

- Type: `string[]`
- Required: `false`
- Default: `['**/*.?([cm])[jt]s?(x)']`

### languageOptions.parser

The parser to use, this is set by default and can't be overridden.

- Type: `Linter.Parser`
- Required: `false`
- Default: [@typescript-eslint/parser](https://typescript-eslint.io/packages/parser/)

### plugins

The plugins to use.

- Type: `Record<string, ESLint.Plugin>`
- Required: `false`
- Default: key `ntnyq` set to this plugin
