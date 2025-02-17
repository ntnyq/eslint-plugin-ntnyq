import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { resolve } from '../scripts/utils'

const TEST_CWD = resolve('tests/fixtures/integrations/eslint-plugin')

describe('Integration test', () => {
  it('should lint without errors', async () => {
    const eslint = new ESLint({ cwd: TEST_CWD })
    const results: ESLint.LintResult[] = await eslint.lintFiles([
      'valid.ts',
      'invalid.ts',
    ])

    expect(results.length).toBe(2)
    expect(results[0].messages.map(v => v.ruleId)).toMatchInlineSnapshot('[]')
    expect(results[1].messages.map(v => v.ruleId)).toMatchInlineSnapshot(`
      [
        "ntnyq/no-member-accessibility",
        "ntnyq/no-member-accessibility",
        "ntnyq/no-member-accessibility",
        "ntnyq/no-member-accessibility",
        "ntnyq/no-member-accessibility",
        "ntnyq/no-member-accessibility",
      ]
    `)
  })
})
