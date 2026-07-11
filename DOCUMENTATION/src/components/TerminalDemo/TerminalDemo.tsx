import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./TerminalDemo.module.css";

// A condensed `./laradock setup` story that shows the real wizard interaction:
// each question opens a small menu, the → cursor browses the options and picks
// one, the answer lands in the summary block, then the stack auto-starts.
// Animated in the browser instead of a GIF: crisp, selectable, instant.
//
// Fixed card size: every block is always rendered (menu area reserves its max
// line count) and lines are hidden via `visibility` until their turn.

type Question = {
  label: string;
  options: string[];
  target: number; // index the cursor ends on (the picked option)
  moves: number[]; // cursor positions to walk through before settling
};

const CMD = "./laradock start";

const QUESTIONS: Question[] = [
  { label: "Project", options: ["laravel", "symfony", "wordpress", "magento", "php"], target: 0, moves: [1, 2, 1, 0] },
  { label: "PHP version", options: ["8.5", "8.4", "8.3", "8.2", "8.1"], target: 1, moves: [1] },
  { label: "Web server", options: ["nginx", "apache2", "caddy", "frankenphp", "none"], target: 0, moves: [] },
  { label: "Database", options: ["mysql", "postgres", "mariadb", "mongo", "none"], target: 0, moves: [1, 0] },
  { label: "Cache", options: ["redis", "valkey", "memcached", "varnish", "none"], target: 0, moves: [] },
];

const BOOT = [
  { kind: "ok", text: "Saved .env · starting your stack…" },
  { kind: "started", text: "laradock-mysql-1" },
  { kind: "started", text: "laradock-redis-1" },
  { kind: "started", text: "laradock-nginx-1" },
  { kind: "blank", text: "" },
  { kind: "up", text: "Laradock is up." },
  { kind: "app", text: "http://localhost" },
] as const;

// menu area = title + 5 options + hint; boot block is 7 lines too, so the
// region below the answers never changes height.
const REGION_LINES = 7;
const TYPE_MS = 34;
const MOVE_MS = 200;
const HOLD_MS = 6000;

type Demo = {
  typed: number; // chars of CMD typed
  checks: number; // ✓ lines shown (0-2)
  answers: number; // questions answered so far
  menuQ: number | null; // open question index
  cursor: number; // cursor position inside the open menu
  boot: number; // boot lines shown
};

const START: Demo = { typed: 0, checks: 0, answers: 0, menuQ: null, cursor: 0, boot: 0 };
const FINAL: Demo = { typed: CMD.length, checks: 2, answers: QUESTIONS.length, menuQ: null, cursor: 0, boot: BOOT.length };

export default function TerminalDemo(): ReactNode {
  const [d, setD] = useState<Demo>(START);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setD(FINAL);
      return;
    }

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const run = () => {
      clear();
      setD(START);
      let at = 400;
      const step = (ms: number, patch: Partial<Demo>) => {
        at += ms;
        timers.current.push(window.setTimeout(() => setD((p) => ({ ...p, ...patch })), at));
      };

      for (let c = 1; c <= CMD.length; c++) step(TYPE_MS, { typed: c });
      step(400, { checks: 1 });
      step(280, { checks: 2 });
      QUESTIONS.forEach((q, i) => {
        step(420, { menuQ: i, cursor: 0 });
        q.moves.forEach((m) => step(MOVE_MS, { cursor: m }));
        step(440, { menuQ: null, answers: i + 1 }); // enter: pick + collapse
      });
      step(400, { boot: 1 });
      step(300, { boot: 2 });
      step(260, { boot: 3 });
      step(260, { boot: 4 });
      step(140, { boot: 5 });
      step(260, { boot: 6 });
      step(220, { boot: 7 });
      at += HOLD_MS;
      timers.current.push(window.setTimeout(run, at)); // loop
    };

    // Start when the card is on screen; immediately if already visible.
    const el = wrapRef.current;
    const inView = () => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    if (inView()) {
      run();
      return () => clear();
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { run(); io.disconnect(); }
      }),
      { threshold: 0.35 },
    );
    if (el) io.observe(el);
    return () => { io.disconnect(); clear(); };
  }, []);

  const typing = d.typed < CMD.length;
  const q = d.menuQ === null ? null : QUESTIONS[d.menuQ];

  // The region below the answers: an open menu, the boot log, or reserved space.
  const region: ReactNode[] = [];
  if (q) {
    region.push(
      <div key="t" className={styles.dim}>{q.label} · ↑↓ move · enter selects</div>,
    );
    q.options.forEach((opt, i) => {
      const on = i === d.cursor;
      region.push(
        <div key={opt}>
          <span className={styles.pickArrow}>{on ? "  → " : "    "}</span>
          <span className={on ? styles.optActive : styles.dim}>{opt}</span>
        </div>,
      );
    });
    region.push(<div key="h" className={styles.dim}>{q.options.length} match(es)</div>);
  } else {
    BOOT.forEach((b, i) => {
      const hide = i >= d.boot;
      const cls = hide ? styles.hidden : undefined;
      region.push(
        b.kind === "blank" ? <div key={i} className={cls}> </div>
        : b.kind === "ok" ? <div key={i} className={cls}><span className={styles.ok}>✓</span> {b.text}</div>
        : b.kind === "started" ? (
          <div key={i} className={cls}>
            <span className={styles.ok}>✔</span> Container {b.text}
            <span className={styles.status}>  Started</span>
          </div>
        )
        : b.kind === "up" ? <div key={i} className={`${styles.bold} ${cls ?? ""}`}>{b.text}</div>
        : (
          <div key={i} className={cls}>
            <span className={styles.urlLabel}>App</span>
            <span className={styles.link}>{b.text}</span>
          </div>
        ),
      );
    });
  }
  while (region.length < REGION_LINES) region.push(<div key={`pad${region.length}`} className={styles.hidden}> </div>);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.terminal}>
        <div className={styles.bar}>
          <span /><span /><span />
          <em>laradock — bash</em>
        </div>
        <div className={styles.body} aria-label={`Terminal: ${CMD}`}>
          <div>
            <span className={styles.prompt}>$</span>
            {CMD.slice(0, d.typed)}
            {typing && <span className={styles.caret} aria-hidden="true" />}
          </div>
          <div className={d.checks < 1 ? styles.hidden : undefined}>
            <span className={styles.ok}>✓</span> Docker running · Compose v2.29
          </div>
          <div className={d.checks < 2 ? styles.hidden : undefined}>
            <span className={styles.ok}>✓</span> Detected a PHP project → Laravel
          </div>
          <div> </div>
          {QUESTIONS.map((qq, i) => (
            <div key={qq.label} className={i >= d.answers ? styles.hidden : undefined}>
              <span className={styles.pickLabel}>{qq.label}</span>
              <span className={styles.pickArrow}>›</span>
              <span className={styles.pickVal}>{qq.options[qq.target]}</span>
            </div>
          ))}
          <div> </div>
          {region}
        </div>
      </div>
    </div>
  );
}
