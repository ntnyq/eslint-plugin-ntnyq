import { Linter } from 'eslint'
import { expect, it, vi } from 'vitest'
import noRestrictedBindings from '../../src/rules/no-restricted-bindings'
import { createESLintRule } from '../../src/utils/createESLintRule'

it('applies defaults when ESLint does not merge meta.defaultOptions', () => {
  const create = vi.fn(() => ({}))
  const rule = createESLintRule<[{ names: string[]; enabled: boolean }], never>(
    {
      name: 'option-test',
      meta: {
        type: 'problem',
        docs: { description: 'Test default option merging' },
        schema: [{ type: 'object' }],
        defaultOptions: [{ names: ['default'], enabled: true }],
        messages: {},
      },
      create,
    },
  )
  const linter = new Linter()
  const config = {
    plugins: {
      ntnyq: {
        rules: {
          'no-restricted-bindings': {
            ...noRestrictedBindings,
            meta: { ...noRestrictedBindings.meta!, defaultOptions: undefined },
          },
          'option-test': {
            ...rule,
            meta: { ...rule.meta!, defaultOptions: undefined },
          },
        },
      },
    },
    rules: {
      'ntnyq/no-restricted-bindings': 'error',
      'ntnyq/option-test': ['error', { names: ['custom'] }],
    },
  } satisfies Linter.Config

  expect(linter.verify('const error = 1', config)).toEqual([])
  expect(create).toHaveBeenCalledExactlyOnceWith(expect.anything(), [
    { names: ['custom'], enabled: true },
  ])
})
