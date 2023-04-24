# eslint-plugin-ntnyq

[![CI](https://github.com/ntnyq/eslint-plugin-ntnyq/workflows/CI/badge.svg)](https://github.com/ntnyq/eslint-plugin-ntnyq/actions)
[![NPM VERSION](https://img.shields.io/npm/v/eslint-plugin-ntnyq.svg)](https://www.npmjs.com/package/eslint-plugin-ntnyq)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/eslint-plugin-ntnyq.svg)](https://www.npmjs.com/package/eslint-plugin-ntnyq)
[![COVERAGE](https://coveralls.io/repos/github/ntnyq/eslint-plugin-ntnyq/badge.svg?branch=main)](https://coveralls.io/github/ntnyq/eslint-plugin-ntnyq?branch=main)
[![LICENSE](https://img.shields.io/github/license/ntnyq/eslint-plugin-ntnyq.svg)](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/LICENSE)

> Do not use this plugin unless you know exactly every rule may change.

## ⚠️ Caveat

Do check the output to ensure it's doing its job correctly and only run this on code that has been checked into source control.

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

Add `ntnyq` to the plugins section of your eslint config file (you can omit the `eslint-plugin-` prefix)
and either use the preset `recommended` or configure the rules you want:

### The recommended preset

The `plugin:ntnyq/recommended` config enables a subset of [the rules](#rules) that should be most useful to most users.

_See [src/configs/recommended.ts](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/configs/recommended.ts) for more details._

```jsonc
// .eslintrc.json
{
  "extends": [
    // Other presets
    "plugin:ntnyq/recommended"
  ]
}
```

### The all preset

The `plugin:ntnyq/all` config enables all the [the rules](#rules).

_See [src/configs/all.ts](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/configs/all.ts) for more details._

```jsonc
// .eslintrc.json
{
  "extends": [
    // Other presets
    "plugin:ntnyq/all"
  ]
}
```

### Advanced Configuration

Override/add specific rules configurations.

_See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)_.

```jsonc
// .eslintrc.json
{
  "plugins": ["ntnyq"],
  "rules": {
    // Override/add rules settings here, such as:
    "ntnyq/rule-name": "error"
  }
}
```

## Rules

💼 Configurations enabled in.\
🌐 Set in the `plugin:ntnyq/all` preset.\
✅ Set in the `plugin:ntnyq/recommended` preset.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

| Name                                                                                          | Description                                       | 💼  | 🔧  | 💡  |
| :-------------------------------------------------------------------------------------------- | :------------------------------------------------ | :-: | :-: | :-: |
| [no-member-accessibility](https://eslint-plugin.ntnyq.com/rules/no-member-accessibility.html) | disallow usage of typescript member accessibility | 🌐  | 🔧  |     |

## License

[MIT](./LICENSE) License © 2023-PRESENT [ntnyq](https://github.com/ntnyq)
