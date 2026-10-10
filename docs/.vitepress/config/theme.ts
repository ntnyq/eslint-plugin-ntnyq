import { globSync } from 'tinyglobby'
import { resolve } from '../../../scripts/utils.ts'
import { appVersion, packageName } from '../meta.ts'
import type { DefaultTheme } from 'vitepress'

const VERSIONS: DefaultTheme.NavItemWithLink[] = [
  { link: '/', text: `v${appVersion} (current)` },
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

    footer: {
      message: `Released under the <a href="https://github.com/ntnyq/${packageName}/blob/main/LICENSE">MIT License</a>.`,
      copyright:
        'Copyright © 2023-present <a href="https://github.com/ntnyq">ntnyq</a>',
    },

    logo: {
      src: '/logo.svg',
      alt: 'ESLint logo',
    },

    nav: [
      { link: '/', text: 'Home' },
      { link: '/guide/', text: 'Guide' },
      { link: '/rules/', text: 'Rules' },
      {
        items: VERSIONS,
        text: `v${appVersion}`,
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
