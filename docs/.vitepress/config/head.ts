import { appDescription, appTitle, appUrl } from '../meta'
import type { HeadConfig } from 'vitepress'

export const head: HeadConfig[] = [
  ['link', { href: '/favicon.ico', rel: 'icon' }],
  ['link', { href: '/apple-touch-icon.png', rel: 'apple-touch-icon' }],
  ['meta', { href: '#ffffff', name: 'theme-color' }],
  ['meta', { content: 'website', property: 'og:type' }],
  ['meta', { content: appTitle, property: 'og:title' }],
  ['meta', { content: appUrl, property: 'og:url' }],
  ['meta', { content: appDescription, property: 'og:description' }],
  // ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  // ['meta', { name: 'twitter:image', content: `${appUrl}/og.png` }],
]
