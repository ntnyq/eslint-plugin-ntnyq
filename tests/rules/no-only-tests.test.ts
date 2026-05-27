import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/no-only-tests'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/no-only-tests'

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
    {
      description: 'default-valid-blocks',
      filename: 'default-valid-blocks.ts',
      code: $`
        describe('some describe block', () => {})
        it('some assertion', () => {})
      `,
    },
    {
      description: 'allow-other-only',
      filename: 'allow-other-only.ts',
      code: $`
        other.only('an other block', () => {})
        testResource.only('a test resource block', () => {})
      `,
    },
    {
      description: 'allow-identifier-only-key',
      filename: 'allow-identifier-only-key.ts',
      code: $`
        const args = { only: 'test' }
      `,
    },
    {
      description: 'exclude-with-block-options',
      filename: 'exclude-with-block-options.ts',
      code: $`
        test.only('options will exclude this', () => {})
      `,
      options: {
        block: ['it'],
      },
    },
    {
      description: 'exclude-with-focus-options',
      filename: 'exclude-with-focus-options.ts',
      code: $`
        test.only('options will exclude this', () => {})
      `,
      options: {
        focus: ['focus'],
      },
    },
    {
      description: 'exclude-with-functions-options',
      filename: 'exclude-with-functions-options.ts',
      code: $`
        it('options will exclude this', () => {})
      `,
      options: {
        functions: ['fit', 'xit'],
      },
    },
  ],
  invalid: [
    {
      description: 'describe-only',
      filename: 'describe-only.ts',
      code: $`
        describe.only('some describe block', () => {})
      `,
      errors(errors) {
        expect(errors.map(v => v.message)).toEqual([
          'describe.only not permitted',
        ])
      },
    },
    {
      description: 'custom-focus',
      filename: 'custom-focus.ts',
      code: $`
        test.focus('an alternative focus function', () => {})
      `,
      options: {
        focus: ['focus'],
      },
      errors(errors) {
        expect(errors.map(v => v.message)).toEqual(['test.focus not permitted'])
      },
    },
    {
      description: 'wildcard-block',
      filename: 'wildcard-block.ts',
      code: $`
        testResource.only('a test resource block', () => {})
      `,
      options: {
        block: ['test*'],
      },
      errors(errors) {
        expect(errors.map(v => v.message)).toEqual([
          'testResource.only not permitted',
        ])
      },
    },
    {
      description: 'functions-option',
      filename: 'functions-option.ts',
      code: $`
        xit('no skipped tests', () => {})
      `,
      options: {
        functions: ['fit', 'xit'],
      },
      errors(errors) {
        expect(errors.map(v => v.message)).toEqual(['xit not permitted'])
      },
    },
    {
      description: 'fix-default-only',
      filename: 'fix-default-only.ts',
      code: $`
        it.only('some assertion', () => {})
      `,
      options: {
        fix: true,
      },
      errors(errors) {
        expect(errors.map(v => v.message)).toEqual(['it.only not permitted'])
      },
      output(output) {
        expect(output).toBe(`it('some assertion', () => {})`)
      },
    },
    {
      description: 'fix-chained-call-path',
      filename: 'fix-chained-call-path.ts',
      code: $`
        it.default.before(console.log).only('some describe block', () => {})
      `,
      options: {
        fix: true,
      },
      errors(errors) {
        expect(errors.map(v => v.message)).toEqual([
          'it.default.before.only not permitted',
        ])
      },
      output(output) {
        expect(output).toBe(
          `it.default.before(console.log)('some describe block', () => {})`,
        )
      },
    },
  ],
})
