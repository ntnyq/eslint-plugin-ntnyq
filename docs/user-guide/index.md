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
