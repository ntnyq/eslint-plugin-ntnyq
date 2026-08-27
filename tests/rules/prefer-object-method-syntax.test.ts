import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/prefer-object-method-syntax'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/prefer-object-method-syntax'

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
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
        }
      `,
      options: {
        fix: true,
      },
      errors: ['preferMethodSyntax', 'preferMethodSyntax'],
      output: null,
    },
  ],
})
