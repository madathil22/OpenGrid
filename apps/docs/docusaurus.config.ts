import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'OpenGrid',
  tagline: 'The open-source enterprise data grid',
  favicon: 'img/favicon.ico',
  // Deployed to GitHub Pages as a project site: https://madathil22.github.io/OpenGrid/
  url: 'https://madathil22.github.io',
  baseUrl: '/OpenGrid/',
  organizationName: 'madathil22',
  projectName: 'OpenGrid',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/madathil22/OpenGrid/tree/main/apps/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'OpenGrid',
      items: [
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        { href: 'https://github.com/madathil22/OpenGrid', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/docs' },
            { label: 'API Reference', to: '/docs/api/column-defs' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/madathil22/OpenGrid' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenGrid. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
