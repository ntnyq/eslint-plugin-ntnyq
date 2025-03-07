import { globSync } from 'tinyglobby'
import { version } from '../../../package.json'
import { resolve } from '../../../scripts/utils'
import { packageName } from '../meta'
import type { DefaultTheme } from 'vitepress'

const VERSIONS: DefaultTheme.NavItemWithLink[] = [
  { link: '/', text: `v${version} (current)` },
  {
    link: `https://github.com/ntnyq/${packageName}/releases`,
    text: 'Release Notes',
  },
]

export function getThemeConfig() {
  const rules = globSync(resolve('src/rules/*.ts'), {
    cwd: resolve(),
    ignore: ['**/index.ts'],
    onlyFiles: true,
    expandDirectories: false,
  })
    .map(path => path.split('/').pop()!)
    .map(path => path.replace('.ts', ''))

  const config: DefaultTheme.Config = {
    editLink: {
      pattern: `https://github.com/ntnyq/${packageName}/edit/main/docs/:path`,
      text: 'Suggest changes to this page',
    },

    // logo: {
    //   light: '/logo-light.svg',
    //   dark: '/logo-dark.svg',
    // },

    nav: [
      { link: '/', text: 'Home' },
      { link: '/guide/', text: 'Guide' },
      { link: '/rules/', text: 'Rules' },
      {
        items: VERSIONS,
        text: `v${version}`,
      },
    ],

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    sidebar: {
      '/': [
        {
          text: 'Guide',
          items: [
            { link: '/', text: 'Home' },
            { link: '/guide/', text: 'Guide' },
            { link: '/rules/', text: 'Rules' },
          ],
        },
      ],
      '/rules/': [
        {
          text: 'Rules',
          items: [
            {
              link: '/rules/',
              text: 'Overview',
            },
          ],
        },
        {
          items: rules.map(ruleId => ruleToSidebarItem(ruleId)),
          text: 'Rules list',
        },
      ],
    },

    socialLinks: [
      { icon: 'x', link: 'https://twitter.com/ntnyq' },
      { icon: 'npm', link: `https://www.npmjs.com/package/${packageName}` },
      { icon: 'github', link: `https://github.com/ntnyq/${packageName}` },
    ],
  }

  return config
}

function ruleToSidebarItem(ruleId: string): DefaultTheme.SidebarItem {
  return {
    link: `/rules/${ruleId}`,
    text: ruleId,
  }
}
