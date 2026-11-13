import { Linter } from 'eslint'
import { expect, it } from 'vitest'
import noOnlyTests from '../../src/rules/no-only-tests'
import noRestrictedBindings from '../../src/rules/no-restricted-bindings'

it('applies defaults when ESLint does not merge meta.defaultOptions', () => {
  const linter = new Linter()
  const config = {
    plugins: {
      ntnyq: {
        rules: {
          'no-only-tests': {
            ...noOnlyTests,
            meta: { ...noOnlyTests.meta!, defaultOptions: undefined },
          },
          'no-restricted-bindings': {
            ...noRestrictedBindings,
            meta: { ...noRestrictedBindings.meta!, defaultOptions: undefined },
          },
        },
      },
    },
    rules: {
      'ntnyq/no-only-tests': ['error', { fix: true }],
      'ntnyq/no-restricted-bindings': 'error',
    },
  } satisfies Linter.Config

  expect(linter.verifyAndFix('test.only("case", () => {})', config)).toEqual({
    fixed: true,
    messages: [],
    output: 'test("case", () => {})',
  })
  expect(linter.verify('const error = 1', config)).toEqual([])
})
