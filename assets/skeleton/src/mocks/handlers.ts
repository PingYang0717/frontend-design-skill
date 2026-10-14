import { delay, http, HttpResponse } from 'msw';

import type { LoginRequest, LoginResponse } from '@/types/api/auth';
import type { CreateItemRequest, Item } from '@/types/api/item';
import { db, MOCK_ACCESS_TOKEN, MOCK_LOGIN } from './db';

/** 路徑與 apiClient 的 baseURL 一致。 */
const api = (path: string) => `*/api${path}`;

/** 假後端只對身分端點檢查 token;真後端每一支 API 都會檢查。 */
const isAuthorized = (request: Request) => request.headers.get('Authorization') === `Bearer ${MOCK_ACCESS_TOKEN}`;

/** 後端「尚未上線」的端點:開發期 mock(npm run dev:mock)與測試都會用到。
 *  某個端點的真後端上線後,把它的 handler 從這裡搬到 shippedHandlers——開發期就改打真後端,
 *  測試仍有穩定的假資料可用(ADR-0011)。形狀一律與 API 契約逐字一致。 */
export const pendingHandlers = [
  http.post(api('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    if (body.username !== MOCK_LOGIN.username || body.password !== MOCK_LOGIN.password) {
      return HttpResponse.json({ code: 'INVALID_CREDENTIALS' }, { status: 401 });
    }
    return HttpResponse.json({ accessToken: MOCK_ACCESS_TOKEN } satisfies LoginResponse);
  }),

  http.post(api('/auth/logout'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('/me'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(db.currentUser)
      : HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  ),

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
