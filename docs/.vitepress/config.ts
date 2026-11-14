import { joinNonEmptyValues } from '@ntnyq/utils'
import { transformerRenderWhitespace } from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import MarkdownItContainer from 'markdown-it-container'
import { createTwoslasher } from 'twoslash-eslint'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { eslintConfig } from './config/eslint.ts'
import { head } from './config/head.ts'
import { createThemeConfig } from './config/theme.ts'
import { appDescription, appTitle } from './meta.ts'

export default defineConfig({
  cleanUrls: true,
  description: appDescription,
  head,
  lastUpdated: true,

  themeConfig: createThemeConfig(),
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
          eslintConfig,
          eslintCodePreprocess(code) {
            // Remove trailing newline and presentational `⏎` characters
            return code.replace(/⏎(?=\n)/gu, '').replace(/⏎$/gu, () => '\n')
          },
        }),
      }),
    ],

    config(md) {
      md.use(groupIconMdPlugin)

      type MarkdownIt = Parameters<typeof MarkdownItContainer>[0]

      MarkdownItContainer(md as unknown as MarkdownIt, 'correct', {
        render(tokens, idx: number) {
          if (tokens[idx].nesting === 1) {
            const next = tokens[idx + 1]

            if (next.type === 'fence') {
              next.info = joinNonEmptyValues([next.info, 'eslint-check'], {
                separator: ' ',
              })
            }

            return '<RuleExample type="correct">'
          }

          return '</RuleExample>\n'
        },
      })

      MarkdownItContainer(md as unknown as MarkdownIt, 'incorrect', {
        render(tokens, idx: number) {
          if (tokens[idx].nesting === 1) {
            const next = tokens[idx + 1]

            if (next.type === 'fence') {
              next.info = joinNonEmptyValues([next.info, 'eslint-check'], {
                separator: ' ',
              })
            }

            return '<RuleExample type="incorrect">'
          }

          return '</RuleExample>\n'
        },
      })
    },
  },
})
