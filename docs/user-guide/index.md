# User Guide

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

### The recommended configuration

The `plugin:ntnyq/recommended` config enables a subset of [the rules](/rules/) that should be most useful to most users.

_See [src/configs/recommended.ts](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/configs/recommended.ts) for more details._

```js
// .eslintrc.js
module.exports = {
  plugins: ['ntnyq'],
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:ntnyq/recommended',
  ],
}
```

### Advanced Configuration

Override/add specific rules configurations.

_See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)_.

```js
// .eslintrc.js
module.exports = {
  plugins: ['ntnyq'],
  rules: {
    // Override/add rules settings here, such as:
    'ntnyq/rule-name': 'error',
  },
}
```
