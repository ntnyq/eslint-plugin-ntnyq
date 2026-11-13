import { createRequire } from 'node:module'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../src'

// ESLint 9.5 predates bundled declarations; use the shared Linter API at this
// CommonJS boundary while executing the actual minimum supported version.
const { Linter: LegacyLinter } = createRequire(import.meta.url)(
  'eslint-v9',
) as typeof import('eslint')

describe.each([
  { version: LegacyLinter.version, Linter: LegacyLinter },
  { version: Linter.version, Linter },
])('ESLint $version compatibility', ({ Linter }) => {
  const linter = new Linter()

  it('allows no-restricted-bindings without explicit options', () => {
    expect(
      linter.verify('const error = 1', {
        plugins: { ntnyq: plugin },
        rules: { 'ntnyq/no-restricted-bindings': 'error' },
      }),
    ).toEqual([])
  })

  it('merges partial options before reporting and fixing focused tests', () => {
    expect(
      linter.verifyAndFix('test.only("case", () => {})', {
        plugins: { ntnyq: plugin },
        rules: { 'ntnyq/no-only-tests': ['error', { fix: true }] },
      }),
    ).toEqual({
      fixed: true,
      messages: [],
      output: 'test("case", () => {})',
    })
  })

  it('honors explicit array options while keeping other defaults', () => {
    const messages = linter.verify('custom.only(); test.only()', {
      plugins: { ntnyq: plugin },
      rules: { 'ntnyq/no-only-tests': ['error', { block: ['custom'] }] },
    })
    expect(messages.map(message => message.message)).toEqual([
      'custom.only not permitted',
    ])
  })

  it('keeps CRLF template fixes stable in the default parser', () => {
    const config = {
      plugins: { ntnyq: plugin },
      rules: { 'ntnyq/indent-unindent': 'error' },
    } satisfies import('eslint').Linter.Config
    const valid = 'const value = unindent`\r\n  first\r\n\r\n  second\r\n`'
    expect(linter.verifyAndFix(valid, config)).toEqual({
      fixed: false,
      messages: [],
      output: valid,
    })

    const invalid =
      'function render() {\r\n  return unindent`\r\nfirst\r\n \r\nsecond\r\n  `\r\n}'
    const output =
      'function render() {\r\n  return unindent`\r\n    first\r\n\r\n    second\r\n  `\r\n}'
    expect(linter.verifyAndFix(invalid, config)).toEqual({
      fixed: true,
      messages: [],
      output,
    })
    expect(linter.verifyAndFix(output, config)).toEqual({
      fixed: false,
      messages: [],
      output,
    })
  })

  it('preserves block-scoped arguments in the default parser', () => {
    const code =
      'function create() { { const arguments = 42; return { read: () => { return arguments } } } }'
    const result = linter.verifyAndFix(code, {
      languageOptions: { sourceType: 'script' },
      plugins: { ntnyq: plugin },
      rules: {
        'ntnyq/prefer-object-method-syntax': ['error', { fix: true }],
      },
    })
    expect(result.output).toBe(code)
    expect(result.fixed).toBe(false)
    expect(result.messages.map(message => message.messageId)).toEqual([
      'preserveLexicalBindings',
    ])
  })
})
