import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/no-duplicate-exports'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/no-duplicate-exports'

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [],
  invalid: [
    {
      description: 'export-all',
      filename: 'export-all.ts',
      code: $`
        export * from './foobar'
        export * from './foobar'
        export * as foobar from './foobar'
        export * as foobar from './foobar'
        export type * from './foobar'
        export type * from './foobar'
        export type * as Foobar from './foobar'
        export type * as Foobar from './foobar'
      `,
      errors(errors) {
        expect(errors).toMatchSnapshot('errors')
      },
      output(output) {
        expect(output).toMatchSnapshot('output')
      },
    },
    {
      description: 'named-export',
      filename: 'named-export.ts',
      code: $`
        export { foo, bar as baz } from './foobar'
        export { bar } from './foobar'
        export { type Bar } from './foobar'
        export type { Foo } from './foobar'
        export { default as 'module.exports' } from './foobar'
      `,
      errors(errors) {
        expect(errors).toMatchSnapshot('errors')
      },
      output(output) {
        expect(output).toMatchSnapshot('output')
      },
    },
    {
      description: 'inline-type-export',
      filename: 'inline-type-export.ts',
      code: $`
        export type { Foo } from './foobar'
        export { bar } from './foobar'
      `,
      options: {
        style: 'inline',
      },
      errors: ['multiSameSourceNamed', 'multiSameSourceNamed'],
      output(output) {
        expect(output).toBe(`export { type Foo, bar } from './foobar'\n`)
      },
    },
    {
      description: 'preserve-comments',
      filename: 'preserve-comments.ts',
      code: $`
        export { /* keep foo */ foo } from './foobar'
        export { /* keep bar */ bar } from './foobar'
      `,
      errors: ['multiSameSourceNamed', 'multiSameSourceNamed'],
      output: null,
    },
    {
      description: 'preserve-import-attributes',
      filename: 'preserve-import-attributes.ts',
      code: $`
        export { foo } from './data.json' with { type: 'json' }
        export { bar } from './data.json' with { type: 'json' }
      `,
      errors: ['multiSameSourceNamed', 'multiSameSourceNamed'],
      output(output) {
        expect(output).toBe(
          `export { foo, bar } from './data.json' with { type: 'json' }\n`,
        )
      },
    },
    {
      description: 'preserve-source-quote',
      filename: 'preserve-source-quote.ts',
      code: $`
        export { foo } from "pkg'name"
        export { bar } from "pkg'name"
      `,
      errors: ['multiSameSourceNamed', 'multiSameSourceNamed'],
      output(output) {
        expect(output).toBe(`export { foo, bar } from "pkg'name"\n`)
      },
    },
  ],
})
