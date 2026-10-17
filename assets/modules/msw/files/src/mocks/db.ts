import type { Item } from '@/types/api/item';

/** 假後端的記憶體資料。只服務開發期 mock 與測試;每個測試開始前由 resetDb() 還原。
 *  原則:mock 的形狀必須與 API 契約逐字一致;端點上線後的處理見 handlers.ts(ADR-0011)。 */

const seedItems = (): Item[] => [
  { id: 'item-1', name: '範例項目 A', status: 'ACTIVE', updatedAt: '2026-01-05T09:00:00.000Z' },
  { id: 'item-2', name: '範例項目 B', status: 'ARCHIVED', updatedAt: '2026-01-04T09:00:00.000Z' },
];

export const db = {
  items: seedItems(),
};

export const resetDb = () => {
  db.items = seedItems();
};
