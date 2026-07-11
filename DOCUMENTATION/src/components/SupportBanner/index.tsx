import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const GH_SPONSORS = "https://github.com/sponsors/laradock";
const OPEN_COLLECTIVE = "https://opencollective.com/laradock";

// Monthly funding goal shown by the progress bar. Edit this one number.
const GOAL_MONTHLY = 1000;
// Shown instantly before the live number loads (and if the fetch fails).
// Snapshot of Open Collective yearlyIncome / 12. Live fetch overrides it.
const FALLBACK_MONTHLY = 478;

const usd = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export function GoalBar(): ReactNode {
  const [monthly, setMonthly] = useState(FALLBACK_MONTHLY);

  useEffect(() => {
    let active = true;
    fetch("https://opencollective.com/laradock.json")
      .then((r) => r.json())
      .then((d) => {
        if (active && typeof d?.yearlyIncome === "number") {
          setMonthly(Math.round(d.yearlyIncome / 12 / 100));
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      active = false;
    };
  }, []);

  const pct = Math.min((monthly / GOAL_MONTHLY) * 100, 100);

  return (
    <div className={styles.goal}>
      <div className={styles.goalRow}>
        <span className={styles.goalAmount}>{usd(monthly)}/mo raised</span>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${pct.toFixed(0)}%` }} />
        </div>
        <span className={styles.goalAmount}>{usd(GOAL_MONTHLY)}/mo goal</span>
      </div>
      <span className={styles.goalPct}>
        {pct.toFixed(0)}% of our monthly goal · help us close the gap
      </span>
    </div>
  );
}

export default function SupportBanner(): ReactNode {
  return (
    <section className={styles.support} aria-labelledby="support-title">
      <div className={styles.inner}>
        <span className={styles.kicker}>// Keeping the PHP ecosystem alive</span>
        <h2 id="support-title" className={styles.title}>
          Trusted by 100K+ developers worldwide
        </h2>
        <p className={styles.lede}>

          If it saves you time, help us keep it alive for the developers who rely on it every day.
          <br />
          Prefer{" "}
          <strong>invoice or bank transfer</strong>? Open Collective handles both.
        </p>

        <GoalBar />

        <div className={styles.ctaRow}>
          <a
            className={clsx(styles.btn, styles.btnPrimary)}
            href={GH_SPONSORS}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sponsor on GitHub →
          </a>
          <a
            className={clsx(styles.btn, styles.btnHollow)}
            href={OPEN_COLLECTIVE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Via Open Collective →
          </a>
        </div>
      </div>
    </section>
  );
}
