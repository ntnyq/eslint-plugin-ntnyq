---
pageClass: rule-details
sidebarDepth: 0
title: ntnyq/no-restricted-bindings
description: Disallow specified binding names in selected regions and scopes.
since: unreleased
---

# ntnyq/no-restricted-bindings

> Disallow specified binding names in selected regions and scopes.

Reserve names for a particular purpose, such as keeping `error` available for
catch parameters instead of declaring a top-level `error` state variable.
This rule checks declarations even when there is no actual variable shadowing.

## :book: Rule Details

The rule checks local value bindings: variables, destructuring, imports,
function and class names, runtime function parameters, enums, and namespaces.
It reports each declaration position at most once, without reporting references.

It ignores property names and accesses, export aliases, enum members, labels,
Vue template bindings, and pure TypeScript types. Type aliases, interfaces,
generic parameters, signature-only parameters, `this` parameters, and explicit
type imports are excluded. Ordinary imports are checked without resolving
whether the imported symbol has a runtime value.

There are no automatic fixes or rename suggestions. Renaming can change public
exports, shorthand properties, and template references; use your editor's
Rename Symbol operation to choose an appropriate replacement.

The rule does nothing until names are configured. For example:

```js
export default [
  {
    rules: {
      'ntnyq/no-restricted-bindings': [
        'error',
        {
          restrictions: [
            {
              names: ['error'],
              regions: ['script', 'vue-script-setup'],
              scope: 'top-level',
              except: ['catch-parameter'],
              message:
                'Use a domain name such as requestError; reserve error for catch parameters.',
            },
          ],
        },
      ],
    },
  },
]
```

With this configuration:

```ts
const error = getError() // Reported
const { error: requestError } = useRequest() // Allowed: local name is requestError
import { error as logError } from './logger' // Allowed: local name is logError
const state = { error: null } // Allowed: property name

function run() {
  const error = getError() // Allowed: nested binding
}

try {
  run()
} catch (error) {
  console.log(error) // Allowed: catch parameter
}
```

## :wrench: Options

```ts
export type Options = [
  {
    restrictions: {
      names: string[]
      regions?: ('script' | 'vue-script' | 'vue-script-setup')[]
      scope?: 'top-level' | 'nested' | 'all'
      except?: 'catch-parameter'[]
      message?: string
    }[]
  },
]
```

The default is `{ restrictions: [] }`. Each restriction has these fields:

| Field     | Default           | Behavior                                                              |
| :-------- | :---------------- | :-------------------------------------------------------------------- |
| `names`   | Required          | Non-empty list of exact, case-sensitive names; no regular expressions |
| `regions` | All three regions | Non-empty list of script regions to check                             |
| `scope`   | `'top-level'`     | Binding scope depth within the selected region                        |
| `except`  | `[]`              | Binding categories exempted from this restriction                     |
| `message` | None              | Business explanation appended to the standard diagnostic              |

Unknown fields, unsupported values, empty names, and duplicate entries in
`names`, `regions`, or `except` are rejected.

### `regions`

- `script`: standalone JavaScript or TypeScript files.
- `vue-script`: ordinary Vue `<script>` blocks.
- `vue-script-setup`: Vue `<script setup>` blocks.

Declarations are assigned by their source position, including imports and
hoisted variables. Both script blocks can be checked independently, regardless
of their order in the SFC. To reserve a name throughout an SFC, include both Vue
regions; a binding in an unchecked ordinary script may still be visible to setup.

Use ESLint's `files` and `ignores` for extensions, directories, and generated or
test files. The rule does not infer regions from the filename.

### `scope`

- `top-level`: bindings belonging to the script's root scope.
- `nested`: bindings belonging to functions, blocks, loops, catches, classes,
  namespaces, and other scopes inside that root.
- `all`: both top-level and nested bindings.

The binding's actual lexical scope determines its depth, rather than the
statement's indentation or AST parent:

```ts
if (ready) {
  var error = getError() // Reported with top-level: var belongs to the root
}

if (ready) {
  const error = getError() // Reported with nested: const belongs to this block
}
```

A class declaration is classified where the class is declared; its internal
self-reference does not count as another nested declaration. A named class or
function expression creates a nested binding for its own name.

### `except`

`catch-parameter` exempts catch bindings, including destructured catch parameters.
It does not exempt other declarations in the catch body:

```ts
// With names: ['error', 'data'], scope: 'all', except: ['catch-parameter']
try {
  run()
} catch ({ error }) {
  const data = error // data is reported
}
```

Catch parameters are nested, so the exception is normally only relevant to
`nested` and `all`. Parameters of `.catch(error => {})` and
`.then(onSuccess, error => {})` are ordinary function parameters and are not
exempted.

### Multiple restrictions

Restrictions match independently in configuration order. The first matching
restriction supplies the diagnostic and custom message. Exceptions apply only
to their own restriction; another restriction can still report the binding.
Overlapping restrictions never produce duplicate reports at the same position.

## Vue and TypeScript configuration

Standalone TypeScript needs `@typescript-eslint/parser`. Vue SFCs need
`vue-eslint-parser`, with the TypeScript parser delegated for script contents:

```js
import parserTypeScript from '@typescript-eslint/parser'
import pluginNtnyq from 'eslint-plugin-ntnyq'
import parserVue from 'vue-eslint-parser'

export default [
  {
    files: ['**/*.{ts,tsx,mts,cts,vue}'],
    plugins: { ntnyq: pluginNtnyq },
    rules: {
      'ntnyq/no-restricted-bindings': [
        'error',
        {
          restrictions: [
            {
              names: ['error'],
              regions: ['script', 'vue-script-setup'],
              except: ['catch-parameter'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: { parser: parserTypeScript },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: { parser: parserTypeScript },
    },
  },
]
```

No TypeScript `project` or `projectService` is needed. The plugin uses the
configured parser's existing AST and scope manager; it does not load a Vue
parser at runtime. See the [Vue parser configuration](https://github.com/vuejs/vue-eslint-parser#parseroptionsparser)
and [ESLint scope manager interface](https://eslint.org/docs/latest/extend/scope-manager-interface).

Vue template references and `v-for` / `v-slot` bindings are ignored. Prop names
can be preserved while renaming their local binding:

```vue
<script setup lang="ts">
// eslint-disable-next-line vue/define-props-destructuring
const { error: requestError } = defineProps<{ error?: string }>()
</script>

<template>
  <p>{{ requestError }}</p>
</template>
```

## :rocket: Version

This rule has not been released yet.

## :mag: Implementation

- [Rule source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/src/rules/no-restricted-bindings.ts)
- [Test source](https://github.com/ntnyq/eslint-plugin-ntnyq/blob/main/tests/rules/no-restricted-bindings.test.ts)
