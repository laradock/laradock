/**
 * Wraps the theme breadcrumbs so the "Copy page" pill sits on the same row,
 * top-right, instead of taking its own line above the page title.
 */
import React from 'react';
import Breadcrumbs from '@theme-original/DocBreadcrumbs';
import type BreadcrumbsType from '@theme/DocBreadcrumbs';
import type {WrapperProps} from '@docusaurus/types';
import CopyPageButton from '@site/src/components/CopyPageButton';
import styles from './styles.module.css';

type Props = WrapperProps<typeof BreadcrumbsType>;

export default function DocBreadcrumbsWrapper(props: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.crumbs}>
        <Breadcrumbs {...props} />
      </div>
      <CopyPageButton />
    </div>
  );
}
