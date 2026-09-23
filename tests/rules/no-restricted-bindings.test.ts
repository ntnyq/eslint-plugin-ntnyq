import parserTypeScript from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import parserVue from 'vue-eslint-parser'
import { plugin } from '../../src'
import rule, { RULE_NAME } from '../../src/rules/no-restricted-bindings'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/no-restricted-bindings'

const topLevel: Options[0] = { restrictions: [{ names: ['error'] }] }
const allScopes: Options[0] = {
  restrictions: [{ names: ['error'], scope: 'all' }],
}
const exceptCatch: Options[0] = {
  restrictions: [
    { names: ['error'], scope: 'all', except: ['catch-parameter'] },
  ],
}
const setupOnly: Options[0] = {
  restrictions: [{ names: ['error'], regions: ['vue-script-setup'] }],
}

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
    { code: 'const error = 1' },
    { code: 'const error = 1', options: { restrictions: [] } },
    ...[
      'const Error = 1; const requestError = 2',
      'const { error: requestError } = response',
      'import { error as logError } from "logger"',
      'const state = { error: 1 }; state.error = 2',
      'const state = { error() {}, get error() { return 1 } }',
      'error = 1; console.log(error)',
      'error: while (true) { break error }',
      'export { requestError as error }',
      'export { error } from "logger"',
      'export * as error from "logger"',
      'type error = string',
      'interface error { error: string }',
      'function run<error>() {}',
      'type Fn = <error>(value: error) => error',
      'type Fn = (error: string) => void',
      'type Constructor = new (error: string) => object',
      'interface Api { (error: string): void; new (error: string): object; run(error: string): void }',
      'interface Api { [error: string]: unknown }',
      'type Conditional<T> = T extends infer error ? error : never',
      'type Mapped = { [error in "a" | "b"]: string }',
      'declare function run(error: string): void',
      'abstract class Api { abstract run(error: string): void }',
      'import type error from "logger"',
      'import type { error } from "logger"',
      'import type * as error from "logger"',
      'import { type error } from "logger"',
      'import type error = require("logger")',
      'enum Status { error }',
      'class Api { error = 1; errorMethod() {} }',
    ].map(code => ({ code, options: allScopes })),
    ...[
      'function run(error: unknown) { const requestError = error }',
      'function run() { const error = 1 }',
      '{ const error = 1 }',
      'for (let error = 0; error < 1; error++) {}',
      'try {} catch (error) {}',
      'const run = function error() {}',
      'const Api = class error {}',
      'namespace Api { export const error = 1 }',
    ].map(code => ({ code, options: topLevel })),
    ...[
      'try {} catch (error) { console.log(error) }',
      'try {} catch ({ error }) {}',
      'try {} catch ({ cause: { error = 1 } }) {}',
      'try {} catch ([...error]) {}',
    ].map(code => ({ code, options: exceptCatch })),
    {
      code: 'class error {}',
      options: { restrictions: [{ names: ['error'], scope: 'nested' }] },
    },
    { code: 'const error = 1', options: setupOnly },
    {
      code: 'function run(this: object) {}',
      options: { restrictions: [{ names: ['this'], scope: 'all' }] },
    },
  ],
  invalid: [
    ...[
      'const error = 1; console.log(error, error)',
      'let error: string',
      'var error',
      'const { error } = response',
      'const { cause: { error = 1 } } = response',
      'const { ...error } = response',
      'const [error = 1] = response',
      'const [...error] = response',
      'const { cause: error } = response',
      'import error from "logger"',
      'import * as error from "logger"',
      'import { error } from "logger"',
      'import { log as error } from "logger"',
      'import error = require("logger")',
      'function error() {}',
      'class error {}',
      'enum error { Failure }',
      'namespace error { export const code = 1 }',
      'declare const error: unknown',
      'declare function error(): void',
      'export default function error() {}',
      'export default class error {}',
      'if (ready) { var error = 1 }',
      'for (var error of errors) {}',
      'try {} catch (cause) { var error = cause }',
      'interface error {}; const error = 1',
    ].map(code => ({ code, options: topLevel, errors: ['restrictedBinding'] })),
    ...[
      'function run(error: unknown) {}',
      'function run({ error = 1 }) {}',
      'function run() { let error }',
      'const run = function error() {}',
      'const Api = class error {}',
      'promise.catch(error => {})',
      'promise.then(onSuccess, error => {})',
      'try {} catch (cause) { const error = cause }',
      'try {} catch ({ error: cause }) { let error }',
      'namespace Api { export const error = 1 }',
      'class Api { static { const error = 1 } }',
      'class Api { constructor(public error: string) {} }',
      '{ let error }',
      'for (const error of errors) {}',
      'function run() { class error {} }',
    ].map(code => ({
      code,
      options: exceptCatch,
      errors: ['restrictedBinding'],
    })),
    {
      code: 'try {} catch ({ cause: { error } }) {}',
      options: allScopes,
      errors: ['restrictedBinding'],
    },
    {
      code: 'class error {}',
      options: allScopes,
      errors: ['restrictedBinding'],
    },
    {
      code: 'const error = 1; function run(error: unknown) { { const error = 2 } }',
      options: { restrictions: [{ names: ['error'], scope: 'nested' }] },
      errors: ['restrictedBinding', 'restrictedBinding'],
    },
    {
      code: 'var error = 1; var error = 2',
      options: topLevel,
      errors: ['restrictedBinding', 'restrictedBinding'],
    },
    {
      code: 'class error {} namespace error { export const code = 1 }',
      options: allScopes,
      errors: ['restrictedBinding', 'restrictedBinding'],
    },
    {
      code: 'const error = 1; const data = 2',
      options: { restrictions: [{ names: ['error', 'data'] }] },
      errors: ['restrictedBinding', 'restrictedBinding'],
    },
    {
      code: 'const error: string = "failure"',
      options: {
        restrictions: [
          {
            names: ['error'],
            regions: ['vue-script-setup'],
            message: 'Wrong region.',
          },
          { names: ['error'], message: 'Use requestError.' },
          { names: ['error'], scope: 'all', message: 'Later restriction.' },
        ],
      },
      errors(errors) {
        expect(errors).toHaveLength(1)
        expect(errors[0]).toMatchObject({
          messageId: 'restrictedBinding',
          message:
            "Binding 'error' is not allowed in the top-level scope of script. Use requestError.",
          line: 1,
          column: 7,
          endLine: 1,
          endColumn: 12,
        })
        expect(errors[0].fix).toBeUndefined()
        expect(errors[0].suggestions).toBeUndefined()
      },
    },
    {
      code: 'try {} catch (error) {}',
      options: {
        restrictions: [
          ...exceptCatch.restrictions,
          { names: ['error'], scope: 'all', message: 'No exceptions here.' },
        ],
      },
      errors(errors) {
        expect(errors).toHaveLength(1)
        expect(errors[0].message).toContain('No exceptions here.')
      },
    },
  ],
})

await run<Options>({
  name: `${RULE_NAME}/vue`,
  rule,
  languageOptions: {
    parser: parserVue,
    parserOptions: { parser: parserTypeScript },
  },
  valid: [
    ...[
      '<script lang="ts">const error = 1</script>',
      '<script lang="ts">const error = 1</script><script setup lang="ts">const requestError = error</script>',
      '<script setup lang="ts">const requestError = error</script><script lang="ts">const error = 1</script>',
      '<script setup lang="ts">function run() { const error = 1 }</script>',
      '<script setup lang="ts">if (ready) { const error = 1 }</script>',
    ].map(code => ({ code, filename: 'Component.vue', options: setupOnly })),
    ...[
      '<script setup lang="ts">const { error: requestError } = defineProps<{ error?: string }>()</script>',
      '<template><div v-for="error in errors" :key="error">{{ error }}</div><Child v-slot="{ error }">{{ error }}</Child></template>',
      '<script setup lang="ts" generic="error">defineProps<{ value: error }>()</script>',
    ].map(code => ({ code, filename: 'Component.vue', options: allScopes })),
    {
      filename: 'Component.vue',
      code: '<script setup>const error = 1</script>',
      options: { restrictions: [{ names: ['error'], regions: ['script'] }] },
    },
    {
      filename: 'Component.vue',
      code: '<script setup>const error = 1</script>',
      options: {
        restrictions: [{ names: ['error'], regions: ['vue-script'] }],
      },
    },
  ],
  invalid: [
    ...[
      '<script setup lang="ts">const error = 1</script>',
      '<script setup>const error = 1</script><template>{{ error }}</template>',
      '<script lang="ts">const normal = 1</script><script setup lang="ts">const error = 1</script>',
      '<script setup lang="ts">const error = 1</script><script lang="ts">const normal = 1</script>',
      '<script lang="ts">const normal = 1</script><script setup lang="ts">import error from "logger"</script>',
      '<script setup lang="ts">const { error } = defineProps<{ error: string }>()</script>',
      '<script setup lang="ts">if (ready) { var error = 1 }</script>',
    ].map(code => ({
      code,
      filename: 'Component.vue',
      options: setupOnly,
      errors: ['restrictedBinding'],
    })),
    {
      filename: 'Component.vue',
      code: '<script lang="ts">const error = 1</script>',
      options: topLevel,
      errors(errors) {
        expect(errors).toHaveLength(1)
        expect(errors[0].message).toContain('top-level scope of vue-script.')
      },
    },
    {
      filename: 'Component.vue',
      code: $`
        <script lang="ts">
        const error = 1
        </script>
        <script setup lang="ts">
        const data = 2
        function run() { const error = 3 }
        </script>
      `,
      options: {
        restrictions: [
          { names: ['error'], regions: ['vue-script'] },
          {
            names: ['data', 'error'],
            regions: ['vue-script-setup'],
            scope: 'all',
          },
        ],
      },
      errors(errors) {
        expect(errors.map(error => [error.line, error.message])).toEqual([
          [
            2,
            "Binding 'error' is not allowed in the top-level scope of vue-script.",
          ],
          [
            5,
            "Binding 'data' is not allowed in the top-level scope of vue-script-setup.",
          ],
          [
            6,
            "Binding 'error' is not allowed in the nested scope of vue-script-setup.",
          ],
        ])
      },
    },
    {
      filename: 'Component.vue',
      code: '<script setup>try {} catch (error) { const data = 1 }</script>',
      options: {
        restrictions: [
          {
            names: ['error', 'data'],
            scope: 'all',
            except: ['catch-parameter'],
          },
        ],
      },
      errors: ['restrictedBinding'],
    },
  ],
})

describe('no-restricted-bindings configuration', () => {
  const linter = new Linter()

  it.each(['module', 'script', 'commonjs'] as const)(
    "supports ESLint's default parser in %s mode",
    sourceType => {
      const messages = linter.verify('var error = 1; class data {}', {
        languageOptions: { sourceType },
        plugins: { ntnyq: plugin },
        rules: {
          [`ntnyq/${RULE_NAME}`]: [
            'error',
            { restrictions: [{ names: ['error', 'data'] }] },
          ],
        },
      })
      expect(messages.map(message => message.messageId)).toEqual([
        'restrictedBinding',
        'restrictedBinding',
      ])
    },
  )

  it.each([
    { restrictions: [{ names: [] }] },
    { restrictions: [{ names: [''] }] },
    { restrictions: [{ names: ['error', 'error'] }] },
    { restrictions: [{ names: ['error'], scope: 'function' }] },
    { restrictions: [{ names: ['error'], regions: [] }] },
    { restrictions: [{ names: ['error'], regions: ['template'] }] },
    { restrictions: [{ names: ['error'], except: ['parameter'] }] },
    { restrictions: [{ names: ['error'], message: 123 }] },
    { restrictions: [{ names: ['error'], scopes: ['all'] }] },
    { restrictions: [{ scope: 'all' }] },
    { restrictions: [], unknown: true },
  ])('rejects invalid configuration: %j', options => {
    expect(() =>
      linter.verify('', {
        plugins: { ntnyq: plugin },
        rules: { [`ntnyq/${RULE_NAME}`]: ['error', options] },
      }),
    ).toThrow()
  })

  it('keeps configured global names without declarations out of diagnostics', () => {
    const messages = linter.verify('console.log(error)', {
      languageOptions: { globals: { error: 'readonly' } },
      plugins: { ntnyq: plugin },
      rules: { [`ntnyq/${RULE_NAME}`]: ['error', allScopes] },
    })
    expect(messages).toEqual([])
  })
})
