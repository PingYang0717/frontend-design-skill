import React from 'react';

import DataBoundary from '@/components/common/DataBoundary';
import { APP_NAME } from '@/constants/app';
import AppShell from './AppShell';

/** 外殼本身也包一個邊界:選了 permissions 模組後外殼會讀權限清單(useSuspenseQuery),需要 Suspense 與錯誤卡。
 *  外殼採用公司公版時,把 AppShell 換成 vendor/companyUi 匯出的 CompanyShell(docs/conventions/access.md 第 4 節)。 */
const RootLayout: React.FC = () => (
  <DataBoundary what={APP_NAME}>
    <AppShell />
  </DataBoundary>
);

export default RootLayout;
