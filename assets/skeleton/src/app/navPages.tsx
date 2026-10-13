import React, { lazy } from 'react';

import type { NavKey } from '@/components/layouts/navEntries';

/** 選單入口 → 頁面。Record<NavKey, …> 讓「選單加了一列卻沒對頁面」直接 typecheck 失敗。
 *  頁面以 lazy 載入:每個入口各自一個 chunk。 */
export const NAV_PAGES: Record<NavKey, React.LazyExoticComponent<React.FC>> = {
  home: lazy(() => import('@/pages/Home/HomePage')),
  items: lazy(() => import('@/pages/Items/ItemsPage')),
};
