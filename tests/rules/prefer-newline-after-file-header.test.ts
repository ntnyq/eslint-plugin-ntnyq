import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/prefer-newline-after-file-header'
import { $, run } from '../internal'

run({
  name: RULE_NAME,
  rule,
  valid: [
    {
      description: 'no-file-header',
      filename: 'no-file-header.ts',
      code: $`
        export const foobar = 'foobar'
      `,
    },
    {
      description: 'no-node',
      filename: 'no-node.ts',
      code: $`
        /**
         * @file eslint config
         */
      `,
    },
    {
      description: 'not-start-header',
      filename: 'not-start-header.ts',
      code: $`
           /**
        * @file eslint config
        */
      `,
    },
    {
      description: 'not-top-header',
      filename: 'not-top-header.ts',
      code: $`
        export const foobar = 'foobar'
        
        /**
        * @file eslint config
        */
      `,
    },
    {
      description: 'line-comment',
      filename: 'line-comment.ts',
      code: $`
        // file eslint config
        export const foobar = 'foobar'
      `,
    },
    {
      description: 'one-newline',
      filename: 'one-newline.ts',
      code: $`
        /**
         * @file eslint config
         */
        
        export const foobar = 'foobar'
      `,
    },
    {
      description: 'not-file-header-jsdoc',
      filename: 'not-file-header-jsdoc.ts',
      code: $`
        /**
         * @foobar eslint config
         */
        
        export const foobar = 'foobar'
      `,
    },
    {
      description: 'multi-newline',
      filename: 'multi-newline.ts',
      code: $`
        /**
         * @file eslint config
         */
        
        
        
        export const foobar = 'foobar'
      `,
    },
  ],
  invalid: [
    {
      description: 'no-newline',
      filename: 'no-newline.ts',
      code: $`
        /**
         * @file eslint config
         */
        export const foobar = 'foobar'
      `,
      output(output) {
        expect(output).toMatchSnapshot('output')
      },
      errors(errors) {
        expect(errors).toMatchSnapshot('errors')
      },
    },
    {
      description: 'same-line',
      filename: 'same-line.ts',
      code: $`
        /**
         * @file eslint config
         */export const foobar = 'foobar'
      `,
      output(output) {
        expect(output).toMatchSnapshot('output')
      },
      errors(errors) {
        expect(errors).toMatchSnapshot('errors')
      },
    },
    {
      description: 'user-defined-jsdoc',
      filename: 'user-defined-jsdoc.ts',
      options: {
        tags: ['@foobar'],
      },
      code: $`
        /**
         * @foobar eslint config
         */export const foobar = 'foobar'
      `,
      output(output) {
        expect(output).toMatchSnapshot('output')
      },
      errors(errors) {
        expect(errors).toMatchSnapshot('errors')
      },
    },
  ],
})
