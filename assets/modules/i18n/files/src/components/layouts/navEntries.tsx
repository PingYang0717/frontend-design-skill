import type { ReactNode } from 'react';
import { AppstoreOutlined, HomeOutlined } from '@ant-design/icons';

import { ROUTES } from '@/constants/routes';
import type { Translations } from '@/i18n/zhTW';

/** 側欄選單與路由的共同來源。加一個入口:
 *  1. ROUTES 加路徑 → 2. 這裡加一列 → 3. `app/navPages.tsx` 把 key 對到頁面(少對或多對都 typecheck 失敗)。
 *  選單與路由都從這一份長出來,不用分別維護(選了 permissions 模組時權限守衛也從這裡長)。 */
export interface NavEntry {
  key: NavKey;
  path: string;
  icon: ReactNode;
  label: (t: Translations) => string;
}

export type NavKey = 'home' | 'items';

export const NAV_ENTRIES: NavEntry[] = [
  {
    key: 'home',
    path: ROUTES.home,
    icon: <HomeOutlined />,
    label: (t) => t.nav.home,
  },
  {
    key: 'items',
    path: ROUTES.items,
    icon: <AppstoreOutlined />,
    label: (t) => t.nav.items,
  },
];
