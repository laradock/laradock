import { useEffect, useState, type ReactNode } from "react";
import styles from "./styles.module.css";

const GOAL_MONTHLY = 1000;
const FALLBACK_MONTHLY = 478;
const GH_SPONSORS = "https://github.com/sponsors/laradock";
const OPEN_COLLECTIVE = "https://opencollective.com/laradock";

const usd = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function SidebarSponsor(): ReactNode {
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
    <div className={styles.box}>
      <span className={styles.label}>Keep Laradock alive</span>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct.toFixed(0)}%` }} />
      </div>
      <span className={styles.meta}>
        {usd(monthly)}/mo · {pct.toFixed(0)}% of goal
      </span>
      <a
        className={styles.btn}
        href={GH_SPONSORS}
        target="_blank"
        rel="noopener noreferrer"
      >
        ❤ Sponsor on GitHub
      </a>
      <a
        className={styles.btnHollow}
        href={OPEN_COLLECTIVE}
        target="_blank"
        rel="noopener noreferrer"
      >
        Or via Open Collective
      </a>
    </div>
  );
}
