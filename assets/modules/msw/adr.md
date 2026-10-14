# 0011. 開發期可用 MSW mock;端點真後端上線就從開發期 mock 移除

## 背景

新專案收件時,後端常常還沒好:前端手上只有 prototype 與 API 契約。等後端才開工會讓前端
閒置;在元件裡寫死假資料,又會讓假資料滲進正式程式碼。

反過來,mock 一旦在後端上線後還留著,就開始說謊:畫面上按得動的東西有兩種來源——後端
真的有的,以及 mock 編出來的——而使用者、甚至開發者都分不出是哪一種。

## 決策

**1. 開發期可以用 MSW 假後端,但只能透過明確的模式啟動。** `npm run dev:mock` 以
`--mode mock` 載入 `.env.mock`(`VITE_ENABLE_MOCKS=true`);`main.tsx` 在 mount 前檢查
`import.meta.env.DEV` 與這個變數,兩者都成立才動態 import `@/mocks/browser` 並啟動 worker。
一般的 `npm run dev` 打真後端(經 `vite.config.ts` 的 `/api` proxy)。

**2. 正式建置不含 mock。** `import.meta.env.DEV` 在 build 時被替換成 `false`,整段連同
動態 import 一起被移除;`vite.config.ts` 只在 `command === 'serve'` 時載入 MSW 的 vite
plugin,worker 腳本也不會進 `dist/`。注意「不進產物」不等於「不被型別檢查」:`mocks/` 會因
`main.tsx` 的動態 import 一起被 `tsconfig.app.json` 檢查,所以 mock 程式碼也要通過 strict。

**正式程式碼不得依賴 mock,由 lint 擋下。** `eslint.config.js` 的 `NO_MOCKS` 規則禁止
`src/` 各層 import `@/mocks/*`;只有 `src/main.tsx`(開發期開關)、`mocks/` 自己與測試檔
例外([ADR-0013](0013-lint-enforces-layer-boundaries.md))。這條規則讓「只要 DEV 為 false
就整段移除」的保證不會被某個元件順手 import 假資料打破。

**3. handler 與 API 契約逐字一致。** 路徑、方法、狀態碼、body 形狀都照契約;
型別引用 `types/api/` 的 DTO([ADR-0003](0003-dto-matches-backend-contract.md))。假資料
放 `mocks/db.ts`,不寫在元件或 hook 裡。

**4. handler 依後端進度分兩組(`mocks/handlers.ts`):**

| 清單              | 內容                   | 開發期 mock(`mocks/browser.ts`) | 測試(`mocks/server.ts`) |
| ----------------- | ---------------------- | ------------------------------- | ----------------------- |
| `pendingHandlers` | 後端**尚未上線**的端點 | 註冊                            | 註冊                    |
| `shippedHandlers` | 後端**已上線**的端點   | 不註冊,打真後端                 | 註冊                    |

`browser.ts` 只 `setupWorker(...pendingHandlers)`,沒被攔截的請求照常經 proxy 打真後端;
`server.ts` 用 `handlers = [...pendingHandlers, ...shippedHandlers]`。

**5. 某個端點的真後端上線,就把它的 handler 從 `pendingHandlers` 搬到 `shippedHandlers`。**
不留在開發期 mock 裡「以防萬一」:開發期攔截一個已上線的端點,就是用假資料蓋掉真後端的回應,
畫面上按得動的東西又分不出是真是假。搬過去之後,開發期改打真後端,測試仍有穩定的假資料。
PR 範本的自我檢查有這一項。

**6. 測試一律用 MSW(選了這個模組時)。** 沒選 msw 的專案改以 `vi.mock('@/api/*Api')` 換掉 API 模組(ADR-0022)。 `mocks/server.ts` 在 `test/setup.ts` 啟動,註冊兩組 handler;
每個測試結束後 `resetDb()` 還原假資料。測試不打真後端,所以端點上線與否不影響測試。

✅

```ts
// src/mocks/handlers.ts
http.get(api('/items'), async () => {
  await delay();
  return HttpResponse.json(db.items);
}),
```

```ts
// src/mocks/handlers.ts:/items 上線後,只把它從 pendingHandlers 搬走
export const shippedHandlers: typeof pendingHandlers = [
  http.get(api('/items'), async () => HttpResponse.json(db.items)),
];
```

```ts
// src/main.tsx
if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
  return;
}
const { worker } = await import('@/mocks/browser');
```

❌

```ts
// 在 api 層寫死假資料
export const listItems = async () => [{ id: '1', name: '假的' }];
```

```ts
// 開發期 worker 註冊全部 handler:已上線的端點仍被假資料攔截
export const worker = setupWorker(...handlers);
```

```ts
// 正式環境也啟動 worker
if (import.meta.env.VITE_ENABLE_MOCKS === 'true') { … }
```

規則細節見 [`msw.md`](../conventions/msw.md)、[`testing.md`](../conventions/testing.md)。

## 後果

- 前端可以在後端完成前依契約開發,畫面行為與真後端一致到契約為止。
- 契約有誤時,mock 會一起錯;真後端上線那天才會發現落差。所以契約變更要同步改 handler。
- `pendingHandlers` 會隨後端進度縮小;全部上線後,開發期 mock 不再攔截任何請求,
  `mocks/` 只剩服務測試的 `shippedHandlers` 與 `db.ts`。
- 搬過去的 handler 仍要跟著契約維護:後端改了形狀而 handler 沒改,測試會對著過時的假資料通過。
- 開發者要記得自己在哪個模式;`dev:mock` 與 `dev` 的差異只在啟動指令。

### 何時重新討論

- 後端提供穩定的 staging 環境與測試資料後,可考慮停用 `dev:mock`,只保留測試用的 MSW。
- 開發期需要模擬已上線端點的錯誤情境時,以臨時的 `worker.use(...)` 處理,不把 handler 搬回
  `pendingHandlers`。
- 需要在正式環境做展示(demo)時,不要放寬第 2 條;另建 demo 部署並寫 ADR。
