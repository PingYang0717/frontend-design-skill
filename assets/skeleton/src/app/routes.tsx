import type { RouteObject } from 'react-router';

import { NAV_ENTRIES } from '@/components/layouts/navEntries';
import RootLayout from '@/components/layouts/RootLayout';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { NAV_PAGES } from './navPages';

/** 路由表。正式環境由 router.tsx 建立,測試用 createMemoryRouter 載入同一份。
 *  沒有登入區域:登入由公司 SDK 在進站前處理,進得來就是已登入(docs/conventions/access.md)。
 *  選了 permissions 模組時,每個 Page 外面多包一層 RequirePermission(模組 README 第 3 節)。 */
export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      ...NAV_ENTRIES.map((entry) => {
        const Page = NAV_PAGES[entry.key];
        return { path: entry.path, element: <Page /> };
      }),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
