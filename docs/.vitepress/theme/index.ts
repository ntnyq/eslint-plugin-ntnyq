import './app.css'
import '@shikijs/vitepress-twoslash/style.css'
import 'uno.css'
import 'virtual:group-icons.css'
import TwoSlash from '@shikijs/vitepress-twoslash/client'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import RuleExample from '../components/RuleExample.vue'
import CustomLayout from './CustomLayout.vue'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout: () => h(CustomLayout),
  enhanceApp({ app }) {
    app.use(TwoSlash)
    app.component('RuleExample', RuleExample)
  },
} satisfies Theme
