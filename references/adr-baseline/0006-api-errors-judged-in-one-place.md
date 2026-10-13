# 0006. API 錯誤集中在 `apiError.ts` 判讀;回應不做通用 runtime 驗證

## 背景

「這是什麼錯」是同一個事實,但它有好幾種長相:axios 的錯誤、`fetch` 的錯誤、後端的
`{ code, message }` body;「請求被取消」在 axios 叫 `CanceledError`,在 `fetch` 叫
`AbortError`。每個呼叫端各自挖 `error.response.data`、各自比對名稱,就會各記各的,而且
各自漏掉不同的情況。

回應本身的形狀則有另一個取捨:每個端點包一層宣告式 schema 驗證能擋下後端送錯型別,但
endpoint 函式會變成「先拿 `unknown` 再丟進驗證器」的形狀,回傳型別藏在驗證器後面。

## 決策

### 錯誤判讀只有一處:`src/api/apiError.ts`

它提供 `isOffline` / `isCanceled` / `httpStatus` / `isNotFound` / `isForbidden` /
`errorCode` / `errorMessage`。呼叫端不自己挖 `response.data`、不自己比對錯誤名稱。

- **`apiClient` 不吞錯。** response interceptor 只拆 `res.data`,錯誤原樣往外拋,判讀交給
  `apiError.ts`。
- **取消以 `name` 判斷,不用 `instanceof`。** `fetch` 的 abort 是 `DOMException`,跨 realm
  (測試的 jsdom、嵌入的其他 frame)時 `instanceof` 不可靠,`name` 在哪裡都誠實。
- **只有 404 代表「它不在了」。** 500、逾時、斷線都不說明存在與否;把它們說成「已刪除」,
  使用者會照著行動,不再去找一個其實還在的東西。
- **`errorCode` 決定文案,`errorMessage` 只當技術細節**
  ([ADR-0007](0007-error-copy-owned-by-frontend.md))。

### 回應直接用型別,不做通用 runtime 驗證

endpoint 函式直接寫泛型,回傳型別一眼可見;`types/api/` 的 interface 是編譯期的宣稱
([ADR-0003](0003-dto-matches-backend-contract.md))。

### 例外:逐欄位的最小防線

失效方向特別壞的地方才加保底,而且是逐欄位的,不是通用驗證層。骨架提供一個:
**清單端點用 `expectArray`**,回應不是陣列就丟錯,讓 `DataBoundary` 顯示錯誤卡,而不是在
render 時炸在 `.map`,更不是回一個空陣列——「讀不到」與「沒有資料」是兩件事,使用者會照
後者行動。

✅

```ts
// src/api/itemApi.ts
export const listItems = async (): Promise<Item[]> =>
  expectArray<Item>(await apiClient.get<unknown>(apiPath('items')), 'GET /items');

export const createItem = (body: CreateItemRequest): Promise<Item> => apiClient.post<Item>(apiPath('items'), body);
```

```ts
// src/utils/describeError.ts
if (isNotFound(error)) {
  return { heading: t.errors.loadFailed(what), detail: t.errors.notFound(what) };
}
```

❌

```ts
// 呼叫端自己挖 body、自己比對狀態
const message = (error as AxiosError).response?.data?.message ?? '已刪除';
if (error instanceof DOMException) { … }
```

```ts
// 讀不到就當沒資料
return Array.isArray(data) ? data : [];
```

路徑一律用 `apiPath` 組(逐段 `encodeURIComponent`),id 裡的 `/`、`?` 不會改變路徑結構。
規則細節見 [`api.md`](../conventions/api.md)、[`error-handling.md`](../conventions/error-handling.md)。

## 後果

- 新的傳輸方式(例如 `fetch` 串流)加進來時,只要讓 `apiError.ts` 認得它,所有消費者
  (`describeLoadError`、`describeActionError`)自動跟上。
- 不做 runtime 驗證,等於接受後端送錯形狀時的真實崩潰路徑(漏送欄位讓文案印出
  `undefined`、型別錯讓排序炸進 ErrorBoundary)。我們選擇呼叫端的直觀,接受這個風險。
- `apiError.test.ts` 釘住判讀規則;改判讀時先改測試。

### 何時重新討論

- 後端契約不穩定、形狀錯誤頻繁到影響使用者時,引入回應驗證——但先確認新做法不改變
  endpoint 函式的呼叫形狀。
- 後端改用不同的錯誤 body 格式(例如 RFC 9457 `application/problem+json`)時,只改
  `apiError.ts` 與 `types/api/error.ts`。
