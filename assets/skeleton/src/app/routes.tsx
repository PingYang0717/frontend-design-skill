import type { RouteObject } from 'react-router';

import RequireAuth from '@/components/auth/RequireAuth';
import RequirePermission from '@/components/auth/RequirePermission';
import { NAV_ENTRIES } from '@/components/layouts/navEntries';
import PublicLayout from '@/components/layouts/PublicLayout';
import RootLayout from '@/components/layouts/RootLayout';
import { ROUTES } from '@/constants/routes';
import ForbiddenPage from '@/pages/Forbidden/ForbiddenPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { NAV_PAGES } from './navPages';
import { LoginPage } from './subPages';

/** 路由表。正式環境由 router.tsx 建立,測試用 createMemoryRouter 載入同一份。
 *  兩個區域:不需登入的 PublicLayout(登入頁),以及 RequireAuth 守住的 RootLayout(外殼與所有功能頁)。 */
export const appRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      ...NAV_ENTRIES.map((entry) => {
        const Page = NAV_PAGES[entry.key];
        return {
          path: entry.path,
          element: (
            <RequirePermission permission={entry.permission}>
              <Page />
            </RequirePermission>
          ),
        };
      }),
      { path: ROUTES.forbidden, element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
