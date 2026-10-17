import type { Item } from '@/types/api/item';

/** 測試用的假資料。API 模組在測試裡由 vi.mock 換掉(見 setup.ts),回應從這裡給;形狀與 API 契約逐字一致。 */

export const testItems = (): Item[] => [
  { id: 'item-1', name: '範例項目 A', status: 'ACTIVE', updatedAt: '2026-01-05T09:00:00.000Z' },
  { id: 'item-2', name: '範例項目 B', status: 'ARCHIVED', updatedAt: '2026-01-04T09:00:00.000Z' },
];
