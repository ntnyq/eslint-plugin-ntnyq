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
      output(output) {
        expect(output).toMatchSnapshot()
      },
      errors(errors) {
        expect(errors).toMatchSnapshot()
      },
    },
    // {
    //   filename: 'named-export.ts',
    //   code: $`
    //     export { foo } from './foobar'
    //     export { bar } from './foobar'
    //   `,
    //   output: $`
    //     export { foo, bar } from './foobar'
    //   `,
    //   errors(errors) {
    //     expect(errors).toMatchInlineSnapshot()
    //   },
    // },
  ],
})
