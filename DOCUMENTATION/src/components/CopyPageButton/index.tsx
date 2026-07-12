/**
 * CopyPageButton — pill split-button for the top of each doc page.
 *
 * Both actions hand an AI the same prompt: a link to this page's Markdown plus a
 * mission (summarize + explain how to use it) and a few editable follow-up
 * questions. We point the model at the page rather than embedding the content,
 * since the AI can fetch the .md itself, and a short prompt always fits in a
 * `?q=` deep-link.
 *
 *   - Left pill "Copy page"  -> copies the prompt to the clipboard.
 *   - Chevron dropdown       -> Open Markdown, or "Chat in {provider}" deep-links.
 *
 * The per-page .md files are emitted at build time by scripts/generate-llms.js
 * and served at /docs/<slug>.md.
 */
import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {AI_ASK_PROVIDERS} from './aiProviders';
import styles from './styles.module.css';

// One short, generic prompt for every page (only the link changes): point the
// AI at the page, ask it to read + summarize, then wait for the user's question.
const buildPrompt = (mdUrl: string) =>
  `Read and summarize this page from the Laradock documentation (a Docker-based PHP development environment), then wait for my follow-up question:

${mdUrl}`;

export default function CopyPageButton() {
  const {pathname} = useLocation();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const mdUrl = `${pathname.replace(/\/+$/, '')}.md`;
  const prompt = buildPrompt(`${origin}${mdUrl}`);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt).catch(() => undefined);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.group}>
        <button type="button" className={styles.main} onClick={copyPrompt} title="Copy an AI prompt for this page">
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied' : 'Copy page'}</span>
        </button>
        <button
          type="button"
          className={styles.chevron}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          title="More options"
        >
          <ChevronIcon />
        </button>
      </div>

      {open && (
        <div className={styles.menu} role="menu">
          <a className={styles.item} role="menuitem" href={mdUrl} target="_blank" rel="noopener noreferrer">
            <ExternalIcon /> Open Markdown
          </a>
          <div className={styles.sep} />
          {AI_ASK_PROVIDERS.map((p) => (
            <a
              key={p.id}
              className={styles.item}
              role="menuitem"
              href={p.buildHref(prompt)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <p.Icon className={styles.icon} style={{color: p.color}} /> Chat in {p.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const CopyIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ChevronIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const ExternalIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6M10 14 21 3" />
  </svg>
);
