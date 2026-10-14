import React from 'react';
import { Outlet } from 'react-router';

import DataBoundary from '@/components/common/DataBoundary';
import { APP_NAME } from '@/constants/app';

/** 不需要登入、也沒有外殼的頁面(登入頁)用的版面:只提供 lazy 頁面需要的 Suspense 與錯誤邊界。 */
const PublicLayout: React.FC = () => (
  <DataBoundary what={APP_NAME}>
    <Outlet />
  </DataBoundary>
);

export default PublicLayout;
