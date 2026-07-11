// Fills the navbar version badge from the latest GitHub release at runtime, so it
// stays correct without rebuilding the docs (CI does a shallow clone with no tags,
// so build-time `git describe` can't see the version).
//
// ponytail: reads GitHub's public releases API client-side. The 60/hr unauth limit
// is per visitor IP, so site traffic never pools against one budget. localStorage
// caches the tag for an instant, flicker-free paint; a background refresh keeps it
// current. On any failure the badge keeps its cached value or stays hidden.

const API = 'https://api.github.com/repos/laradock/laradock/releases/latest';
const RELEASES = 'https://github.com/laradock/laradock/releases';
const CACHE_KEY = 'laradock-latest-tag';
// Only letters/digits/dots/dashes/underscores: never trust the API value into an href.
const SAFE_TAG = /^[\w.-]+$/;

function paint(tag: string): void {
  const el = document.querySelector<HTMLAnchorElement>('.navbar-version-badge');
  if (!el || !SAFE_TAG.test(tag)) return;
  el.textContent = tag;
  el.href = `${RELEASES}/tag/${tag}`;
}

function readCache(): string | null {
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch {
    return null; // Safari private mode etc.
  }
}

async function refresh(): Promise<void> {
  try {
    const res = await fetch(API, {headers: {Accept: 'application/vnd.github+json'}});
    if (!res.ok) return;
    const {tag_name} = (await res.json()) as {tag_name?: string};
    if (!tag_name || !SAFE_TAG.test(tag_name)) return;
    try {
      localStorage.setItem(CACHE_KEY, tag_name);
    } catch {
      /* storage full / blocked: fine, we still paint */
    }
    paint(tag_name);
  } catch {
    /* offline / rate-limited / API down: keep cached value or stay hidden */
  }
}

let refreshed = false;

function boot(): void {
  const cached = readCache();
  if (cached) paint(cached); // instant paint from last known tag
  if (!refreshed) {
    refreshed = true;
    void refresh(); // check for a newer tag once per full page load
  }
}

// SPA route changes re-render the navbar; re-run boot() so the badge survives nav.
export function onRouteDidUpdate(): void {
  boot();
}

if (typeof window !== 'undefined') {
  boot();
}
