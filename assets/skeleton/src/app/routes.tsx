import type { RouteObject } from 'react-router';

import RequirePermission from '@/components/auth/RequirePermission';
import { NAV_ENTRIES } from '@/components/layouts/navEntries';
import RootLayout from '@/components/layouts/RootLayout';
import { ROUTES } from '@/constants/routes';
import ForbiddenPage from '@/pages/Forbidden/ForbiddenPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { NAV_PAGES } from './navPages';

/** 路由表。正式環境由 router.tsx 建立,測試用 createMemoryRouter 載入同一份。 */
export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
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
