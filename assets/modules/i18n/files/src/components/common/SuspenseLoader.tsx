import React, { type ReactNode, Suspense } from 'react';
import { Spin } from 'antd';

import { useTranslations } from '@/i18n/useTranslations';

import styles from './SuspenseLoader.module.css';

interface SuspenseLoaderProps {
  children: ReactNode;
  what: string;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({ children, what }) => {
  const t = useTranslations();

  return (
    <Suspense
      fallback={
        <div className={styles.loader} role="status">
          <Spin description={t.common.loading(what)} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default SuspenseLoader;
