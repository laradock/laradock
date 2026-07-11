/**
 * remark-glossary-links
 * ---------------------------------------------------------------------------
 * Auto-links the FIRST mention of a known Laradock service / project / deploy
 * target / comparison on each docs page, turning plain prose into an internal
 * navigation + SEO web with zero hand-editing of the 250+ pages.
 *
 * Terms are derived at build time from every page's frontmatter (slug + title).
 * The small curation block below only adds what can't be derived: aliases,
 * ambiguous common-word names (matched case-sensitively so "keep it slim" is not
 * linked but "Slim" the framework is), and terms whose pages don't follow the
 * derivable service/project title pattern (deploy targets, comparisons).
 *
 * Guardrails: first occurrence per target per page, never link a term on its own
 * page, skip headings / links / code / raw HTML, match on word boundaries.
 *
 * ponytail: reads frontmatter with a line regex (no yaml dep) and hand-walks the
 * mdast (no unist-util-visit dep). One file, one config line, delete to revert.
 */

const fs = require("fs");
const path = require("path");

// Node types whose subtree must NOT be touched (their text stays literal).
const SKIP = new Set([
  "heading", "link", "linkReference", "definition", "code", "inlineCode",
  "html", "yaml", "image", "imageReference",
  "mdxjsEsm", "mdxJsxFlowElement", "mdxJsxTextElement",
  "mdxFlowExpression", "mdxTextExpression",
]);

// --- curation ---------------------------------------------------------------

// slug -> replace the auto-derived term(s) entirely (messy / parenthetical titles).
const RETERM = {
  "/services/mssql": ["MSSQL", "SQL Server"],
  "/services/sqs": ["SQS", "Amazon SQS", "Amazon Simple Queue Service"],
  "/services/postgres-postgis": ["PostGIS"],
  "/laminas-on-docker": ["Laminas", "Zend Framework"],
  "/fat-free-framework-on-docker": ["Fat-Free Framework", "F3"],
  "/smf-on-docker": ["Simple Machines Forum", "SMF"],
  "/spiral-on-docker": ["Spiral Framework", "Spiral"],
  "/pydio-on-docker": ["Pydio"],
  "/leaf-php-on-docker": ["Leaf PHP", "Leaf"],
};

// slug -> extra alias terms (only strings that differ by more than letter case,
// since matching is case-insensitive except for the CASE_SENSITIVE set below).
const ALIASES = {
  "/services/apache2": ["Apache2"],
  "/services/kafka": ["Kafka"],
  "/services/solr": ["Solr"],
  "/services/manticore": ["Manticore"],
  "/services/percona": ["Percona"],
  "/services/ide-theia": ["Theia"],
  "/services/redis-webui": ["Redis Web UI"],
  "/services/mongo-webui": ["MongoDB Web UI"],
  "/services/mongo": ["Mongo"],
  "/services/postgres": ["Postgres"],
  "/services/php-fpm": ["PHP FPM"],
  "/services/workspace": ["Laradock Workspace"],
  "/services/laravel-echo-server": ["Laravel Echo"],
  "/services/zookeeper": ["Apache ZooKeeper"],
};

// Terms that are also ordinary English words: only link the exact product casing.
const CASE_SENSITIVE = new Set([
  "slim", "flight", "grav", "pico", "ubiquity", "cachet", "crater",
  "varnish", "spiral", "leaf", "render", "sail", "herd", "valet",
]);

// Pages that don't follow the derivable service/project title pattern.
const EXTRA = [
  // Deploy targets
  { terms: ["Kubernetes", "k8s"], url: "/docs/deploy-to-kubernetes" },
  { terms: ["AWS ECS", "Fargate"], url: "/docs/deploy-to-aws-ecs" },
  { terms: ["AWS App Runner", "App Runner"], url: "/docs/deploy-to-aws-app-runner" },
  { terms: ["Google Cloud Run", "Cloud Run"], url: "/docs/deploy-to-google-cloud-run" },
  { terms: ["Azure Container Apps"], url: "/docs/deploy-to-azure-container-apps" },
  { terms: ["Fly.io"], url: "/docs/deploy-to-fly-io" },
  { terms: ["Render"], url: "/docs/deploy-to-render" },
  { terms: ["Railway"], url: "/docs/deploy-to-railway" },
  { terms: ["DigitalOcean", "DigitalOcean App Platform"], url: "/docs/deploy-to-digitalocean" },
  { terms: ["Heroku"], url: "/docs/deploy-to-heroku" },
  { terms: ["Kamal"], url: "/docs/deploy-to-kamal" },
  // Comparisons (only distinctive anchors; docker-compose / manual-install /
  // wordpress|symfony|drupal-docker are too ambiguous to auto-link).
  { terms: ["DDEV"], url: "/docs/laradock-vs-ddev" },
  { terms: ["Laragon"], url: "/docs/laradock-vs-laragon" },
  { terms: ["Homestead"], url: "/docs/laradock-vs-homestead" },
  { terms: ["Lando"], url: "/docs/laradock-vs-lando" },
  { terms: ["Laravel Sail", "Sail"], url: "/docs/laradock-vs-laravel-sail" },
  { terms: ["Laravel Herd", "Herd"], url: "/docs/laradock-vs-laravel-herd" },
  { terms: ["Laravel Valet", "Valet"], url: "/docs/laradock-vs-valet" },
  { terms: ["Local WP"], url: "/docs/laradock-vs-local-wp" },
  { terms: ["Dev Containers", "devcontainers"], url: "/docs/laradock-vs-devcontainers" },
  { terms: ["XAMPP", "MAMP"], url: "/docs/laradock-vs-xampp" },
  { terms: ["docker-magento", "Warden"], url: "/docs/laradock-vs-docker-magento" },
  // Misc hubs / guides
  { terms: ["Laradock CLI"], url: "/docs/cli" },
  { terms: ["Xdebug"], url: "/docs/xdebug-ide" },
];

// --- build -------------------------------------------------------------------

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function readFrontmatter(file) {
  const head = fs.readFileSync(file, "utf8").slice(0, 1200);
  const slug = (head.match(/^slug:\s*(.+)$/m) || [])[1];
  const title = (head.match(/^title:\s*(.+)$/m) || [])[1];
  return { slug: slug && slug.trim(), title: title && title.trim() };
}

function scanFrontmatter(docsDir) {
  const pages = [];
  const fileToUrl = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const { slug, title } = readFrontmatter(full);
        const rel = path.relative(docsDir, full).replace(/\.md$/, "");
        const url = slug ? "/docs" + slug : "/docs/" + rel;
        fileToUrl.set(path.resolve(full), url);
        pages.push({ slug, title, url });
      }
    }
  };
  walk(docsDir);
  return { pages, fileToUrl };
}

// Derive the display term(s) for a service/project page from its title.
function deriveTerms(page) {
  if (RETERM[page.slug]) return RETERM[page.slug];
  if (!page.title) return [];
  if (page.slug && page.slug.startsWith("/services/")) return [page.title];
  const project = page.title.match(/^Run (.+) on Docker$/);
  if (project) return [project[1]];
  return [];
}

function buildIndex(pages, extra) {
  const termMap = new Map(); // lowercased term -> { url, exact:Set, cs:bool }
  const collisions = [];

  const add = (term, url) => {
    term = term.trim();
    if (!term) return;
    const key = term.toLowerCase();
    const existing = termMap.get(key);
    if (existing && existing.url !== url) {
      // Prefer the /services/ page over the "run X on docker" SEO page.
      const winner = url.startsWith("/docs/services/") ? url : existing.url;
      collisions.push({ term, kept: winner, dropped: winner === url ? existing.url : url });
      existing.url = winner;
      existing.exact.add(term);
      return;
    }
    if (existing) {
      existing.exact.add(term);
      return;
    }
    termMap.set(key, { url, exact: new Set([term]), cs: CASE_SENSITIVE.has(key) });
  };

  for (const page of pages) {
    const terms = deriveTerms(page);
    if (!terms.length) continue;
    for (const t of terms) add(t, page.url);
    for (const a of ALIASES[page.slug] || []) add(a, page.url);
  }
  for (const { terms, url } of extra) for (const t of terms) add(t, url);

  // Longest term first so "Redis Cluster" wins over "Redis", "Laravel Sail"
  // over "Laravel", etc.
  const all = [];
  for (const e of termMap.values()) for (const t of e.exact) all.push(t);
  all.sort((a, b) => b.length - a.length);
  const regex = new RegExp("\\b(?:" + all.map(escapeRe).join("|") + ")\\b", "gi");

  return { termMap, regex, collisions };
}

// Turn one text string into an array of text/link nodes, or null if unchanged.
function linkText(value, ctx) {
  const { termMap, regex, self, linked } = ctx;
  regex.lastIndex = 0;
  const out = [];
  let last = 0;
  let changed = false;
  let m;
  while ((m = regex.exec(value))) {
    const text = m[0];
    const e = termMap.get(text.toLowerCase());
    if (!e) continue;
    if (e.cs && !e.exact.has(text)) continue; // ambiguous word, wrong casing
    if (e.url === self) continue; // no self-links
    if (linked.has(e.url)) continue; // first occurrence only
    if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
    out.push({ type: "link", url: e.url, title: null, children: [{ type: "text", value: text }] });
    linked.add(e.url);
    last = m.index + text.length;
    changed = true;
  }
  if (!changed) return null;
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
  return out;
}

function walk(node, ctx) {
  if (!node.children) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === "text" && !SKIP.has(node.type)) {
      const rep = linkText(child.value, ctx);
      if (rep) next.push(...rep);
      else next.push(child);
    } else {
      if (child.children && !SKIP.has(child.type)) walk(child, ctx);
      next.push(child);
    }
  }
  node.children = next;
}

module.exports = function glossaryLinks(options = {}) {
  const docsDir = options.docsDir || path.join(process.cwd(), "docs");
  const { pages, fileToUrl } = scanFrontmatter(docsDir);
  const { termMap, regex, collisions } = buildIndex(pages, EXTRA);
  console.log(`[glossary] ${termMap.size} terms across ${pages.length} pages`);
  if (collisions.length) console.log("[glossary] collisions:", collisions);

  return (tree, vfile) => {
    const file = vfile && (vfile.path || (vfile.history && vfile.history[0]));
    const self = file ? fileToUrl.get(path.resolve(file)) : undefined;
    walk(tree, { termMap, regex, self, linked: new Set() });
  };
};

// exported for the self-check
module.exports.buildIndex = buildIndex;
module.exports.linkText = linkText;
module.exports.deriveTerms = deriveTerms;
