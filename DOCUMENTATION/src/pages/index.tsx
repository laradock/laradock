import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import SponsorsPage from "../components/SponsorsPage";
import SupportBanner from "../components/SupportBanner";

const STATS = [
  { num: "100+ Services", label: "Pre-configured containers" },
  { num: "5M+ Downloads", label: "From Docker Hub" },
  { num: "450+ Contributors", label: "Built by the community" },
  { num: "10+ Years", label: "Battle-tested since 2015" },
];

const svg = (paths: ReactNode) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const ICONS: Record<string, ReactNode> = {
  web: svg(<><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></>),
  php: svg(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 6l-4 12" />),
  db: svg(<><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  gui: svg(<><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 9h18M9 9v11" /></>),
  cache: svg(<path d="M13 2 4.5 13H11l-1 9 9-12h-6.5L13 2Z" />),
  search: svg(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
  ai: svg(<path d="M12 3l1.7 4.1L18 9l-4.3 1.9L12 15l-1.7-4.1L6 9l4.3-1.9L12 3Z" />),
  queue: svg(<path d="M3 12h5l1.5 3h5L16 12h5M5 12V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" />),
  realtime: svg(<><path d="M4.9 11a7 7 0 0 1 14.2 0M8 12.5a3.5 3.5 0 0 1 8 0" /><circle cx="12" cy="16" r="1.2" /></>),
  monitor: svg(<><path d="M4 4v16h16" /><path d="M7 14l4-4 3 3 5-6" /></>),
  devops: svg(<><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>),
  cloud: svg(<path d="M7 18a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17.5 18H7Z" />),
  mail: svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  ide: svg(<><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 20h20" /></>),
  security: svg(<path d="M12 3 5 6v6c0 4.2 3 7.4 7 8.5 4-1.1 7-4.3 7-8.5V6l-7-3Z" />),
  speed: svg(<path d="M13 2 4.5 13H11l-1 9 9-12h-6.5L13 2Z" />),
  modular: svg(<><line x1="4" y1="8" x2="20" y2="8" /><circle cx="9" cy="8" r="2.2" /><line x1="4" y1="16" x2="20" y2="16" /><circle cx="15" cy="16" r="2.2" /></>),
  cross: svg(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.4 4 5.7 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.7-4-9s1.4-6.6 4-9Z" /></>),
  layers: svg(<><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>),
  toggle: svg(<><rect x="2" y="8" width="20" height="8" rx="4" /><circle cx="16" cy="12" r="2.3" /></>),
  file: svg(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /></>),
  stack: svg(<><rect x="3" y="3" width="13" height="13" rx="1.5" /><path d="M8 21h11a2 2 0 0 0 2-2V8" /></>),
  edit: svg(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>),
  rocket: svg(<><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>),
};

const BENEFITS: { icon: string; title: string; text: string }[] = [
  { icon: "php", title: "Any PHP Version", text: "Run any version from 5.6 to 8.5. Set PHP_VERSION in .env, rebuild, and you're on it." },
  { icon: "layers", title: "100+ Ready-made Services", text: "Databases, caches, queues, search engines, and more, all pre-configured and waiting." },
  { icon: "ide", title: "All-in-One Dev Shell", text: "Run Artisan, Composer, Node, and any CLI inside workspace container, nothing on host." },
  { icon: "db", title: "Pick Your Database", text: "MySQL, PostgreSQL, MariaDB, MongoDB, Redis, and many others, ready to switch on." },
  { icon: "cross", title: "Framework-Agnostic", text: "Works great with Laravel, Symfony, WordPress, Magento, Drupal, or plain PHP, on the same stack." },
  { icon: "ai", title: "Local AI, Built In", text: "Run LLMs and vector search locally with Ollama, LiteLLM, pgvector, Qdrant, and more, no keys or cloud bills." },
  { icon: "toggle", title: "Toggle Services On Demand", text: "Start only what a project needs with docker compose up, and stop them easily." },
  { icon: "cloud", title: "One Environment Everywhere", text: "Identical setup on Linux, macOS, and Windows, so your team shares the same stack." },
  { icon: "file", title: "Configure From One File", text: "Every service ships pre-configured; override any setting with 1 line in .env, always wins." },
  { icon: "web", title: "Web Server Ready", text: "NGINX, Apache, and Caddy come pre-configured to serve your code out of the box." },
  { icon: "stack", title: "One or Many Projects", text: "Run a dedicated Laradock per project, or share a single setup across all of them." },
  { icon: "rocket", title: "Deploy to Production", text: "Turn your dev stack into a hardened image with ./laradock ship, then run it anywhere, a server, Kubernetes (EKS/GKE), or managed clouds like AWS ECS and Cloud Run." },
];

// SYNC: this service list is one of THREE places that list Laradock services.
// Category names and items must match the "Supported Services" tables in
// DOCUMENTATION/docs/Intro.md and README.md exactly (same category names, same
// members). Adding a service = update all three. Rows below are a purely visual
// grouping (edge -> app -> data -> async/observability -> infra -> tooling); they
// carry no meaning beyond layout, so it's fine to reflow them.
type Card = { type: string; icon: string; items: string[] };
const LAYERS: Card[][] = [
  [
    { type: "Web Servers", icon: "web", items: ["NGINX", "Apache2", "Caddy", "OpenResty", "Tomcat", "FrankenPHP"] },
    { type: "Load Balancers", icon: "web", items: ["HAProxy", "Traefik"] },
  ],
  [
    { type: "PHP Compilers", icon: "php", items: ["PHP FPM", "RoadRunner"] },
    { type: "PHP Extensions", icon: "php", items: ["Swoole", "Blackfire", "Phalcon", "PHP Worker", "Laravel Horizon"] },
    { type: "Real-time Communication", icon: "realtime", items: ["Laravel Echo", "Laravel Reverb", "Mercure", "Soketi"] },
  ],
  [
    { type: "Database Management Systems", icon: "db", items: ["MySQL", "PostgreSQL", "PostGIS", "pgvector", "MariaDB", "Percona", "MSSQL", "MongoDB", "Neo4j", "CouchDB", "RethinkDB", "Cassandra", "ClickHouse", "Tarantool"] },
    { type: "Database Management Tools", icon: "gui", items: ["PhpMyAdmin", "Adminer", "PgAdmin", "MongoDB Web UI", "Tarantool Admin", "pgbackups"] },
  ],
  [
    { type: "Vector Databases", icon: "ai", items: ["pgvector", "Qdrant", "Weaviate", "Chroma"] },
    { type: "Graph / Multi-model Databases", icon: "db", items: ["Neo4j", "ArangoDB", "SurrealDB"] },
    { type: "Time-series Databases", icon: "db", items: ["InfluxDB"] },
  ],
  [
    { type: "Cache Engines", icon: "cache", items: ["Redis", "Redis Web UI", "Redis Cluster", "Valkey", "Dragonfly", "Memcached", "Aerospike", "Varnish", "SSDB"] },
    { type: "Search Engines", icon: "search", items: ["ElasticSearch", "OpenSearch", "Apache Solr", "Manticore Search", "Typesense", "Meilisearch", "Dejavu"] },
  ],
  [
    { type: "AI / LLM", icon: "ai", items: ["Ollama", "LocalAI", "LiteLLM"] },
    { type: "Agentic / Automation", icon: "ai", items: ["n8n", "Flowise"] },
  ],
  [
    { type: "Message Brokers", icon: "queue", items: ["RabbitMQ", "RabbitMQ Admin Console", "Beanstalkd", "Beanstalkd Admin Console", "Eclipse Mosquitto", "Gearman", "NATS", "Apache Kafka", "Kafka Manager"] },
    { type: "Coordination Services", icon: "devops", items: ["Apache ZooKeeper"] },
  ],
  [
    { type: "Log Management", icon: "monitor", items: ["GrayLog", "Kibana", "LogStash"] },
    { type: "Monitoring", icon: "monitor", items: ["Grafana", "NetData", "Prometheus"] },
    { type: "Analytics / BI", icon: "monitor", items: ["Metabase"] },
  ],
  [
    { type: "Container Management", icon: "cloud", items: ["Portainer", "Docker Registry"] },
    { type: "Cloud Tools", icon: "cloud", items: ["AWS EB CLI", "Amazon Simple Queue Service"] },
    { type: "Object Storage", icon: "cloud", items: ["Minio"] },
  ],
  [
    { type: "CI/CD Tools", icon: "devops", items: ["Jenkins", "SonarQube", "Gitlab", "GitLab Runner", "OneDev"] },
    { type: "Security & Identity Tools", icon: "security", items: ["Certbot", "Keycloak"] },
  ],
  [
    { type: "Mail Servers", icon: "mail", items: ["Mailu", "MailCatcher", "Mailhog", "MailDev", "Mailpit"] },
    { type: "Testing", icon: "ide", items: ["Selenium"] },
    { type: "IDEs", icon: "ide", items: ["Theia"] },
  ],
  [
    { type: "API Documentation", icon: "gui", items: ["Swagger UI", "Swagger Editor"] },
    { type: "Image Processing", icon: "gui", items: ["Thumbor"] },
    { type: "Collaboration", icon: "mail", items: ["Confluence"] },
  ],
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Use Docker First - Learn About It Later! ${siteConfig.title}`}
      description="Laradock: Full PHP development environment on Docker."
    >
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={styles.page}>
        {/* ===== HERO ===== */}
        <header className={styles.hero}>
          <div className={styles.heroPhoto} aria-hidden="true" />
          <div className={styles.heroDots} aria-hidden="true" />
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>A full PHP development environment for Docker</span>
              <h1 className={styles.title}>
                Your full <span className={styles.accentAlt}>PHP stack</span>,
                <br />
                <span className={styles.accent}>one command</span> away.
              </h1>
              <p className={styles.subtitle}>
                Pre-configured Docker containers for PHP, MySQL, Redis and
                100+ more services. Clone, run one command, and start building, with
                zero manual setup and zero Docker knowledge.
              </p>
              <div className={styles.ctaRow}>
                <Link className={styles.btnPrimary} to="/docs/Intro">
                  Get Started
                </Link>
                <Link
                  className={styles.btnGhost}
                  to="https://github.com/laradock/laradock"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
                  </svg>
                  12K ★ on GitHub
                </Link>
              </div>
              <div className={styles.heroTerminal}>
                <div className={styles.terminal}>
                  <div className={styles.terminalBar}>
                    <span />
                    <span />
                    <span />
                    <em>bash</em>
                  </div>
                  <div className={styles.terminalBody}>
                    <div>
                      <span className={styles.prompt}>$</span>git clone https://github.com/laradock/laradock.git
                    </div>
                    <div>
                      <span className={styles.prompt}>$</span>cd laradock
                    </div>
                    <div>
                      <span className={styles.prompt}>$</span>./laradock start
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.heroSide}>
              <span className={styles.motto}>Use Docker first · Learn it later</span>
              <div className={styles.stats}>
                {STATS.map((s) => (
                  <div className={styles.stat} key={s.label}>
                    <span className={styles.statNum}>{s.num}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ===== SERVICES BY TYPE ===== */}
        <section className={styles.services}>
          <div className={styles.servicesInner}>
            <div className={styles.svcHead}>
              <span className={styles.svcKicker}>// one stack, everything included</span>
              <h2 className={styles.svcSecTitle}>Every layer of your stack, covered</h2>
            </div>
            <div className={styles.layers}>
              {LAYERS.map((row, r) => (
                <div className={styles.layerRow} key={r}>
                  {row.map((g) => (
                    <div className={styles.card} key={g.type} style={{ flexGrow: g.items.length }}>
                      <div className={styles.cardHead}>
                        <span className={styles.cardIcon}>{ICONS[g.icon]}</span>
                        <h3 className={styles.cardTitle}>{g.type}</h3>
                        <span className={styles.cardCount}>{g.items.length}</span>
                      </div>
                      <div className={styles.svcChips}>
                        {g.items.map((s) => (
                          <span className={styles.chip} key={s}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <SupportBanner />

        {/* ===== WHY LARADOCK ===== */}
        <section className={styles.why}>
          <div className={styles.whyInner}>
            <div className={styles.svcHead}>
              <span className={styles.svcKicker}>// why laradock</span>
              <h2 className={styles.svcSecTitle}>Why developers reach for Laradock</h2>
            </div>
            <div className={styles.whyGrid}>
              {BENEFITS.map((b) => (
                <div className={styles.whyCard} key={b.title}>
                  <div className={styles.whyHead}>
                    <span className={styles.whyIcon}>{ICONS[b.icon]}</span>
                    <h3 className={styles.whyTitle}>{b.title}</h3>
                  </div>
                  <p className={styles.whyText}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SponsorsPage />
      </div>
    </Layout>
  );
}
