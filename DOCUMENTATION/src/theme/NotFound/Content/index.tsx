import { useEffect } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";

// Any nonexistent docs URL (old links, typos, renamed pages) lands here instead
// of a dead end. Brief message, then send visitors to the docs home so they can
// keep going instead of bouncing off a 404.
const REDIRECT_TO = "/docs/Intro";
const REDIRECT_DELAY_MS = 1500;

export default function NotFoundContent({ className }: { className?: string }): ReactNode {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.replace(REDIRECT_TO);
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className={clsx("container margin-vert--xl", className)}>
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Heading as="h1" className="hero__title">
            Page Not Found
          </Heading>
          <p>We could not find what you were looking for.</p>
          <p>
            Taking you to the <a href={REDIRECT_TO}>docs home</a>…
          </p>
        </div>
      </div>
    </main>
  );
}
