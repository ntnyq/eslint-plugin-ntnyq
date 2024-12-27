import type { DefaultTheme } from 'vitepress'

export const themeConfig: DefaultTheme.Config = {
  search: {
    provider: 'local',
  },

  editLink: {
    pattern: 'https://github.com/ntnyq/eslint-plugin-ntnyq/edit/main/docs/:path',
  },

  socialLinks: [{ icon: 'github', link: 'https://github.com/ntnyq/eslint-plugin-ntnyq' }],

  nav: [
    { text: 'Introduction', link: '/' },
    { text: 'User Guide', link: '/user-guide/' },
    { text: 'Rules', link: '/rules/' },
    {
      text: 'Changelog',
      link: 'https://github.com/ntnyq/eslint-plugin-ntnyq/releases',
    },
  ],

  sidebar: {
    '/rules/': [
      {
        text: 'Rules',
        items: [
          {
            text: 'Available Rules',
            link: '/rules/',
          },
        ],
      },
      {
        text: 'Stylistic Issues',
        items: [
          {
            text: 'ntnyq/no-duplicate-exports',
            link: '/rules/no-duplicate-exports',
          },
          {
            text: 'ntnyq/no-member-accessibility',
            link: '/rules/no-member-accessibility',
          },
        ],
      },
    ],
    '/': [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'User Guide', link: '/user-guide/' },
          { text: 'Rules', link: '/rules/' },
          {
            text: 'Changelog',
            link: 'https://github.com/ntnyq/eslint-plugin-ntnyq/releases',
          },
        ],
      },
    ],
  },
}
