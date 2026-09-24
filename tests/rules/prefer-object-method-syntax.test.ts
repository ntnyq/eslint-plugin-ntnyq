import parserTypeScript from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { expect, it } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/prefer-object-method-syntax'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/prefer-object-method-syntax'

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
    {
      code: $`
        const object = {
          'Program > YAMLPair': (node: unknown) => {
            report(node)
          },
          'Program:exit': function () {},
          'quoted': async function () {},
          ['computed']: function* () {},
          'lexical': () => {
            return this.value
          },
        }
      `,
      options: {
        allowArrowFunctions: 'singleLineOnly',
        avoidQuotes: true,
        fix: true,
      },
    },
    {
      code: $`
        const dispose = () => {}
        const object = {
          dispose,
          method() {},
          async asyncMethod() {},
          *generatorMethod() {},
          async *asyncGeneratorMethod() {},
          get value() {
            return 1
          },
          set value(value) {
            console.log(value)
          },
        }
      `,
    },
    {
      code: $`
        const object = {
          dispose: () => {},
        }
      `,
      options: {
        allowArrowFunctions: true,
      },
    },
    {
      code: $`
        const object = {
          dispose: () => {},
        }
      `,
      options: {
        allowArrowFunctions: 'singleLineOnly',
      },
    },
    {
      code: $`
        const object = {
          computed: () => value,
          get: function () {},
          ['set']: function () {},
        }
      `,
      options: {
        allowedPropertyNames: ['computed', 'get', 'set'],
      },
    },
    {
      code: $`
        const object = {
          __proto__: function () {},
        }
      `,
    },
    {
      code: $`
        const object = {
          callback: (() => {}) as () => void,
        }
      `,
    },
  ],
  invalid: [
    {
      code: $`
        const config = {
          vite: () => ({
            css: { devSourcemap: true },
          }),
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preferMethodSyntax'],
      output: $`
        const config = {
          vite() { return ({
            css: { devSourcemap: true },
          }) },
        }
      `,
    },
    {
      code: $`
        const object = {
          'Program:exit': () => {
            cleanup()
          },
          ['quoted']: async function () {},
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preferMethodSyntax', 'preferMethodSyntax'],
      output: $`
        const object = {
          'Program:exit'() {
            cleanup()
          },
          async ['quoted']() {},
        }
      `,
    },
    {
      code: $`
        const object = {
          'Program:exit': () => {},
          dispose: () => {},
          1: async function () {},
          [methodName]: async function () {},
        }
      `,
      options: {
        avoidQuotes: true,
        fix: true,
      },
      errors: [
        'preferMethodSyntax',
        'preferMethodSyntax',
        'preferMethodSyntax',
      ],
      output: $`
        const object = {
          'Program:exit': () => {},
          dispose() {},
          async 1() {},
          async [methodName]() {},
        }
      `,
    },
    {
      code: $`
        const object = {
          foo: function () {},
          dispose: () => {},
        }
      `,
      errors(errors) {
        expect(errors.map(error => error.messageId)).toEqual([
          'preferMethodSyntax',
          'preferMethodSyntax',
        ])
        expect(
          errors.flatMap(
            error =>
              error.suggestions?.map(suggestion => suggestion.desc) ?? [],
          ),
        ).toEqual([
          "Convert 'foo' to object method syntax; the result will not be constructible.",
          "Convert 'dispose' to object method syntax.",
        ])
      },
      output: null,
    },
    {
      code: $`
        const object = {
          asyncTask: async function <T>(value: T): Promise<T> {
            return value
          },
          iterator: function* () {
            yield 1
          },
          stream: async function* () {
            yield 1
          },
          dispose: async force => {
            cleanup(force)
          },
        }
      `,
      options: {
        fix: true,
      },
      errors: [
        'preferMethodSyntax',
        'preferMethodSyntax',
        'preferMethodSyntax',
        'preferMethodSyntax',
      ],
      output: $`
        const object = {
          async asyncTask<T>(value: T): Promise<T> {
            return value
          },
          *iterator() {
            yield 1
          },
          async *stream() {
            yield 1
          },
          async dispose(force) {
            cleanup(force)
          },
        }
      `,
    },
    {
      code: $`
        const name = computed({
          get: () => model.value.name,
          read: () =>
            // Keep this expression comment.
            model.value.name,
          format: (
            value: string,
          ) => value.trim(),
          set: value => {
            model.value = { ...model.value, name: value }
          },
        })
      `,
      options: {
        allowArrowFunctions: 'singleLineOnly',
        fix: true,
      },
      errors: [
        'preferMethodSyntax',
        'preferMethodSyntax',
        'preferMethodSyntax',
      ],
      output: $`
        const name = computed({
          get: () => model.value.name,
          read() {
            // Keep this expression comment.
            return model.value.name
          },
          format(
            value: string,
          ) { return value.trim() },
          set(value) {
            model.value = { ...model.value, name: value }
          },
        })
      `,
    },
    {
      code: $`
        const object = {
          Foo: function () {},
        }
      `,
      options: {
        fix: true,
      },
      errors(errors) {
        expect(errors).toHaveLength(1)
        expect(errors[0]?.suggestions?.[0]?.desc).toBe(
          "Convert 'Foo' to object method syntax; the result will not be constructible.",
        )
      },
      output: null,
    },
    {
      code: $`
        class Controller {
          document = document
          create() {
            return {
              dispose: () => {
                this.document.removeEventListener('click', listener)
              },
            }
          }
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preserveLexicalBindings'],
      output: null,
    },
    {
      code: $`
        function create() {
          return {
            inspect: () => {
              console.log(arguments, new.target)
            },
          }
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preserveLexicalBindings'],
      output: null,
    },
    {
      code: $`
        const object = {
          inspect: () => {
            return arguments
          },
          evaluate: () => {
            return eval('this')
          },
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preserveLexicalBindings', 'preserveLexicalBindings'],
      output: null,
    },
    {
      code: $`
        class Derived extends Base {
          create() {
            return {
              run: () => {
                super.run()
              },
            }
          }
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preserveLexicalBindings'],
      output: null,
    },
    {
      code: $`
        const object = {
          factory: () => {
            return function () {
              return this
            }
          },
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preferMethodSyntax'],
      output: $`
        const object = {
          factory() {
            return function () {
              return this
            }
          },
        }
      `,
    },
    {
      code: $`
        const object = {
          factory: () => {
            return () => this.value
          },
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preserveLexicalBindings'],
      output: null,
    },
    {
      code: $`
        const object = {
          calculate: value => value * 2,
          recursive: function inner() {
            return inner()
          },
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preferMethodSyntax', 'preferMethodSyntax'],
      output: null,
    },
    {
      code: $`
        const object = {
          [methodName]: async function () {},
          ['__proto__']: async function () {},
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preferMethodSyntax', 'preferMethodSyntax'],
      output: $`
        const object = {
          async [methodName]() {},
          async ['__proto__']() {},
        }
      `,
    },
    {
      code: $`
        const object = {
          dispose: /* keep this comment */ () => {},
          update: value /* keep this comment too */ => {},
          read: () =>
            result /* keep this trailing comment */,
        }
      `,
      options: {
        fix: true,
      },
      errors: [
        'preferMethodSyntax',
        'preferMethodSyntax',
        'preferMethodSyntax',
      ],
      output: null,
    },
  ],
})

it.each([
  '({\n  enabled: true,\n})',
  '(({\n  enabled: true,\n}))',
  '(\n  first(),\n  second()\n)',
  '(/* keep this comment */\n  value\n)',
  '(// keep this comment\n  value\n)',
])('should preserve parenthesized arrow expressions: %s', expression => {
  const linter = new Linter()
  const config = {
    languageOptions: {
      parser: parserTypeScript,
    },
    plugins: {
      ntnyq: {
        rules: {
          [RULE_NAME]: rule,
        },
      },
    },
    rules: {
      [`ntnyq/${RULE_NAME}`]: ['error', { fix: true }],
    },
  } satisfies Linter.Config
  const result = linter.verifyAndFix(
    `const config = { vite: () => ${expression} }`,
    config,
  )

  expect(result.fixed).toBe(true)
  expect(result.messages).toEqual([])
  expect(result.output).toBe(
    `const config = { vite() { return ${expression} } }`,
  )
  expect(linter.verifyAndFix(result.output, config)).toEqual({
    fixed: false,
    messages: [],
    output: result.output,
  })
})

it.each([
  $`
    'Program > YAMLPair': (node: unknown) => {
      report(node)
    }
  `,
  $`
    'Program > YAMLPair': function (node: unknown) {
      report(node)
    }
  `,
  $`
    ['Program > YAMLPair']: async function (node: unknown) {
      report(node)
    }
  `,
])('should coexist with object-shorthand avoidQuotes: %s', property => {
  const linter = new Linter()
  const code = `const listeners = { ${property} }`
  const result = linter.verifyAndFix(code, {
    languageOptions: {
      parser: parserTypeScript,
    },
    plugins: {
      ntnyq: {
        rules: {
          [RULE_NAME]: rule,
        },
      },
    },
    rules: {
      'object-shorthand': ['error', 'always', { avoidQuotes: true }],
      [`ntnyq/${RULE_NAME}`]: [
        'error',
        {
          allowArrowFunctions: 'singleLineOnly',
          avoidQuotes: true,
          fix: true,
        },
      ],
    },
  })

  expect(result.messages).toEqual([])
  expect(result.fixed).toBe(false)
  expect(result.output).toBe(code)
})
