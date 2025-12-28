import { join } from '@ntnyq/utils'
import { transformerRenderWhitespace } from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import parserTypeScript from '@typescript-eslint/parser'
import pluginNtnyq from 'eslint-plugin-ntnyq'
import MarkdownItContainer from 'markdown-it-container'
import { createTwoslasher } from 'twoslash-eslint'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { head } from './config/head'
import { getThemeConfig } from './config/theme'
import { appDescription, appTitle } from './meta'

const SPECIAL_CHAR = {
  whitespace: ' ',
  newline: '\n',
}

export default defineConfig({
  cleanUrls: true,
  description: appDescription,
  head,
  ignoreDeadLinks: true,
  lastUpdated: true,

  themeConfig: getThemeConfig(),
  title: appTitle,
  markdown: {
    codeTransformers: [
      transformerRenderWhitespace({
        position: 'all',
      }),
      transformerTwoslash({
        explicitTrigger: /\btwoslash\b/,
      }),
      transformerTwoslash({
        errorRendering: 'hover',
        explicitTrigger: /\beslint-check\b/,
        twoslasher: createTwoslasher({
          eslintConfig: [
            {
              files: ['**/*.?([cm])[jt]s?(x)'],
              languageOptions: {
                parser: parserTypeScript,
              },
              plugins: {
                ntnyq: pluginNtnyq,
              },
              rules: {
                'ntnyq/no-duplicate-exports': 'error',
                'ntnyq/no-member-accessibility': 'error',
                'ntnyq/prefer-newline-after-file-header': 'error',
              },
            },
          ],
          eslintCodePreprocess: code => {
            // Remove trailing newline and presentational `⏎` characters
            return code
              .replace(/⏎(?=\n)/gu, '')
              .replace(/⏎$/gu, SPECIAL_CHAR.newline)
          },
        }),
      }),
    ],

    config(md) {
      // @ts-expect-error types
      md.use(groupIconMdPlugin)

      type MarkdownIt = Parameters<typeof MarkdownItContainer>[0]

      MarkdownItContainer(md as unknown as MarkdownIt, 'correct', {
        render(tokens: any[], idx: number) {
          if (tokens[idx].nesting === 1) {
            const next = tokens[idx + 1]
            if (next.type === 'fence') {
              next.info = join([next.info, 'eslint-check'], {
                separator: SPECIAL_CHAR.whitespace,
              })
            }
            return '<CustomWrapper type="correct">'
          } else {
            return `</CustomWrapper>${SPECIAL_CHAR.newline}`
          }
        },
      })

      MarkdownItContainer(md as unknown as MarkdownIt, 'incorrect', {
        render(tokens: any[], idx: number) {
          if (tokens[idx].nesting === 1) {
            const next = tokens[idx + 1]
            if (next.type === 'fence') {
              next.info = join([next.info, 'eslint-check'], {
                separator: SPECIAL_CHAR.whitespace,
              })
            }
            return '<CustomWrapper type="incorrect">'
          } else {
            return `</CustomWrapper>${SPECIAL_CHAR.newline}`
          }
        },
      })
    },
  },
})
