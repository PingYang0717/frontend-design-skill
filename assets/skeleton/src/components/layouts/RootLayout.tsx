import React from 'react';

import DataBoundary from '@/components/common/DataBoundary';
import { APP_NAME } from '@/constants/app';
import AppShell from './AppShell';

/** 外殼需要目前使用者(選單依權限過濾),所以外殼本身也包一個邊界。 */
const RootLayout: React.FC = () => (
  <DataBoundary what={APP_NAME}>
    <AppShell />
  </DataBoundary>
);

export default RootLayout;
