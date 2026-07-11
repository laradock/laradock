import { useEffect, useState, type ReactNode } from "react";
import styles from "./StatsTicker.module.css";

type Stat = { num: string; label: string };

const STATS: Stat[] = [
  { num: "100+ Services", label: "Pre-configured containers" },
  { num: "5M+ Downloads", label: "From Docker Hub" },
  { num: "450+ Contributors", label: "Built by the community" },
  { num: "10+ Years", label: "Battle-tested since 2015" },
  { num: "12K+ Stars", label: "Loved on GitHub" },
  { num: "MIT Licensed", label: "Free & open-source" },
  { num: "Zero Config", label: "Runs out of the box" },
  { num: "3 Platforms", label: "Linux · macOS · Windows" },
];

function Item({ stat, hidden }: { stat: Stat; hidden?: boolean }): ReactNode {
  return (
    <div className={styles.item} aria-hidden={hidden || undefined}>
      <span className={styles.diamond} aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.num}>{stat.num}</span>
        <span className={styles.label}>{stat.label}</span>
      </span>
    </div>
  );
}

export default function StatsTicker(): ReactNode {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (reduced) {
    return (
      <section className={styles.ticker} aria-label="Laradock by the numbers">
        <div className={styles.staticRow}>
          {STATS.map((s) => (
            <Item key={s.label} stat={s} />
          ))}
        </div>
      </section>
    );
  }

  // The track holds two identical halves; the CSS scrolls it to -50% and loops,
  // so the second half seamlessly takes over. Each half repeats the four stats
  // enough times to overflow wide screens (no gap at the loop point).
  const half = [...STATS, ...STATS];
  const items = [...half, ...half];
  return (
    <section className={styles.ticker} aria-label="Laradock by the numbers">
      <div className={styles.track}>
        {items.map((s, i) => (
          <Item key={i} stat={s} hidden={i >= STATS.length} />
        ))}
      </div>
    </section>
  );
}
