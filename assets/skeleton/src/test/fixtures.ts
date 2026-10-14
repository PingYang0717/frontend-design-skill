import { PERMISSIONS } from '@/constants/permissions';
import type { Item } from '@/types/api/item';
import type { CurrentUser } from '@/types/api/user';

/** 測試用的假資料。API 模組在測試裡由 vi.mock 換掉(見 setup.ts),回應從這裡給;形狀與 API 契約逐字一致。 */

export const TEST_ACCESS_TOKEN = 'test-access-token';

/** setup.ts 讓 `getCurrentUser` 預設回傳它:擁有全部權限。測權限時在測試裡覆寫。 */
export const TEST_USER: CurrentUser = {
  id: 'user-1',
  name: '測試使用者',
  permissions: [PERMISSIONS.itemsRead, PERMISSIONS.itemsWrite],
};

export const testItems = (): Item[] => [
  { id: 'item-1', name: '範例項目 A', status: 'ACTIVE', updatedAt: '2026-01-05T09:00:00.000Z' },
  { id: 'item-2', name: '範例項目 B', status: 'ARCHIVED', updatedAt: '2026-01-04T09:00:00.000Z' },
];
