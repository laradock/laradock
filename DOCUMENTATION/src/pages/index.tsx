import Link from "@docusaurus/Link";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import SponsorsPage from "../components/SponsorsPage";

const STATS = [
  { num: "70+ Services", label: "Pre-configured containers" },
  { num: "3 Operating Systems", label: "Linux · macOS · Windows" },
  { num: "4.8M Downloads", label: "From Docker Hub" },
  { num: "10+ Years", label: "Battle-tested since 2015" },
];

const svg = (paths: JSX.Element) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const ICONS: Record<string, JSX.Element> = {
  web: svg(<><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></>),
  php: svg(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 6l-4 12" />),
  db: svg(<><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  gui: svg(<><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 9h18M9 9v11" /></>),
  cache: svg(<path d="M13 2 4.5 13H11l-1 9 9-12h-6.5L13 2Z" />),
  search: svg(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
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
};

const BENEFITS: { icon: string; title: string; text: string }[] = [
  { icon: "speed", title: "Minutes, not hours", text: "Skip installing and configuring Nginx, databases, caches, and queues by hand. Clone, run one command, and start coding." },
  { icon: "modular", title: "Run only what you need", text: "Flip any of 70+ services on or off per project from a single .env file. No bloat, no leftover processes." },
  { icon: "cross", title: "Same on every OS", text: "An identical environment on Linux, macOS, and Windows, so your whole team builds on the exact same stack." },
];

type Card = { type: string; icon: string; items: string[] };
// Stacked top -> bottom as the layers of a running app: edge -> app -> data -> async/observability -> infra -> tooling.
const LAYERS: Card[][] = [
  [
    { type: "Web & Proxy", icon: "web", items: ["Nginx", "Apache", "Caddy", "OpenResty", "HAProxy", "Traefik"] },
  ],
  [
    { type: "PHP Runtime", icon: "php", items: ["PHP-FPM", "HHVM", "Swoole", "PHP Worker", "Horizon"] },
    { type: "Realtime", icon: "realtime", items: ["Laravel Echo", "Mercure", "Soketi"] },
  ],
  [
    { type: "Databases", icon: "db", items: ["MySQL", "PostgreSQL", "MariaDB", "Percona", "MSSQL", "MongoDB", "Neo4j", "CouchDB", "RethinkDB", "Cassandra", "ClickHouse", "Tarantool"] },
  ],
  [
    { type: "Cache & Memory", icon: "cache", items: ["Redis", "Redis Cluster", "Memcached", "Aerospike", "Varnish", "SSDB"] },
    { type: "Search", icon: "search", items: ["Elasticsearch", "Solr", "Manticore", "Dejavu"] },
    { type: "Database GUIs", icon: "gui", items: ["PhpMyAdmin", "Adminer", "PgAdmin", "Mongo UI", "Tarantool Admin"] },
  ],
  [
    { type: "Queues & Messaging", icon: "queue", items: ["RabbitMQ", "Beanstalkd", "NATS", "Gearman", "Mosquitto"] },
    { type: "Monitoring & Logs", icon: "monitor", items: ["Grafana", "NetData", "Kibana", "Logstash", "Graylog"] },
  ],
  [
    { type: "Containers & Cloud", icon: "cloud", items: ["Portainer", "Docker Registry", "Docker Web UI", "MinIO", "AWS EB", "AWS SQS"] },
    { type: "DevOps & CI", icon: "devops", items: ["Jenkins", "GitLab", "SonarQube"] },
  ],
  [
    { type: "Mail", icon: "mail", items: ["Mailpit", "MailHog", "MailCatcher", "MailDev", "Mailu"] },
    { type: "Dev Tools & IDEs", icon: "ide", items: ["Codiad", "Theia", "Web IDE", "Selenium", "Swagger UI", "Jupyter", "Xdebug"] },
    { type: "Security & Extras", icon: "security", items: ["Certbot", "Thumbor", "ZooKeeper", "React"] },
  ],
];

export default function Home(): JSX.Element {
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
                Your full PHP stack,
                <br />
                <span className={styles.accent}>one command</span> away.
              </h1>
              <p className={styles.subtitle}>
                Pre-configured Docker containers for Nginx, PHP, MySQL, Redis, and
                70+ more services. Clone, run one command, and start building, with
                zero manual setup.
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
                      <span className={styles.prompt}>$</span>docker-compose up -d nginx mysql redis
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
                  <span className={styles.whyIcon}>{ICONS[b.icon]}</span>
                  <h3 className={styles.whyTitle}>{b.title}</h3>
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
