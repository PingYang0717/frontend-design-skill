import React from 'react';
import { Button, Result, Typography } from 'antd';

import { useTranslations } from '@/i18n/useTranslations';
import { describeLoadError } from '@/utils/describeError';

import styles from './LoadErrorPanel.module.css';

interface LoadErrorPanelProps {
  error: unknown;
  /** 這個區塊在載入什麼,例如「項目」。 */
  what: string;
  onRetry?: () => void;
}

/** 讀取失敗的錯誤卡。主句與說明來自字典,後端原話只放在可展開的技術細節。 */
const LoadErrorPanel: React.FC<LoadErrorPanelProps> = ({ error, what, onRetry }) => {
  const t = useTranslations();

  const copy = describeLoadError(error, what, t);

  return (
    <Result
      status="error"
      title={copy.heading}
      subTitle={copy.detail}
      extra={
        onRetry ? (
          <Button type="primary" onClick={onRetry}>
            {t.common.retry}
          </Button>
        ) : null
      }
    >
      {copy.technical ? (
        <details className={styles.technical}>
          <summary>{t.errors.technicalDetail}</summary>
          <Typography.Text type="secondary" code>
            {copy.technical}
          </Typography.Text>
        </details>
      ) : null}
    </Result>
  );
};

export default LoadErrorPanel;
