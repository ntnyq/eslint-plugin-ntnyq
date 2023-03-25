import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint'
import { it } from 'vitest'
import rule, { RULE_NAME } from './prefer-if-newline'

const validCases = [
  `if (true)
    console.log('hello world')
  `,
  `if (true) {
    console.log('hello world')
  }`,
]
const invalidCase = [
  [`if (true) console.log('hello world')`, `if (true) \nconsole.log('hello world')`],
]

it('prefer-if-newline', () => {
  const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  })

  ruleTester.run(RULE_NAME, rule, {
    valid: validCases,
    invalid: invalidCase.map(i => ({
      code: i[0],
      output: i[1],
      errors: [{ messageId: 'preferIfNewline' }],
    })),
  })
})
