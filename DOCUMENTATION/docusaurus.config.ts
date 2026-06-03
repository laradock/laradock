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

  // Structured-data identity for Google Knowledge Graph + LLM citations.
  // Laradock is linked to its Wikidata item (Q140002860); its author Mahmoud
  // Zalt to his (Q140002792). Each Wikidata link sits on the node that IS that
  // entity, so search/AI engines fuse the right thing.
  headTags: [
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Laradock',
        alternateName: 'Laradock for Docker',
        url: 'https://laradock.io',
        sameAs: [
          'https://www.wikidata.org/wiki/Q140002860',
          'https://github.com/laradock/laradock',
        ],
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'PHP Development Environment',
        operatingSystem: 'Linux, macOS, Windows',
        softwareRequirements: 'Docker',
        license: 'https://opensource.org/licenses/MIT',
        datePublished: '2015-01-01',
        isAccessibleForFree: true,
        keywords:
          'Docker, PHP, Laravel, development environment, Docker Compose, Nginx, MySQL, Redis',
        image: 'https://laradock.io/img/laradock/laradock-logo.jpg',
        downloadUrl: 'https://github.com/laradock/laradock',
        softwareHelp: 'https://laradock.io/docs/Intro',
        description:
          'A Docker setup that lets you run a full PHP development environment in seconds.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Mahmoud Zalt',
          url: 'https://zalt.me',
          sameAs: ['https://www.wikidata.org/wiki/Q140002792'],
        },
      }),
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Laradock',
        url: 'https://laradock.io',
        description:
          'Official documentation for Laradock, a full PHP development environment for Docker.',
        inLanguage: 'en',
        publisher: {
          '@type': 'Person',
          name: 'Mahmoud Zalt',
          url: 'https://zalt.me',
          sameAs: ['https://www.wikidata.org/wiki/Q140002792'],
        },
      }),
    },
    {
      // FAQ rich result, sourced verbatim from the Help page so the answers
      // stay true to the docs. Makes Laradock eligible for FAQ snippets and
      // gives AI answer engines clean Q->A pairs to cite.
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: "I see a blank (white) page instead of the Laravel 'Welcome' page",
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Run "sudo chmod -R 777 storage bootstrap/cache" from the Laravel root directory.',
            },
          },
          {
            '@type': 'Question',
            name: 'I see "Welcome to nginx" instead of the Laravel App',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Use http://127.0.0.1 instead of http://localhost in your browser.',
            },
          },
          {
            '@type': 'Question',
            name: 'I see an error containing "address already in use" or "port is already allocated"',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Make sure the ports for the services you are running (22, 80, 443, 3306, etc.) are not already used by other programs on the host, such as a built-in apache/httpd service or other development tools.',
            },
          },
          {
            '@type': 'Question',
            name: 'I get MySQL connection refused',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Set DB_HOST in your .env to the MySQL container name (the Laradock docker-compose file uses "mysql"), or to the IP of your Laravel container.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Laradock work with frameworks other than Laravel?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Laradock works with any PHP project, including Laravel, Symfony, WordPress, or plain PHP, and behaves the same on Linux, macOS, and Windows.',
            },
          },
        ],
      }),
    },
  ],

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
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          lastmod: 'date',
          // Keep template/utility routes out of the index.
          ignorePatterns: ['/markdown-page', '/blog', '/blog/**', '/search', '/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: '/img/laradock/laradock-logo.jpg',
    metadata: [
      {
        name: 'keywords',
        content:
          'laradock, docker, php, laravel, development environment, docker compose, nginx, mysql, redis, symfony, wordpress, php docker',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
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
