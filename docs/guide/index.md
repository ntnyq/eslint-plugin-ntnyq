# Guide

## Install

**npm**:

```bash
npm i eslint-plugin-ntnyq -D
```

**yarn**

```bash
yarn add eslint-plugin-ntnyq -D
```

**pnpm**

```bash
pnpm add eslint-plugin-ntnyq -D
```

## Usage

Config in `eslint.config.mjs`

```js
import pluginNtnyq from 'eslint-plugin-ntnyq'

export default [
  // other configs
  ...pluginNtnyq.configs.recommended,
]
```

### The recommended preset

The `recommended` config enables a subset of [the rules](#rules) that should be most useful to most users.

_See [src/configs/recommended.ts](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/configs/recommended.ts) for more details._

### The all preset

The `all` config enables all the [the rules](#rules).

_See [src/configs/all.ts](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/configs/all.ts) for more details._

### Advanced Configuration

Override/add specific rules configurations.

_See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)_.

```js
import pluginNtnyq from 'eslint-plugin-ntnyq'

export default [
  {
    files: ['**/*.ts'],
    plugins: {
      ntnyq: pluginNtnyq,
    },
    rules: {
      'ntnyq/no-member-accessibility': 'error',
    },
  },
]
```
