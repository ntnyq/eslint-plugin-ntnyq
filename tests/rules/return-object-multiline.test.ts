import parserTypeScript, { parse } from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { expect, it } from 'vitest'
import { plugin } from '../../src'
import rule, { RULE_NAME } from '../../src/rules/return-object-multiline'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/return-object-multiline'

const wrappedObjects = [
  ['(', ') as Value'],
  ['(', ') as unknown as Value'],
  ['(', ') as const as unknown as Value'],
  ['(', ') as Namespace.Value<string>'],
  ['(', ') as { a: number }'],
  ['(', ') as Value | undefined'],
  ['(', ') satisfies Value'],
  ['<Value>(', ')'],
  ['<Value><unknown>(', ')'],
  ['(', ')!'],
  ['((', ') as const) satisfies Value'],
  ['((', ') satisfies Value) as const'],
  ['(<Value>(', ')! as unknown) as Value'],
]

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
    ...wrappedObjects.flatMap(([prefix, suffix]) =>
      ['{}', '{   }', '{\na: 1,\n}', '{ /* empty */\n}'].flatMap(object => [
        { code: `function getValue() { return ${prefix}${object}${suffix} }` },
        { code: `const getValue = () => ${prefix}${object}${suffix}` },
      ]),
    ),
    ...[
      'const value = { a: 1, b: 2 }',
      'function getValue() { return value }',
      'function getValue() { return }',
      'const getValue = () => value',
      'function getValue() { return condition ? { a: 1 } : {} }',
      'const getValue = () => condition ? { a: 1 } : {}',
      'function getValue() { return value || {} }',
      'function getValue() { return [{ a: 1 }] }',
      'function getValue() { return wrap({ a: 1 }) }',
      'function getEmpty() { return {} }',
      'const getEmpty = () => ({})',
      'const getEmpty = () => ({   })',
      'function getEmpty() { return {} as const }',
      'const getEmpty = () => ({} as const)',
      'const getEmpty = async () => (({   }) as const)',
      'function getEmpty() { return /* before */ {} /* after */ as const }',
      'const getEmpty = () => ({ /* comment */\n} as const)',
      'const getEmpty = () => ({ // comment\n})',
      'const getEmpty = () => ({ /* multiline\ncomment */ })',
      'function getValue() { return {\na: 1,\n} as const }',
      'const getValue = () => ({\na: 1,\n} as const)',
      'const getValue = () => (ready ? { a: 1 } as const : {})',
      'function getValue() { return [{ a: 1 }] as const }',
      'const value = { a: 1 } as const',
      'const value = { a: 1 } as Value',
      'function getValue() { return value as unknown as Value }',
      'const getValue = () => (ready ? { a: 1 } : {}) as Value',
      'const getValue = () => (value || { a: 1 }) as Value',
      'const getValue = () => wrap({ a: 1 }) as Value',
      'const getValue = () => [{ a: 1 }] as Value[]',
      'function getEmpty() { return /* before */ {} /* after */ as Value }',
      'function* getValue() { yield { a: 1 } }',
      'function getValue() { return\n{ a: 1 } }',
      'const getValue = () => ({\r\na: 1,\r\nb: 2,\r\n})',
    ].map(code => ({ code })),
    {
      code: $`
        function getValue() {
          return {
            a: 1,
            nested: { b: 2, c: 3 },
            ...rest,
          }
        }
        const getEmpty = () => ({
        })
        const getCommented = () => ({ /* opening */
          a: 1, // trailing
          /* between */ b: 2,
          // closing
        })
        const getMethods = () => ({
          get value() {
            return 1
          },
          run() {},
        })
      `,
    },
    {
      code: $`
        function getValue() {
          return ({
            a: 1,
            b: 2
          })
        }
        const getArrow = () => ({
          a: 1,
        })
        function getEmpty() {
          return {
          }
        }
      `,
    },
  ],
  invalid: [
    ...wrappedObjects.flatMap(([prefix, suffix]) =>
      [
        ['{ a: 1, b: 2 }', '{\na: 1,\nb: 2\n}'],
        ['{ /* empty */ }', '{ /* empty */\n}'],
      ].flatMap(([object, output]) => [
        {
          code: `function getValue() { return ${prefix}${object}${suffix} }`,
          output: `function getValue() { return ${prefix}${output}${suffix} }`,
          errors: ['multiline'],
        },
        {
          code: `const getValue = () => ${prefix}${object}${suffix}`,
          output: `const getValue = () => ${prefix}${output}${suffix}`,
          errors: ['multiline'],
        },
      ]),
    ),
    ...[
      [
        'function getValue() { return { a: 1, b: 2 } }',
        'function getValue() { return {\na: 1,\nb: 2\n} }',
      ],
      [
        'function getValue() { return { a: 1 } as const }',
        'function getValue() { return {\na: 1\n} as const }',
      ],
      [
        'const getValue = () => ({ a: 1, b: 2 } as const)',
        'const getValue = () => ({\na: 1,\nb: 2\n} as const)',
      ],
      [
        'const getValue = async () => (({ a: 1 }) as const)',
        'const getValue = async () => (({\na: 1\n}) as const)',
      ],
      [
        'const getValue = () => (({ a: 1 } as const) as const)',
        'const getValue = () => (({\na: 1\n} as const) as const)',
      ],
      [
        'function getEmpty() { return { /* empty */ } }',
        'function getEmpty() { return { /* empty */\n} }',
      ],
      [
        'function getEmpty() { return { /* empty */ } as const }',
        'function getEmpty() { return { /* empty */\n} as const }',
      ],
      [
        'const getEmpty = () => ({ /* empty */ } as const)',
        'const getEmpty = () => ({ /* empty */\n} as const)',
      ],
      [
        'const getValue = () => ({ ...rest } as const)',
        'const getValue = () => ({\n...rest\n} as const)',
      ],
      [
        '// CRLF\r\nconst getValue = () => ({ a: 1 } as const)',
        '// CRLF\r\nconst getValue = () => ({\r\na: 1\r\n} as const)',
      ],
      [
        'const getValue = () => ({ a: 1 })',
        'const getValue = () => ({\na: 1\n})',
      ],
      [
        'const getValue = async () => ({ a: 1 })',
        'const getValue = async () => ({\na: 1\n})',
      ],
      [
        'const getValue = function () { return { a: 1 } }',
        'const getValue = function () { return {\na: 1\n} }',
      ],
      [
        'const getValue = () => { return { a: 1 } }',
        'const getValue = () => { return {\na: 1\n} }',
      ],
      [
        'class Store { getValue() { return { a: 1 } } }',
        'class Store { getValue() { return {\na: 1\n} } }',
      ],
      [
        'const store = { get value() { return { a: 1 } } }',
        'const store = { get value() { return {\na: 1\n} } }',
      ],
      [
        'function* getValue() { return { a: 1 } }',
        'function* getValue() { return {\na: 1\n} }',
      ],
      [
        'function getValue() { return (({ a: 1 })) }',
        'function getValue() { return (({\na: 1\n})) }',
      ],
      [
        'function getValue() { if (ready) return { a: 1 } }',
        'function getValue() { if (ready) return {\na: 1\n} }',
      ],
      [
        'const getValue = () => ({\na: 1, b: 2,\n})',
        'const getValue = () => ({\na: 1,\nb: 2,\n})',
      ],
      [
        'const getValue = () => ({ a: 1,\nb: 2,\n})',
        'const getValue = () => ({\na: 1,\nb: 2,\n})',
      ],
      [
        'const getValue = () => ({\na: 1,\nb: 2 })',
        'const getValue = () => ({\na: 1,\nb: 2\n})',
      ],
      [
        'const getValue = () => ({ /* empty */ })',
        'const getValue = () => ({ /* empty */\n})',
      ],
      [
        'const getValue = () => ({\n...first, ...second,\n})',
        'const getValue = () => ({\n...first,\n...second,\n})',
      ],
      [
        'const getValue = () => ({\na: 1, /* comment */ b: 2,\n})',
        'const getValue = () => ({\na: 1, /* comment */\nb: 2,\n})',
      ],
      [
        'const getValue = () => ({\na: {\nb: 1\n}, c: 2,\n})',
        'const getValue = () => ({\na: {\nb: 1\n},\nc: 2,\n})',
      ],
      [
        'const getValue = () => ({\r\na: 1, b: 2,\r\n})',
        'const getValue = () => ({\r\na: 1,\r\nb: 2,\r\n})',
      ],
      [
        '// CRLF\r\nconst getValue = () => ({ a: 1 })',
        '// CRLF\r\nconst getValue = () => ({\r\na: 1\r\n})',
      ],
      [
        'const getValue = () => ({ /* before */ a: 1 /* after */, b: 2, /* end */ })',
        'const getValue = () => ({ /* before */\na: 1 /* after */,\nb: 2, /* end */\n})',
      ],
      [
        'const getValue = () => ({ a: 1, // first\nb: 2 })',
        'const getValue = () => ({\na: 1, // first\nb: 2\n})',
      ],
      [
        'const getValue = () => ({ /* before\nvalue */ a: 1 })',
        'const getValue = () => ({ /* before\nvalue */ a: 1\n})',
      ],
      [
        'const getValue = () => ({a: 1,b: 2,})',
        'const getValue = () => ({\na: 1,\nb: 2,\n})',
      ],
      [
        'const getValue = () => ({\nasync run() {}, get value() { return 1 },\n})',
        'const getValue = () => ({\nasync run() {},\nget value() { return 1 },\n})',
      ],
      [
        'const getValue = () => ({ [key]: "a,b", value: `first\nsecond` })',
        'const getValue = () => ({\n[key]: "a,b",\nvalue: `first\nsecond`\n})',
      ],
    ].map(([code, output]) => ({ code, errors: ['multiline'], output })),
    {
      code: $`
        function getValue() {
          return { a: 1 }
        }
      `,
      errors(errors) {
        expect(errors).toHaveLength(1)
        expect(errors[0]).toMatchObject({
          messageId: 'multiline',
          message:
            'Returned objects must use multiline formatting with each property on a separate line.',
          line: 2,
          column: 10,
          endLine: 2,
          endColumn: 18,
        })
        expect(errors[0].fix).toBeDefined()
        expect(errors[0].suggestions).toBeUndefined()
      },
      output: 'function getValue() {\n  return {\na: 1\n}\n}',
    },
    {
      code: $`
        function getValue() {
          return {
            nested: { a: 1 },
            getInner: () => ({ b: 2 }),
            getOther() { return {} },
          }
        }
      `,
      errors: ['multiline'],
      output:
        'function getValue() {\n  return {\n    nested: { a: 1 },\n    getInner: () => ({\nb: 2\n}),\n    getOther() { return {} },\n  }\n}',
    },
  ],
})

it('exposes the rule through the plugin and supports the default parser', () => {
  const linter = new Linter()
  const config = {
    plugins: { ntnyq: plugin },
    rules: { [`ntnyq/${RULE_NAME}`]: 'error' },
  } as const

  const result = linter.verifyAndFix(
    'const getValue = () => ({ a: 1 })',
    config,
  )
  expect(result.fixed).toBe(true)
  expect(result.output).toBe('const getValue = () => ({\na: 1\n})')
  expect(result.messages).toEqual([])
  expect(linter.verifyAndFix(result.output, config)).toMatchObject({
    fixed: false,
    output: result.output,
    messages: [],
  })
  expect(linter.verify('const getValue = () => ({\na: 1,\n})', config)).toEqual(
    [],
  )
})

it('fixes nested returned objects without changing tokens or comments', () => {
  const linter = new Linter()
  const config = {
    plugins: { ntnyq: plugin },
    rules: { [`ntnyq/${RULE_NAME}`]: 'error' },
  } as const
  const code =
    'function getValue() { return { nested: { keep: 1 }, child: () => ({ /* child */ ...rest, [key]: `first\nsecond` }) } }'
  const result = linter.verifyAndFix(code, config)

  expect(result.fixed).toBe(true)
  expect(result.messages).toEqual([])
  expect(result.output).toBe(
    'function getValue() { return {\nnested: { keep: 1 },\nchild: () => ({ /* child */\n...rest,\n[key]: `first\nsecond`\n})\n} }',
  )

  const before = parse(code, { tokens: true, comment: true })
  const after = parse(result.output, { tokens: true, comment: true })
  expect(after.tokens?.map(({ type, value }) => ({ type, value }))).toEqual(
    before.tokens?.map(({ type, value }) => ({ type, value })),
  )
  expect(after.comments?.map(({ type, value }) => ({ type, value }))).toEqual(
    before.comments?.map(({ type, value }) => ({ type, value })),
  )
  expect(linter.verifyAndFix(result.output, config)).toMatchObject({
    fixed: false,
    output: result.output,
    messages: [],
  })
})

it('preserves nested TypeScript wrappers and comments and produces an idempotent fix', () => {
  const linter = new Linter()
  const config = {
    languageOptions: { parser: parserTypeScript },
    plugins: { ntnyq: plugin },
    rules: { [`ntnyq/${RULE_NAME}`]: 'error' },
  } as const
  const code =
    'function getValue() { return ({ /* before */ a: 1, empty: () => ({} as unknown as Value) /* after */ })! as const /* assertion */ as unknown as Value satisfies Value }'
  const result = linter.verifyAndFix(code, config)

  expect(result.fixed).toBe(true)
  expect(result.messages).toEqual([])
  expect(result.output).toBe(
    'function getValue() { return ({ /* before */\na: 1,\nempty: () => ({} as unknown as Value) /* after */\n})! as const /* assertion */ as unknown as Value satisfies Value }',
  )

  const before = parse(code, { tokens: true, comment: true })
  const after = parse(result.output, { tokens: true, comment: true })
  expect(after.tokens?.map(({ type, value }) => ({ type, value }))).toEqual(
    before.tokens?.map(({ type, value }) => ({ type, value })),
  )
  expect(after.comments?.map(({ type, value }) => ({ type, value }))).toEqual(
    before.comments?.map(({ type, value }) => ({ type, value })),
  )
  expect(linter.verifyAndFix(result.output, config)).toMatchObject({
    fixed: false,
    output: result.output,
    messages: [],
  })
})
