import type { Item } from '@/types/api/item';
import type { CurrentUser } from '@/types/api/user';

/** 假後端的記憶體資料。只服務開發期 mock 與測試;每個測試開始前由 resetDb() 還原。
 *  原則:mock 的形狀必須與 docs/api/ 的契約逐字一致;端點上線後的處理見 handlers.ts(ADR-0011)。 */

const seedItems = (): Item[] => [
  { id: 'item-1', name: '範例項目 A', status: 'ACTIVE', updatedAt: '2026-01-05T09:00:00.000Z' },
  { id: 'item-2', name: '範例項目 B', status: 'ARCHIVED', updatedAt: '2026-01-04T09:00:00.000Z' },
];

const seedUser = (): CurrentUser => ({
  id: 'user-1',
  name: '測試使用者',
  permissions: ['items:read', 'items:write'],
});

export const db = {
  items: seedItems(),
  currentUser: seedUser(),
};

export const resetDb = () => {
  db.items = seedItems();
  db.currentUser = seedUser();
};
