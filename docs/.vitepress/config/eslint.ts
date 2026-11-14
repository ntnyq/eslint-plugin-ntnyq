import parserTypeScript from '@typescript-eslint/parser'
import pluginNtnyq from 'eslint-plugin-ntnyq'
import type { Linter } from 'eslint'

export const eslintConfig: Linter.Config[] = [
  {
    files: ['**/*.?([cm])[jt]s?(x)'],
    languageOptions: {
      parser: parserTypeScript,
    },
    plugins: {
      ntnyq: pluginNtnyq,
    },
    rules: {
      'ntnyq/indent-unindent': 'error',
      'ntnyq/no-duplicate-exports': 'error',
      'ntnyq/no-explicit-void-return-type': 'error',
      'ntnyq/no-member-accessibility': 'error',
      'ntnyq/no-only-tests': 'error',
      'ntnyq/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'if',
            'for',
            'while',
            'do',
            'switch',
            'try',
            'return',
            'throw',
          ],
        },
        {
          blankLine: 'always',
          prev: ['if', 'for', 'while', 'do', 'switch', 'try'],
          next: '*',
        },
      ],
      'ntnyq/prefer-newline-after-file-header': 'error',
      'ntnyq/prefer-object-method-syntax': 'error',
      'ntnyq/return-object-multiline': 'error',
    },
  },
]
