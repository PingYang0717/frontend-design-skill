import React from 'react';
import { Outlet } from 'react-router';

import DataBoundary from '@/components/common/DataBoundary';
import { useTranslations } from '@/i18n/useTranslations';

/** 不需要登入、也沒有外殼的頁面(登入頁)用的版面:只提供 lazy 頁面需要的 Suspense 與錯誤邊界。 */
const PublicLayout: React.FC = () => {
  const t = useTranslations();

  return (
    <DataBoundary what={t.app.name}>
      <Outlet />
    </DataBoundary>
  );
};

export default PublicLayout;
