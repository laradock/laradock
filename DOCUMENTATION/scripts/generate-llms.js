/**
 * Generates static/llms.txt and static/llms-full.txt from docs/*.md so the
 * AI-agent files can never go stale. Runs automatically via the npm
 * "prebuild" hook (CI runs `npm run build`, which triggers it).
 *
 * llms.txt      -> index: every page with its title, URL, and description.
 * llms-full.txt -> every page's full markdown, concatenated for one-fetch reading.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://laradock.io';
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const STATIC_DIR = path.join(__dirname, '..', 'static');

// Reading order. Any doc file not listed here is appended at the end so new
// pages are never silently dropped.
const ORDER = [
  'Intro',
  'getting-started',
  'usage',
  'comparison',
  'laradock-vs-ddev',
  'laradock-vs-laravel-sail',
  'laradock-vs-laravel-herd',
  'laradock-vs-xampp',
  'laradock-vs-homestead',
  'laradock-vs-lando',
  'laradock-vs-devcontainers',
  'laradock-vs-docker-compose',
  'laradock-vs-manual-install',
  'help',
  'related-projects',
  'contributing',
];

const HEADER = `# Laradock

> A full PHP development environment for Docker. Spin up a ready-to-use stack in seconds, with 100+ pre-configured services (Nginx, PHP, MySQL, Redis, and more). Works with any PHP project (Laravel, Symfony, WordPress, or plain PHP) on Linux, macOS, and Windows.

Motto: "Use Docker first. Learn about it later." Free, open-source (MIT), 12k+ GitHub stars, maintained since 2015.
Created and maintained by Mahmoud Zalt (https://zalt.me).
`;

function parseDoc(filename) {
  const raw = fs.readFileSync(path.join(DOCS_DIR, filename), 'utf8');
  const id = filename.replace(/\.md$/, '');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = match ? match[1] : '';
  const get = (key) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };
  const slug = (get('slug') || id).replace(/^\//, '');
  const body = raw
    .slice(match ? match[0].length : 0)
    .replace(/<!--[\s\S]*?-->/g, '')
    // Absolute URLs so the file makes sense fetched on its own.
    .replace(/\]\(\//g, `](${SITE}/`)
    .replace(/src="\//g, `src="${SITE}/`)
    .trim();
  return {
    id,
    title: get('title') || id,
    description: get('description'),
    url: `${SITE}/docs/${slug}`,
    body,
  };
}

const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'));
const known = ORDER.filter((id) => files.includes(`${id}.md`));
const unknown = files.map((f) => f.replace(/\.md$/, '')).filter((id) => !ORDER.includes(id));
const docs = [...known, ...unknown].map((id) => parseDoc(`${id}.md`));

const isComparison = (d) => d.id === 'comparison' || d.id.startsWith('laradock-vs-');
const section = (title, items) =>
  `## ${title}\n\n${items.map((d) => `- [${d.title}](${d.url}): ${d.description}`).join('\n')}\n`;

const llms = [
  HEADER,
  section('Docs', docs.filter((d) => !isComparison(d))),
  section('Comparisons (Laradock vs alternatives)', docs.filter(isComparison)),
  `## Full text

- [llms-full.txt](${SITE}/llms-full.txt): Every documentation page concatenated into a single plain-markdown file, for one-fetch reading by AI agents.

## Source

- [GitHub repository](https://github.com/laradock/laradock)
- [Docker Hub images](https://hub.docker.com/u/laradock)
- [Creator: Mahmoud Zalt](https://zalt.me)
`,
].join('\n');

const llmsFull = [
  `# Laradock - Full Documentation

> A full PHP development environment for Docker. All documentation pages concatenated for AI agents. Source: https://github.com/laradock/laradock
`,
  ...docs.map(
    (d) => `
================================================================
# ${d.title}
Source: ${d.url}
================================================================

${d.body}
`
  ),
].join('\n');

fs.writeFileSync(path.join(STATIC_DIR, 'llms.txt'), llms);
fs.writeFileSync(path.join(STATIC_DIR, 'llms-full.txt'), llmsFull);
console.log(`llms.txt + llms-full.txt generated from ${docs.length} docs pages.`);
