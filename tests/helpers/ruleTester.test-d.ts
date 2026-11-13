import { assertType } from 'vitest'
import type { runRuleTests } from './ruleTester'

type Options = [{ fix?: boolean }]
type TestCases = Parameters<typeof runRuleTests<Options, 'unexpected'>>[0]

assertType<TestCases>({
  valid: [{ code: '', options: { fix: true } }],
  invalid: [{ code: '', options: [{ fix: false }], errors: ['unexpected'] }],
})

assertType<TestCases>({
  valid: [
    {
      code: '',
      options: {
        // @ts-expect-error Unknown rule options must be rejected.
        typo: true,
      },
    },
  ],
})

assertType<TestCases>({
  valid: [
    {
      code: '',
      // @ts-expect-error Option values must match the rule's declared types.
      options: { fix: 'true' },
    },
  ],
})

assertType<TestCases>({
  invalid: [
    {
      code: '',
      errors: [
        // @ts-expect-error Diagnostics must use a declared message ID.
        'unknown',
      ],
    },
  ],
})

assertType<Parameters<typeof runRuleTests<[]>>[0]>({
  valid: [
    {
      code: '',
      // @ts-expect-error Rules without options must reject object options.
      options: { fix: true },
    },
  ],
})
