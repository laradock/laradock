import React, { type ReactNode } from "react";
import Link from "@docusaurus/Link";
import DocCardList from "@theme/DocCardList";
import { useCurrentSidebarCategory } from "@docusaurus/plugin-content-docs/client";
import styles from "./styles.module.css";

type Item = { type: string; label: string; href?: string; items?: Item[] };

/**
 * Hub landing-page cards. Each subcategory becomes one compact card that lists
 * its pages as links inside, instead of a giant card that only says "N items".
 * Flat categories (no subcategories) fall back to the stock DocCardList.
 * Everything derives from the current sidebar category, so it never drifts.
 */
export default function HubCardList(): ReactNode {
  const category = useCurrentSidebarCategory();
  const items = category.items as unknown as Item[];
  const subcategories = items.filter((i) => i.type === "category");

  if (subcategories.length === 0) {
    return <DocCardList items={category.items} />;
  }

  return (
    <div className={styles.grid}>
      {subcategories.map((sub) => (
        <div key={sub.label} className={styles.card}>
          <div className={styles.title}>{sub.label}</div>
          <ul className={styles.list}>
            {(sub.items ?? [])
              .filter((page) => page.href)
              .map((page) => (
                <li key={page.href}>
                  <Link to={page.href}>{page.label}</Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
