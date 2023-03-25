import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint'
import { it } from 'vitest'
import rule, { RULE_NAME } from './no-console-log'

const validCases = ['console.log', `console.info('hello')`]
const invalidCase = [[`console.log('hello world')`, ``]]

it('no-console-log', () => {
  const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  })

  ruleTester.run(RULE_NAME, rule, {
    valid: validCases,
    invalid: invalidCase.map(i => ({
      code: i[0],
      output: i[1],
      errors: [{ messageId: 'noConsoleLog' }],
    })),
  })
})
