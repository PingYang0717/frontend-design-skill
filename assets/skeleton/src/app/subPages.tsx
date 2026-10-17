/** 不在選單上的頁面(詳細頁、編輯頁)的 lazy 宣告。路由表 routes.tsx 從這裡取,
 *  不在 routes.tsx 頂層宣告 lazy 元件(會觸發 only-export-components 警告)。
 *  範例:`export const ItemDetailPage = lazy(() => import('@/pages/Items/ItemDetailPage'));` */
export {};
