import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Laradock',
  tagline: 'A Docker setup that lets you run a full PHP development environment in seconds.',
  favicon: 'laradock.ico',

  // Set the production url of your site here
  url: 'https://laradock.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'laradock/laradock', // Usually your GitHub org/user name.
  projectName: 'laradock', // Usually your repo name.

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          id: 'default',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/laradock/laradock/tree/master/DOCUMENTATION/',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-CVZBKZ36Y5', // Update with your Google Analytics ID
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: '/img/laradock/laradock-logo.jpg',
    navbar: {
      title: 'Laradock',
      logo: {
        alt: 'Laradock Logo',
        src: '/img/laradock/laradock-icon.png',
      },
      items: [
        { type: 'doc', docId: 'Intro', label: 'Docs', position: 'right' },
        { type: 'doc', docId: 'getting-started', label: 'Getting Started', position: 'right' },
        { type: 'doc', docId: 'usage', label: 'Usage', position: 'right' },
        {
          href: 'https://github.com/laradock/laradock',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © 2015 - ${new Date().getFullYear()} - Laradock. Maintained by <a href="https://zalt.me" target="_blank" rel="noopener noreferrer">Mahmoud Zalt</a>, also building <a href="https://sistava.com" target="_blank" rel="noopener noreferrer">Sistava</a> at <a href="https://sista.ai" target="_blank" rel="noopener noreferrer">Sista AI</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: 'dark',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
