# eslint-plugin-ntnyq

[![CI](https://github.com/ntnyq/eslint-plugin-ntnyq/workflows/CI/badge.svg)](https://github.com/ntnyq/eslint-plugin-ntnyq/actions)
[![NPM VERSION](https://img.shields.io/npm/v/eslint-plugin-ntnyq.svg)](https://www.npmjs.com/package/eslint-plugin-ntnyq)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/eslint-plugin-ntnyq.svg)](https://www.npmjs.com/package/eslint-plugin-ntnyq)
[![CODECOV](https://codecov.io/github/ntnyq/eslint-plugin-ntnyq/branch/main/graph/badge.svg)](https://codecov.io/github/ntnyq/eslint-plugin-ntnyq)
[![LICENSE](https://img.shields.io/github/license/ntnyq/eslint-plugin-ntnyq.svg)](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/LICENSE)

> Do not use this plugin unless you know exactly every rule may change.

> [!CAUTION]
> Do check the output to ensure it's doing its job correctly and only run this on code that has been checked into source control.

## Install

**npm**:

```shell
npm i eslint-plugin-ntnyq -D
```

**yarn**

```shell
yarn add eslint-plugin-ntnyq -D
```

**pnpm**

```shell
pnpm add eslint-plugin-ntnyq -D
```

## Usage

Config in `eslint.config.mjs`

```js
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

### Advanced Usage

Override/add specific rules configurations.

_See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)_.

```js
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
      'ntnyq/prefer-newline-after-file-header': 'error',
    },
  }),
]
```

## Rules

💼 Configurations enabled in.\
✅ Set in the `recommended` preset.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

| Name                                                                                                            | Description                                       | 💼  | 🔧  | 💡  |
| :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ | :-: | :-: | :-: |
| [no-duplicate-exports](https://eslint-plugin.ntnyq.com/rules/no-duplicate-exports.html)                         | Disallow duplicate exports statement              |     | 🔧  |     |
| [no-member-accessibility](https://eslint-plugin.ntnyq.com/rules/no-member-accessibility.html)                   | Disallow usage of typescript member accessibility |     | 🔧  |     |
| [prefer-newline-after-file-header](https://eslint-plugin.ntnyq.com/rules/prefer-newline-after-file-header.html) | Require a newline after file header               | ✅  | 🔧  |     |

## License

[MIT](./LICENSE) License © 2023-PRESENT [ntnyq](https://github.com/ntnyq)
