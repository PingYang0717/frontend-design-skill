import React from 'react';

import DataBoundary from '@/components/common/DataBoundary';
import { useTranslations } from '@/i18n/useTranslations';
import AppShell from './AppShell';

/** 外殼需要目前使用者(選單依權限過濾),所以外殼本身也包一個邊界。 */
const RootLayout: React.FC = () => {
  const t = useTranslations();

  return (
    <DataBoundary what={t.app.name}>
      <AppShell />
    </DataBoundary>
  );
};

export default RootLayout;
