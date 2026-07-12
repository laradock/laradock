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
  'laradock-vs-others/comparison',
  'laradock-vs-others/laradock-vs-ddev',
  'laradock-vs-others/laradock-vs-laravel-sail',
  'laradock-vs-others/laradock-vs-laravel-herd',
  'laradock-vs-others/laradock-vs-xampp',
  'laradock-vs-others/laradock-vs-homestead',
  'laradock-vs-others/laradock-vs-lando',
  'laradock-vs-others/laradock-vs-devcontainers',
  'laradock-vs-others/laradock-vs-docker-compose',
  'laradock-vs-others/laradock-vs-manual-install',
  'help',
  'related-projects',
  'contributing',
];

const HEADER = `# Laradock

> A full PHP development environment for Docker. Spin up a ready-to-use stack in seconds, with 100+ pre-configured services (Nginx, PHP, MySQL, Redis, and more). Works with any PHP project (Laravel, Symfony, WordPress, or plain PHP) on Linux, macOS, and Windows.

Motto: "Use Docker first. Learn about it later." Free, open-source (MIT), 12k+ GitHub stars, maintained since 2015.
Created and maintained by Mahmoud Zalt (https://zalt.me).

Raw Markdown: append \`.md\` to any docs page URL to fetch its clean Markdown, e.g. ${SITE}/docs/getting-started -> ${SITE}/docs/getting-started.md
`;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.md') ? [path.relative(DOCS_DIR, full)] : [];
  });
}

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
  let body = raw.slice(match ? match[0].length : 0);
  // Strip HTML comments until stable, so nested/overlapping <!-- --> can't survive one pass.
  let previousBody;
  do {
    previousBody = body;
    body = body.replace(/<!--[\s\S]*?-->/g, '');
  } while (body !== previousBody);
  body = body
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

const files = walk(DOCS_DIR);
const known = ORDER.filter((id) => files.includes(`${id}.md`));
const unknown = files.map((f) => f.replace(/\.md$/, '')).filter((id) => !ORDER.includes(id));
const docs = [...known, ...unknown].map((id) => parseDoc(`${id}.md`));

const isComparison = (d) => d.id.startsWith('laradock-vs-others/');
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

Tip: append \`.md\` to any page URL (e.g. ${SITE}/docs/getting-started.md) to fetch that single page's raw Markdown.
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

// One clean .md per page for the "Copy page" button, served at /docs/<slug>.md.
const PAGES_DIR = path.join(STATIC_DIR, 'docs');
for (const d of docs) {
  const slug = d.url.replace(`${SITE}/docs/`, '');
  const out = path.join(PAGES_DIR, `${slug}.md`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `# ${d.title}\n\nSource: ${d.url}\n\n${d.body}\n`);
}

console.log(`llms.txt + llms-full.txt + ${docs.length} per-page .md files generated.`);
