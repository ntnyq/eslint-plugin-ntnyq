import { readFileSync } from 'node:fs'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import { eslintConfig } from '../docs/.vitepress/config/eslint'

const markdown = readFileSync(
  new URL('../docs/rules/padding-line-between-statements.md', import.meta.url),
  'utf8',
)
const linter = new Linter()

describe('padding rule documentation diagnostics', () => {
  it.each(['correct', 'incorrect'])('checks the %s example', type => {
    const container = markdown.split(`::: ${type}\n`)[1]?.split('\n:::')[0]
    const code = container?.match(/```ts[^\n]*\n([\s\S]*?)\n```/u)?.[1]
    expect(code).toBeDefined()

    const messages = linter.verify(code ?? '', eslintConfig, {
      filename: 'example.ts',
    })

    expect(
      messages.map(({ ruleId, messageId, line }) => ({
        ruleId,
        messageId,
        line,
      })),
    ).toEqual(
      type === 'correct'
        ? []
        : [
            {
              ruleId: 'ntnyq/padding-line-between-statements',
              messageId: 'expectedBlankLine',
              line: 3,
            },
            {
              ruleId: 'ntnyq/padding-line-between-statements',
              messageId: 'expectedBlankLine',
              line: 6,
            },
          ],
    )
  })
})
