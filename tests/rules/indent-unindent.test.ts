import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/indent-unindent'
import { run } from '../internal'
import type { Options } from '../../src/rules/indent-unindent'

function toCode(...lines: string[]) {
  return lines.join('\n')
}

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
    {
      code: toCode('const value = $`', '  first', '', '  second', '`'),
    },
    {
      code: toCode(
        'function render() {',
        '  return unindent`',
        '    first',
        '',
        '    second',
        '  `',
        '}',
      ),
    },
    {
      code: toCode('const value = dedent`', '    first', '', '    second', '`'),
      options: {
        indent: 4,
        tags: ['dedent'],
      },
    },
    {
      code: toCode(
        `const interpolated = $\`hello \${name}\``,
        'const memberTag = String.raw`first`',
        'const unknownTag = html`first`',
      ),
    },
  ],
  invalid: [
    {
      description: 'removes indentation from an otherwise empty line',
      code: toCode('const value = $`', '  first', '  ', '  second', '`'),
      errors: ['indentUnindent'],
      output(output) {
        expect(output).toBe(
          toCode('const value = $`', '  first', '', '  second', '`'),
        )
        expect(output).not.toMatch(/[\t ]+$/mu)
      },
    },
    {
      description: 'indents content but leaves nested blank lines empty',
      code: toCode(
        'function render() {',
        '  return unIndent`',
        'first',
        ' ',
        'second',
        '  `',
        '}',
      ),
      errors: ['indentUnindent'],
      output: toCode(
        'function render() {',
        '  return unIndent`',
        '    first',
        '',
        '    second',
        '  `',
        '}',
      ),
    },
    {
      description: 'supports custom tags and indentation',
      code: toCode('const value = dedent`', 'first', '\t', 'second', '`'),
      options: {
        indent: 4,
        tags: ['dedent'],
      },
      errors: ['indentUnindent'],
      output: toCode(
        'const value = dedent`',
        '    first',
        '',
        '    second',
        '`',
      ),
    },
    {
      description: 'expands a single-line tagged template',
      code: 'const value = unindent`first`',
      errors: ['indentUnindent'],
      output: toCode('const value = unindent`', '  first', '`'),
    },
  ],
})
