import type { ReactNode } from 'react';
import { AppstoreOutlined, HomeOutlined } from '@ant-design/icons';

import { type Permission, PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

/** 側欄選單與路由的共同來源。加一個入口:
 *  1. ROUTES 加路徑 → 2. 這裡加一列 → 3. `app/navPages.tsx` 把 key 對到頁面(少對或多對都 typecheck 失敗)。
 *  選單、路由、權限守衛都從這一份長出來,不用分別維護。 */
export interface NavEntry {
  key: NavKey;
  path: string;
  icon: ReactNode;
  label: string;
  /** 需要的權限;沒有權限時選單隱藏、直接輸入網址會被導到 403。 */
  permission?: Permission;
}

export type NavKey = 'home' | 'items';

export const NAV_ENTRIES: NavEntry[] = [
  {
    key: 'home',
    path: ROUTES.home,
    icon: <HomeOutlined />,
    label: '首頁',
  },
  {
    key: 'items',
    path: ROUTES.items,
    icon: <AppstoreOutlined />,
    label: '項目管理',
    permission: PERMISSIONS.itemsRead,
  },
];
