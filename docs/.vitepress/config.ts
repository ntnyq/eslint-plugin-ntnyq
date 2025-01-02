import { transformerRenderWhitespace } from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createConfig } from 'eslint-plugin-ntnyq'
import MarkdownItContainer from 'markdown-it-container'
import { createTwoslasher } from 'twoslash-eslint'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { head } from './config/head'
import { getThemeConfig } from './config/theme'
import { appDescription, appTitle } from './meta'

export default defineConfig({
  title: appTitle,
  description: appDescription,
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  head,
  themeConfig: getThemeConfig(),
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)

      MarkdownItContainer(md, 'correct', {
        render(tokens: any[], idx: number) {
          if (tokens[idx].nesting === 1) {
            const next = tokens[idx + 1]
            if (next.type === 'fence') {
              next.info = [next.info, 'eslint-check'].filter(Boolean).join(' ')
            }
            return '<CustomWrapper type="correct">'
          } else {
            return '</CustomWrapper>\n'
          }
        },
      })

      MarkdownItContainer(md, 'incorrect', {
        render(tokens: any[], idx: number) {
          if (tokens[idx].nesting === 1) {
            const next = tokens[idx + 1]
            if (next.type === 'fence') {
              next.info = [next.info, 'eslint-check'].filter(Boolean).join(' ')
            }
            return '<CustomWrapper type="incorrect">'
          } else {
            return '</CustomWrapper>\n'
          }
        },
      })
    },

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
          eslintCodePreprocess: code => {
            // Remove trailing newline and presentational `⏎` characters
            return code.replace(/⏎(?=\n)/gu, '').replace(/⏎$/gu, '\n')
          },
          eslintConfig: [
            createConfig({
              rules: {
                'ntnyq/no-duplicate-exports': 'error',
                'ntnyq/no-member-accessibility': 'error',
                'ntnyq/prefer-newline-after-file-header': 'error',
              },
            }),
          ],
        }),
      }),
    ],
  },
})
