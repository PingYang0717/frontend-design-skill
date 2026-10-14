import React, { type ReactNode, Suspense } from 'react';
import { Spin } from 'antd';

import styles from './SuspenseLoader.module.css';

interface SuspenseLoaderProps {
  children: ReactNode;
  what: string;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({ children, what }) => (
  <Suspense
    fallback={
      <div className={styles.loader} role="status">
        <Spin description={`${what}載入中…`} />
      </div>
    }
  >
    {children}
  </Suspense>
);

export default SuspenseLoader;
