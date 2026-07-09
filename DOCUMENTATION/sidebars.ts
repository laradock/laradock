import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Manual sidebar. Long single-page docs (Intro, Getting Started) expose their
 * sections as in-page anchor links so the sidebar stays useful without splitting
 * content across pages (easier to search / copy / feed to an AI agent).
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "category",
      label: "Introduction",
      link: { type: "doc", id: "Intro" },
      collapsible: true,
      collapsed: false,
      items: [
        { type: "link", label: "Features", href: "/docs/Intro#features" },
        { type: "link", label: "Supported Services", href: "/docs/Intro#supported-services" },
        { type: "link", label: "Quick Start", href: "/docs/Intro#quick-start" },
        { type: "link", label: "Awesome People", href: "/docs/Intro#awesome-people" },
        { type: "link", label: "Sponsors", href: "/docs/Intro#sponsors" },
        { type: "link", label: "License", href: "/docs/Intro#license" },
      ],
    },
    {
      type: "category",
      label: "Getting Started",
      link: { type: "doc", id: "getting-started" },
      collapsible: true,
      collapsed: true,
      items: [
        { type: "link", label: "Requirements", href: "/docs/getting-started#requirements" },
        { type: "link", label: "Installation", href: "/docs/getting-started#installation" },
        { type: "link", label: "Usage", href: "/docs/getting-started#usage" },
      ],
    },
    {
      type: "category",
      label: "Usage",
      link: { type: "doc", id: "usage" },
      collapsible: true,
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Containers",
          collapsible: true,
          collapsed: true,
          items: [
            { type: "link", label: "List running containers", href: "/docs/usage#list-running-containers" },
            { type: "link", label: "Enter a container", href: "/docs/usage#enter-a-container" },
            { type: "link", label: "Build or rebuild", href: "/docs/usage#build-or-rebuild-containers" },
            { type: "link", label: "View log files", href: "/docs/usage#view-logs" },
          ],
        },
        {
          type: "category",
          label: "PHP",
          collapsible: true,
          collapsed: true,
          items: [
            { type: "link", label: "Install extensions", href: "/docs/usage#install-php-extensions" },
            { type: "link", label: "Change PHP-FPM version", href: "/docs/usage#change-the-php-fpm-version" },
            { type: "link", label: "Install xDebug", href: "/docs/usage#install-xdebug" },
            { type: "link", label: "Start or stop xDebug", href: "/docs/usage#start-or-stop-xdebug" },
          ],
        },
        {
          type: "category",
          label: "Laravel",
          collapsible: true,
          collapsed: true,
          items: [
            { type: "link", label: "Install Laravel", href: "/docs/usage#install-laravel" },
            { type: "link", label: "Run Artisan commands", href: "/docs/usage#run-artisan-commands" },
            { type: "link", label: "Queue worker", href: "/docs/usage#run-the-queue-worker" },
            { type: "link", label: "Scheduler", href: "/docs/usage#run-the-scheduler" },
          ],
        },
        {
          type: "category",
          label: "Use a Service",
          collapsible: true,
          collapsed: true,
          items: [
            { type: "link", label: "Redis", href: "/docs/usage#redis" },
            { type: "link", label: "PhpMyAdmin", href: "/docs/usage#phpmyadmin" },
            { type: "link", label: "ElasticSearch", href: "/docs/usage#elasticsearch" },
            { type: "link", label: "Grafana", href: "/docs/usage#grafana" },
          ],
        },
        { type: "link", label: "Prepare for Production", href: "/docs/usage#prepare-laradock-for-production" },
      ],
    },
    "help",
    "related-projects",
    "contributing",
  ],
};

export default sidebars;
