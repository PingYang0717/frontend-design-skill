# Mock(MSW)

> 決策理由見 [ADR-0011](../adr/0011-dev-mocks-removed-when-endpoint-ships.md)。
> handler 都在 [`mocks/handlers.ts`](../../src/mocks/handlers.ts),依「後端上線了沒」分兩組。

## 1. 檔案

| 檔案                | 用途                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `mocks/handlers.ts` | `pendingHandlers`(後端未上線)、`shippedHandlers`(已上線,只給測試)、`handlers`(兩者合併,測試用) |
| `mocks/db.ts`       | 假後端的記憶體資料;`resetDb()` 還原種子資料                                                    |
| `mocks/browser.ts`  | `setupWorker(...pendingHandlers)`,開發期只攔截未上線的端點                                     |
| `mocks/server.ts`   | `setupServer(...handlers)`,測試攔截全部端點(`test/setup.ts` 啟動)                              |

`mocks/` 只能被 `main.tsx` 的開發期分支、`test/` 與測試檔 import。
**強制**:ESLint `no-restricted-imports` 的 `NO_MOCKS`(各層一律禁止 `@/mocks/*`,測試檔除外)。

## 2. 開發期開關

**規則**:要用假後端時執行 `npm run dev:mock`,不要改程式碼或手動設環境變數。

| 指令               | 後端                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`      | 真後端(`VITE_PROXY_TARGET`,預設 `http://localhost:8080`,經 Vite proxy 轉 `/api`)                            |
| `npm run dev:mock` | 未上線的端點走 MSW 假後端,其餘照常打真後端(`vite --mode mock` 讀 `.env.mock`,其中 `VITE_ENABLE_MOCKS=true`) |
| `npm run build`    | 永遠不含 mock                                                                                               |

運作方式:

- `main.tsx` 的 `enableMocking()` 只在 `import.meta.env.DEV && VITE_ENABLE_MOCKS === 'true'` 時
  動態 import `@/mocks/browser` 並 `worker.start({ onUnhandledFrame: 'bypass' })`;worker 只註冊 `pendingHandlers`,
  其餘請求(含已上線端點)放行到真後端。
- `import.meta.env.DEV` 在正式建置被替換成 `false`,整段連同 `mocks/` 被移除。`mocks/` 仍會被 `tsc` 型別檢查
  (因為那個動態 import),但正式產物不含它。
- MSW 的 worker 腳本由 `vite.config.ts` 的 `msw({ mode: 'worker-only' })` 只在開發伺服器提供,
  `public/` 底下沒有 `mockServiceWorker.js`。

**原因**:mock 開關是建置模式,不是程式碼;正式產物不可能誤帶假後端。

- ✅ `npm run dev:mock`
- ❌ 在 `main.tsx` 把條件改成 `if (true)` 後 commit
- ❌ 在 `.env.local` 寫 `VITE_ENABLE_MOCKS=true` 後忘記,以為自己連的是真後端

**驗證**:`npm run build` 後 `dist/assets` 不應出現 `setupWorker` 或 `msw` 字樣。

## 3. Handler 寫法

**規則**

- 路徑用 `api('/xxx')` 組(`*/api` 前綴,與 `apiClient` 的 baseURL 一致)。
- 回應形狀、狀態碼、錯誤 body 與 `docs/api/` 的契約**逐字一致**;型別引用 `types/api/`,讓契約改了 typecheck 會提醒。
- 資料讀寫 `db`,不在 handler 裡寫死回應,讓「新增後清單出現新資料」這類流程可以測。
- 清單端點加 `await delay()`,開發期才看得到 loading 狀態。
- 一個端點一個 handler,依資源分段排列。

```ts
// ✅ src/mocks/handlers.ts
const api = (path: string) => `*/api${path}`;

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

export const shippedHandlers: typeof pendingHandlers = [];

export const handlers = [...pendingHandlers, ...shippedHandlers];
```

新端點的 handler 一律先加進 `pendingHandlers`。

```ts
// ❌ 形狀與契約不同、寫死、沒有型別
http.get('/api/items', () => HttpResponse.json({ data: [{ itemId: 1, title: 'A' }] })),
```

錯誤回應用契約定義的 `ApiErrorBody`:

```ts
http.post(api('/items'), () => HttpResponse.json({ code: 'CONFLICT', message: 'duplicate name' }, { status: 409 })),
```

## 4. 種子資料

**規則**:種子資料寫在 `db.ts` 的 `seedXxx()` 函式,每次呼叫回傳新陣列;`resetDb()` 用它們還原。
新增資源時三處一起改:`seedXxx`、`db`、`resetDb`。

```ts
// ✅ src/mocks/db.ts
const seedItems = (): Item[] => [
  { id: 'item-1', name: '範例項目 A', status: 'ACTIVE', updatedAt: '2026-01-05T09:00:00.000Z' },
];

export const db = { items: seedItems(), currentUser: seedUser() };

export const resetDb = () => {
  db.items = seedItems();
  db.currentUser = seedUser();
};
```

- ❌ `export const ITEMS = [...]` 讓 handler 直接 `push`:測試之間互相污染。

## 5. 端點上線:handler 搬到 `shippedHandlers`

**規則**:某個端點的**真後端上線後,在同一個 PR 把它的 handler 從 `pendingHandlers` 搬到 `shippedHandlers`**,不是刪掉。

- 開發期(`dev:mock`)從此不再攔截它,一律打真後端。
- 測試仍由 `handlers`(兩組合併)提供穩定的假資料,不必在各測試檔用 `server.use()` 補。
- `pendingHandlers` 因此永遠只列「還沒有真後端」的端點,看一眼就知道哪些功能仍在等後端。
- 搬過去的 handler 仍要與契約逐字一致;後端改契約時,handler 與 `types/api/` 一起改。

流程:

1. 後端通知端點已上線(`docs/api/` 的契約同步更新)。
2. `npm run dev`(不帶 mock)手動驗證該功能對真後端可用。
3. 把 handler 從 `pendingHandlers` 搬到 `shippedHandlers`。
4. 跑 `npm test` 確認測試仍通過。
5. PR 範本的自我檢查勾選對應項目。

**原因**:開發期的 mock 留著就會與真後端分歧;開發者在 `dev:mock` 下看到的行為不再等於正式環境,而且沒人察覺。
測試則需要可重現、不依賴後端的資料,所以 handler 保留給測試。

```ts
// ✅ GET /me 已上線
export const pendingHandlers = [
  http.get(api('/items'), async () => { ... }),
];

export const shippedHandlers: typeof pendingHandlers = [
  http.get(api('/me'), () => HttpResponse.json(db.currentUser)),
];
```

- ❌ 後端已上線半年,`/items` 還留在 `pendingHandlers`,`dev:mock` 回的是舊契約。
- ❌ 端點上線就刪掉 handler,再在每個測試檔各自 `server.use()` 補一份(形狀各寫各的)。

## 6. 測試中覆寫 handler

**規則**:測試一律透過 MSW 打假後端,不 mock `apiClient`、hook 或 axios。
預設由 `handlers` 回應;**單一測試**需要不同回應(錯誤、空清單)時,才用 `server.use()` 覆寫;`test/setup.ts` 的 `afterEach` 會 `server.resetHandlers()`
並 `resetDb()`,覆寫不會漏到下一個測試。

```ts
// ✅ src/pages/Items/ItemsPage.test.tsx
it('shows an error card with retry when the list fails to load', async () => {
  server.use(http.get('*/api/items', () => HttpResponse.json({ code: 'BOOM' }, { status: 500 })));
  renderApp('/items');

  expect(await screen.findByText(t.errors.loadFailed(t.items.entity))).toBeInTheDocument();

  server.resetHandlers();
  screen.getByRole('button', { name: t.common.retry }).click();
  await waitFor(() => expect(screen.getByText('範例項目 A')).toBeInTheDocument());
});
```

改變資料狀態(而非回應形狀)時,直接改 `db`:

```ts
// ✅
db.currentUser = { ...db.currentUser, permissions: ['items:read'] };
```

```ts
// ❌ mock 掉 hook:測不到 apiClient、interceptor、錯誤判讀
vi.mock('@/hooks/useItems', () => ({ useItems: () => [] }));
```

**強制**:`test/setup.ts` 以 `server.listen({ onUnhandledFrame: 'error' })` 啟動——測試打到沒有 handler 的請求會直接失敗。

更多測試規範見 [testing.md](./testing.md)。
