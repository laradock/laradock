/**
 * Consumer AI providers we deep-link into with a pre-filled prompt (the `?q=`
 * pattern), used by the docs "Copy page" dropdown ("Chat in {provider}").
 * buildHref(prompt) encodes the prompt into each provider's query param so the
 * user lands mid-conversation about the current page.
 */
import React, {type CSSProperties, type ComponentType} from 'react';

type IconProps = {className?: string; style?: CSSProperties};

function OpenAIIcon({className, style}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.826 19.946a4.504 4.504 0 0 1-6.226-1.642zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.676zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon({className, style}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(60 12 12)" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(120 12 12)" />
    </svg>
  );
}

function PerplexityIcon({className, style}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(45 12 12)" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(90 12 12)" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(135 12 12)" />
    </svg>
  );
}

function GeminiIcon({className, style}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 2C12 2 13.5 9.5 22 12C13.5 14.5 12 22 12 22C12 22 10.5 14.5 2 12C10.5 9.5 12 2 12 2Z" />
    </svg>
  );
}

export interface AiAskProvider {
  id: string;
  name: string;
  color: string;
  Icon: ComponentType<IconProps>;
  buildHref: (prompt: string) => string;
}

const withQuery = (base: string) => (prompt: string) => `${base}${encodeURIComponent(prompt)}`;

export const AI_ASK_PROVIDERS: AiAskProvider[] = [
  {id: 'chatgpt', name: 'ChatGPT', color: '#10a37f', Icon: OpenAIIcon, buildHref: withQuery('https://chatgpt.com/?q=')},
  {id: 'claude', name: 'Claude', color: '#D4623A', Icon: ClaudeIcon, buildHref: withQuery('https://claude.ai/new?q=')},
  {id: 'perplexity', name: 'Perplexity', color: '#20808D', Icon: PerplexityIcon, buildHref: withQuery('https://www.perplexity.ai/?q=')},
  {id: 'gemini', name: 'Gemini', color: '#4285F4', Icon: GeminiIcon, buildHref: withQuery('https://gemini.google.com/app?q=')},
];
