import { delay, http, HttpResponse } from 'msw';

import type { CreateItemRequest, Item } from '@/types/api/item';
import { db } from './db';

/** 路徑與 apiClient 的 baseURL 一致。 */
const api = (path: string) => `*/api${path}`;

/** 後端「尚未上線」的端點:開發期 mock(npm run dev:mock)與測試都會用到。
 *  某個端點的真後端上線後,把它的 handler 從這裡搬到 shippedHandlers——開發期就改打真後端,
 *  測試仍有穩定的假資料可用(ADR-0011)。形狀一律與 API 契約逐字一致。
 *  登入與存取閘門不在這裡 mock:登入由公司 SDK 處理、閘門的狀態碼在測試裡以 server.use 臨時給。 */
export const pendingHandlers = [
  http.get(api('/items'), async () => {
    await delay();
    return HttpResponse.json(db.items);
  }),

  http.post(api('/items'), async ({ request }) => {
    const body = (await request.json()) as CreateItemRequest;
    const item: Item = {
      id: `item-${Date.now()}`,
      name: body.name,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
    db.items = [item, ...db.items];
    return HttpResponse.json(item, { status: 201 });
  }),

  http.delete(api('/items/:id'), ({ params }) => {
    db.items = db.items.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

/** 後端「已上線」的端點:只給測試用,開發期 mock 不攔截,一律打真後端。 */
export const shippedHandlers: typeof pendingHandlers = [];

/** 測試用的完整清單。 */
export const handlers = [...pendingHandlers, ...shippedHandlers];
