import parserTypeScript from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import parserVue from 'vue-eslint-parser'
import { plugin } from '../../src'
import rule, {
  RULE_NAME,
} from '../../src/rules/padding-line-between-statements'
import { runRuleTests } from '../helpers/ruleTester'
import type {
  MessageIds,
  Options,
  StatementType,
} from '../../src/rules/padding-line-between-statements'

const ALWAYS: Options = [{ blankLine: 'always', prev: '*', next: '*' }]
const NEVER: Options = [{ blankLine: 'never', prev: '*', next: '*' }]
const CONTROL_FLOW: Options = [
  {
    blankLine: 'always',
    prev: '*',
    next: ['if', 'for', 'while', 'do', 'switch', 'try', 'return', 'throw'],
  },
  {
    blankLine: 'always',
    prev: ['if', 'for', 'while', 'do', 'switch', 'try'],
    next: '*',
  },
]

await runRuleTests<Options, MessageIds>({
  name: RULE_NAME,
  rule,
  valid: [
    { code: 'foo(); bar()' },
    { code: 'foo(); bar()', options: [] },
    {
      code: 'foo(); bar()',
      options: [{ blankLine: 'any', prev: '*', next: '*' }],
    },
    { code: 'foo();\n\n\nbar()', options: ALWAYS },
    { code: 'foo();\n// comment\nbar()', options: NEVER },
    { code: 'if (ready) run(); else stop()', options: ALWAYS },
    { code: 'for (let i = 0; i < 2; i++) run()', options: ALWAYS },
    { code: 'function run() { return 1 }', options: ALWAYS },
    { code: 'const first = 1\nconst second = 2', options: CONTROL_FLOW },
    { code: 'foo();\n\n// comment\nbar()', options: ALWAYS },
    { code: 'foo();\n/* comment */\n\nbar()', options: ALWAYS },
    { code: 'foo();\n/* multi\n\nline */\nbar()', options: NEVER },
    {
      code: 'const first = 1\nconst second = 2\n\nrun()',
      options: [...ALWAYS, { blankLine: 'any', prev: 'const', next: 'const' }],
    },
    {
      code: 'export const value = 1\nrun()',
      options: [{ blankLine: 'always', prev: 'const', next: '*' }],
    },
    {
      code: 'const value = { ready: true }\nrun()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
    },
    {
      code: 'function run() { "not a directive"; next() }',
      options: [{ blankLine: 'always', prev: 'expression', next: '*' }],
    },
  ],
  invalid: [
    {
      code: 'const run = () => {}\nrun()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: ['expectedBlankLine'],
      output: 'const run = () => {}\n\nrun()',
    },
    {
      code: 'foo(); bar()',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo();\n\n bar()',
    },
    {
      code: 'foo();\nbar()',
      options: ALWAYS,
      errors: [{ messageId: 'expectedBlankLine', line: 2, column: 1 }],
      output: 'foo();\n\nbar()',
    },
    {
      code: 'foo();\r\nbar()',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo();\r\n\r\nbar()',
    },
    ...['\n', '\r\n', '\r', '\u{2028}', '\u{2029}'].map(newline => ({
      code: `foo();${newline}${newline}${newline}  bar()`,
      options: NEVER,
      errors: ['unexpectedBlankLine'] satisfies MessageIds[],
      output: `foo();${newline}  bar()`,
    })),
    {
      code: 'foo(); // trailing\n// leading\nbar()',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo(); // trailing\n\n// leading\nbar()',
    },
    {
      code: 'foo(); /* trailing */ bar()',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo(); /* trailing */\n\n bar()',
    },
    {
      code: 'foo();\n/* multi\n\nline */\nbar()',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo();\n\n/* multi\n\nline */\nbar()',
    },
    {
      code: 'foo();\n\n// comment\n\nbar()',
      options: NEVER,
      errors: ['unexpectedBlankLine'],
      output: null,
    },
    {
      code: 'foo();\n// comment\n\nbar()',
      options: NEVER,
      errors: ['unexpectedBlankLine'],
      output: 'foo();\n// comment\nbar()',
    },
    {
      code: 'foo();\n\n// comment\nbar()',
      options: NEVER,
      errors: ['unexpectedBlankLine'],
      output: 'foo();\n// comment\nbar()',
    },
    {
      code: 'foo()\n;[1].forEach(bar)',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo()\n\n;[1].forEach(bar)',
    },
    {
      code: 'foo()\n\n;[1].forEach(bar)',
      options: NEVER,
      errors: ['unexpectedBlankLine'],
      output: 'foo()\n;[1].forEach(bar)',
    },
    {
      code: 'foo()\n;\nbar()',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'foo()\n;\n\nbar()',
    },
    {
      code: 'function run() { const value = 1\nreturn value }',
      options: CONTROL_FLOW,
      errors: ['expectedBlankLine'],
      output: 'function run() { const value = 1\n\nreturn value }',
    },
    {
      code: 'const value = 1\nif (ready) { run() }\nnext()',
      options: CONTROL_FLOW,
      errors: ['expectedBlankLine', 'expectedBlankLine'],
      output: 'const value = 1\n\nif (ready) { run() }\n\nnext()',
    },
    {
      code: 'namespace Api { const value = 1\nrun(value) }',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'namespace Api { const value = 1\n\nrun(value) }',
    },
    {
      code: 'class Api { static { foo()\nbar() } }',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'class Api { static { foo()\n\nbar() } }',
    },
    {
      code: 'type Value = string\ninterface Api {}',
      options: ALWAYS,
      errors: ['expectedBlankLine'],
      output: 'type Value = string\n\ninterface Api {}',
    },
    {
      code: 'const value = 1\n\nrun()',
      options: [...ALWAYS, ...NEVER],
      errors: ['unexpectedBlankLine'],
      output: 'const value = 1\nrun()',
    },
    {
      code: 'switch (value) { case 1: foo()\nbreak\ncase 2: bar()\nbreak }',
      options: [{ blankLine: 'always', prev: '*', next: 'case' }],
      errors: ['expectedBlankLine'],
      output: 'switch (value) { case 1: foo()\nbreak\n\ncase 2: bar()\nbreak }',
    },
    {
      code: 'switch (value) { case 1: foo()\nbreak\ndefault: bar()\nbreak }',
      options: [{ blankLine: 'always', prev: '*', next: 'break' }],
      errors: ['expectedBlankLine', 'expectedBlankLine'],
      output:
        'switch (value) { case 1: foo()\n\nbreak\ndefault: bar()\n\nbreak }',
    },
  ],
})

// Each selector below must classify a real statement, not just pass schema validation.
const SELECTOR_STATEMENTS: [StatementType, string][] = [
  ['block', '{}'],
  ['block-like', 'if (ready) {}'],
  ['class', 'class Api {}'],
  ['const', 'const value = 1;'],
  ['cjs-export', 'module.exports.value = 1;'],
  ['cjs-export', 'exports["value"] = 1;'],
  ['cjs-import', 'const api = require("api");'],
  ['debugger', 'debugger;'],
  ['directive', '"use strict";'],
  ['do', 'do {} while (ready);'],
  ['empty', ';'],
  ['export', 'export const value = 1;'],
  ['expression', 'foo();'],
  ['for', 'for (const value of values) {}'],
  ['for', 'for (const key in api) {}'],
  ['function', 'function run() {}'],
  ['if', 'if (ready) {}'],
  ['iife', '(function () {})();'],
  ['iife', '(() => {})();'],
  ['iife', '!function () {}();'],
  ['import', 'import api from "api";'],
  ['let', 'let value = 1;'],
  ['multiline-block-like', 'if (ready) {\nrun()\n}'],
  ['multiline-const', 'const value =\n1;'],
  ['multiline-let', 'let value =\n1;'],
  ['multiline-var', 'var value =\n1;'],
  ['multiline-expression', 'foo(\n1\n);'],
  ['singleline-const', 'const value = 1;'],
  ['singleline-let', 'let value = 1;'],
  ['singleline-var', 'var value = 1;'],
  ['switch', 'switch (value) {}'],
  ['throw', 'throw new Error();'],
  ['try', 'try {} catch {}'],
  ['var', 'var value = 1;'],
  ['while', 'while (ready) {}'],
  ['if', 'label: if (ready) {}'],
]

await runRuleTests<Options, MessageIds>({
  name: `${RULE_NAME}/selectors`,
  rule,
  valid: [
    {
      code: 'foo()\nbar()',
      options: [{ blankLine: 'always', prev: 'directive', next: '*' }],
    },
    {
      code: 'foo(); "not a directive"; bar()',
      options: [{ blankLine: 'always', prev: 'directive', next: '*' }],
    },
    {
      code: 'const value = 1\nrun()',
      options: [{ blankLine: 'always', prev: 'multiline-const', next: '*' }],
    },
    {
      code: 'const value =\n1;\nrun()',
      options: [{ blankLine: 'always', prev: 'singleline-const', next: '*' }],
    },
  ],
  invalid: SELECTOR_STATEMENTS.map(([selector, statement]) => ({
    code: `${statement}\nnext()`,
    options: [{ blankLine: 'always', prev: selector, next: '*' }],
    errors: ['expectedBlankLine'],
    output: `${statement}\n\nnext()`,
  })),
})

await runRuleTests<Options, MessageIds>({
  name: `${RULE_NAME}/vue`,
  rule,
  languageOptions: {
    parser: parserVue,
    parserOptions: { parser: parserTypeScript },
  },
  valid: [
    {
      filename: 'Component.vue',
      code: '<script>export default {}</script>\n<script setup>const value = 1</script>',
      options: ALWAYS,
    },
    {
      filename: 'Component.vue',
      code: '<template><div>{{ (() => { foo(); return 1 })() }}</div></template>',
      options: ALWAYS,
    },
  ],
  invalid: [
    ...['', ' setup'].map(setup => ({
      filename: 'Component.vue',
      code: `<script${setup} lang="ts">\nconst value = 1\nif (value) run()\n</script>`,
      options: CONTROL_FLOW,
      errors: ['expectedBlankLine'] satisfies MessageIds[],
      output: `<script${setup} lang="ts">\nconst value = 1\n\nif (value) run()\n</script>`,
    })),
  ],
})

describe('padding-line-between-statements configuration', () => {
  const linter = new Linter()

  it.each([
    { blankLine: 'sometimes', prev: '*', next: '*' },
    { blankLine: 'always', prev: 'unknown', next: '*' },
    { blankLine: 'always', prev: [], next: '*' },
    { blankLine: 'always', prev: ['const', 'const'], next: '*' },
    { blankLine: 'always', prev: '*' },
    { blankLine: 'always', prev: '*', next: '*', extra: true },
  ])('rejects invalid options: %j', options => {
    expect(() =>
      linter.verify('foo()', {
        plugins: { ntnyq: plugin },
        rules: { [`ntnyq/${RULE_NAME}`]: ['error', options] },
      }),
    ).toThrow()
  })

  it('supports with statements in script mode', () => {
    const result = linter.verifyAndFix('with (api) {}\nnext()', {
      languageOptions: { sourceType: 'script' },
      plugins: { ntnyq: plugin },
      rules: {
        [`ntnyq/${RULE_NAME}`]: [
          'error',
          { blankLine: 'always', prev: 'with', next: '*' },
        ],
      },
    })
    expect(result.output).toBe('with (api) {}\n\nnext()')
    expect(result.messages).toEqual([])
  })
})
