import { defineConfig } from 'vitepress'
import { head } from './config/head'
import { themeConfig } from './config/theme'

export default defineConfig({
  title: 'eslint-plugin-ntnyq',

  description: 'An opinionated ESLint plugin.',

  head,
  themeConfig,
  lastUpdated: true,
})
