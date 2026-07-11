import { useEffect, useState } from "react";
import styles from "../pages/index.module.css";

// Top 30 supported projects, round-robin interleaved by category
// (framework → cms → e-commerce → app) so the rotation never clusters. Laravel leads.
const PROJECTS = [
  "Laravel", // framework
  "WordPress", // cms
  "Magento", // e-commerce
  "Moodle", // app
  "Symfony", // framework
  "Drupal", // cms
  "WooCommerce", // e-commerce
  "Nextcloud", // app
  "CodeIgniter", // framework
  "Joomla", // cms
  "PrestaShop", // e-commerce
  "MediaWiki", // app
  "Yii", // framework
  "October CMS", // cms
  "OpenCart", // e-commerce
  "phpBB", // app
  "CakePHP", // framework
  "Statamic", // cms
  "Shopware", // e-commerce
  "Matomo", // app
  "Slim", // framework
  "Craft CMS", // cms
  "Sylius", // e-commerce
  "Flarum", // app
  "Phalcon", // framework
  "TYPO3", // cms
  "Bagisto", // e-commerce
  "BookStack", // app
  "Laminas", // framework
  "Grav", // cms
];

const ROTATE_MS = 2200;

export default function RotatingProject() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((n) => (n + 1) % PROJECTS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, []);

  // key remount retriggers the fade animation on each change
  return (
    <span key={index} className={`${styles.accent} ${styles.rotWord}`}>
      {PROJECTS[index]}
    </span>
  );
}
