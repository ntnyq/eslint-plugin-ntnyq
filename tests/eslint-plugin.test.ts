import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const TEST_CWD = fileURLToPath(
  new URL('./fixtures/integrations/eslint-plugin/', import.meta.url),
)

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
        "ntnyq/no-only-tests",
      ]
    `)
  })
})
