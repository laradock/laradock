import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./index.module.css";
import WelcomePage from "../components/WelcomePage";
import SponsorsPage from "../components/SponsorsPage";
import CodeBlock from "@theme/CodeBlock";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const headerImage = useBaseUrl("/img/laradock/laradock-icon.png");

  return (
    <header
      className={clsx("hero", styles.heroBanner)}
      style={{
        backgroundImage: `url(${headerImage})`,
        backgroundPosition: "80% center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    >
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle" style={{ maxWidth: '480px' }}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={clsx("button", styles.bigColorfulButton)}
            to="/docs/Intro"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Use Docker First - Learn About It Later! ${siteConfig.title}`}
      description="Laradock: Full PHP development environment on Docker."
    >
      <HomepageHeader />
      <main>
        <WelcomePage />
        
        
        <section style={{ padding: "3rem 1rem", maxWidth: "760px", margin: "0 auto" }}>
          <Heading as="h2" style={{ textAlign: "center" }}>
            Up and Running in Seconds
          </Heading>
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            Clone, configure, and launch a full PHP stack with three commands.
          </p>
          <CodeBlock language="bash">{`git clone https://github.com/laradock/laradock.git
cp .env.example .env
docker-compose up -d nginx mysql phpmyadmin redis workspace`}</CodeBlock>
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            Then open <code>http://localhost</code>. That's it.
          </p>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link className="button button--primary button--lg" to="/docs/Intro">
              Get Started
            </Link>
          </div>
        </section>

        <SponsorsPage />
      </main>
    </Layout>
  );
}
