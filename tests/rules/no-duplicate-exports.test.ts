import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/no-duplicate-exports'
import { $, run } from '../internal'

run({
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
  ],
})
