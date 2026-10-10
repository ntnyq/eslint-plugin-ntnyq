import { appDescription, appTitle, appUrl } from '../meta.ts'
import type { HeadConfig } from 'vitepress'

export const head: HeadConfig[] = [
  ['link', { href: '/logo.svg', rel: 'icon', type: 'image/svg+xml' }],
  ['link', { href: '/apple-touch-icon.png', rel: 'apple-touch-icon' }],
  ['meta', { content: '#ffffff', name: 'theme-color' }],
  ['meta', { content: 'website', property: 'og:type' }],
  ['meta', { content: appTitle, property: 'og:title' }],
  ['meta', { content: appUrl, property: 'og:url' }],
  ['meta', { content: appDescription, property: 'og:description' }],
  // ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  // ['meta', { name: 'twitter:image', content: `${appUrl}/og.png` }],
]
