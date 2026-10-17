# API 層

> 決策理由見 [ADR-0003](../adr/0003-dto-matches-backend-contract.md)(DTO 與後端一致)、
> [ADR-0006](../adr/0006-api-errors-judged-in-one-place.md)(錯誤集中判讀)。
> 契約以規格(`docs/spec/`)的 API 一節或後端文件為準;錯誤文案規則見 [error-handling.md](./error-handling.md)。

## 1. 所有 HTTP 走 `apiClient`

**規則**:HTTP 請求一律經過 [`api/apiClient.ts`](../../src/api/apiClient.ts) 匯出的 `apiClient`。
不在其他地方 `axios.create()`、`import axios`、或直接 `fetch` 後端。

`apiClient` 做三件事:

1. `baseURL` 取自 `VITE_API_BASE_URL`(預設 `/api`)。
2. `withCredentials: true`:身分在公司登入 SDK 放的 cookie 裡,瀏覽器自動帶;前端不組 header([access.md](./access.md))。
3. response interceptor **拆掉 `res.data`**,呼叫端直接拿到 DTO;錯誤**原樣拋出**,不在這裡轉換或吞掉
   (閘門的判讀在 `app/accessGate.ts` 另外註冊的 interceptor)。

```ts
// ✅
apiClient.get<Item[]>('/items'); // Promise<Item[]>
```

```ts
// ❌
const res = await axios.get('/api/items');
return res.data;
```

**強制**:ESLint `no-restricted-imports`——`components/`、`pages/`、`hooks/` 禁止 import `axios`。

`httpClient`(原始 axios instance)只在需要操作 axios 本身時使用(註冊額外 interceptor、測試)。
不走 axios 的請求(例如串流 `fetch`)要自己加 `credentials: 'include'`,cookie 才會跟著送。

## 2. 身分與閘門

**規則**:前端不保管 token、不組 `Authorization`、不判 401:登入由公司 SDK 處理。
被公司閘門擋下(不在公司網路、沒有系統權限)的狀態碼只在 `app/accessGate.ts` 判斷,整頁遮罩;
端點函式與 hook 不碰這兩件事。細節見 [access.md](./access.md);細粒度權限(選了 permissions 模組)見 `permissions.md`。

```ts
// ❌ 端點函式裡自己帶 header 或判狀態
apiClient.get('/items', { headers: { Authorization: `Bearer ${token}` } });
if (httpStatus(error) === 423) { ... }
```

## 3. Endpoint module

**規則**:一個資源一個檔案 `api/<資源>Api.ts`,每個端點一個具名 arrow function,明寫回傳型別。

- 路徑一律用 `apiPath()` 組,**逐段 `encodeURIComponent`**。
- 清單端點用 `expectArray()` 包:回應不是陣列時丟 `TypeError`,讓 `DataBoundary` 顯示錯誤卡,
  而不是在 render 時炸在 `.map`。
- 不做其他 runtime 驗證;型別由 `types/api/` 保證(編譯期)。

```ts
// ✅ src/api/itemApi.ts
export const listItems = async (): Promise<Item[]> =>
  expectArray<Item>(await apiClient.get<unknown>(apiPath('items')), 'GET /items');

export const createItem = (body: CreateItemRequest): Promise<Item> => apiClient.post<Item>(apiPath('items'), body);

export const deleteItem = (id: string): Promise<void> => apiClient.delete(apiPath('items', id));
```

```ts
// ❌ 字串拼接:id 含 `/` 或 `?` 會改變路徑
apiClient.delete(`/items/${id}`);
// ❌ 清單沒防線:後端回 { data: [...] } 時元件 render 才爆
export const listItems = () => apiClient.get<Item[]>('/items');
```

`apiPath('items', 'a/b')` → `/items/a%2Fb`。

## 4. DTO 型別與後端逐字一致

**規則**

- `types/api/<資源>.ts` 的欄位名、大小寫、列舉值與後端**逐字一致**,不在前端改名、不設轉換層。
- 只收前端有用到的欄位;沒有消費端的欄位不收(契約照實記錄即可)。
- request 型別另外宣告:`CreateItemRequest`、`UpdateItemRequest`。
- 列舉用字串 union,不用 `enum`。
- 前端需要的衍生形狀(顯示用標籤、排序)在使用點算,不寫回 DTO。

**原因**:兩邊看到同一個名字,對契約時不用在腦中翻譯;轉換層是另一個會壞、會漏改的地方。

```ts
// ✅ src/types/api/item.ts
export interface Item {
  id: string;
  name: string;
  status: ItemStatus;
  updatedAt: string;
}

export type ItemStatus = 'ACTIVE' | 'ARCHIVED';
```

```ts
// ❌ 改名、轉型
export interface Item {
  itemId: string; // 後端是 id
  isActive: boolean; // 後端是 status
  updatedAt: Date; // 線路上是字串
}
```

## 5. 錯誤判讀只在 `apiError.ts`

**規則**:「這是什麼錯」只在 [`api/apiError.ts`](../../src/api/apiError.ts) 判斷。呼叫端不自己挖
`error.response.data`、不比對 `error.name`、不判斷 `status === 404`。

| 函式                  | 意義                                                        |
| --------------------- | ----------------------------------------------------------- |
| `isOffline(error)`    | 連不到後端(沒有 HTTP 回應,且不是取消)                       |
| `isCanceled(error)`   | 請求被取消(以 `name` 判斷,跨 realm 也可靠)                  |
| `httpStatus(error)`   | HTTP 狀態碼,非 HTTP 錯誤為 `undefined`                      |
| `isNotFound(error)`   | **只有 404** 代表「不在了」;500、逾時、斷線都不能說成已刪除 |
| `isForbidden(error)`  | 403                                                         |
| `errorCode(error)`    | 後端 body 的 `code`,決定介面文案                            |
| `errorMessage(error)` | 後端原話,只當技術細節                                       |

```ts
// ✅
import { isNotFound } from '@/api/apiError';
if (isNotFound(error)) { ... }
```

```ts
// ❌
if (axios.isAxiosError(error) && error.response?.status === 404) { ... }
const text = error.response?.data?.message; // 後端原話當主文案
```

元件可以 import `@/api/apiError`(分層規則的唯一例外)。錯誤 body 形狀定義在
[`types/api/error.ts`](../../src/types/api/error.ts) 的 `ApiErrorBody`;轉成文案由
`utils/describeError.ts` 負責。

## 6. 新增一個端點

1. 在規格或後端契約確認端點;沒有契約時依規格提草案,在 DTO 註解標「草案」並列入待確認。
2. `types/api/<資源>.ts` 加 DTO / request 型別。
3. `api/<資源>Api.ts` 加函式(`apiPath`、清單用 `expectArray`),並寫第 7 節的 JSDoc。
4. 新的錯誤 code 加進 `KNOWN_ERROR_CODES` 並補文案(見 [error-handling.md](./error-handling.md) 第 6 節)。
5. `hooks/` 加 `queryOptions` / mutation([data-fetching.md](./data-fetching.md))。
6. 假後端:選了 msw 模組 → `mocks/handlers.ts` 的 `pendingHandlers` 補 handler,真後端上線後搬到 `shippedHandlers`
   (`msw.md`);沒選 → `test/fixtures.ts` 補假資料,頁面測試 `vi.mock` 這支 endpoint module([testing.md](./testing.md))。
7. `npm run api-contract` 重產 `docs/api-contract.md`,與程式碼一起 commit(CI 以 `api-contract:check` 比對)。

## 7. 端點的 JSDoc 與後端契約表

**規則**:每個端點函式上方寫 JSDoc:第一行是**功能**(一句話),`@screen` 是**使用它的畫面**(一支多個畫面就寫多個),
`@error` 是**這支特有的錯誤**,格式固定「`狀態碼 情境 → 前端處理`」。`scripts/gen-api-contract.mjs` 讀這些與 `types/api/`
反向產生 `docs/api-contract.md`——每支端點的方法與路徑、功能、使用畫面、Request / Response 欄位表、預期錯誤與前端處理——
給後端(或後端的 agent)照著實作。沒寫 `@error` 的狀態碼,腳本自動補公版共用的幾列(401 交給公司 SDK、閘門狀態碼整頁遮罩——讀 `app/accessGate.ts` 的表、403 錯誤卡 / toast、
5xx 與斷線;來源 [error-handling.md](./error-handling.md)、[ADR-0006](../adr/0006-api-errors-judged-in-one-place.md))。

```ts
// ✅ src/api/itemApi.ts
/** 建立項目,回傳建立後的完整物件。
 *  @screen 項目管理 > 新增對話框
 *  @error 400 VALIDATION_FAILED:名稱空白或超過長度 → toast(errors.byCode) */
export const createItem = (body: CreateItemRequest): Promise<Item> => apiClient.post<Item>(apiPath('items'), body);
```

```ts
// ❌ 沒有 JSDoc:契約表的「功能」會是空的、後端不知道這支給哪個畫面用
export const createItem = (body: CreateItemRequest): Promise<Item> => apiClient.post<Item>(apiPath('items'), body);
```

- 腳本只認公版寫法(`apiClient.<method>(apiPath(...), body?)`);繞過 `apiPath` 或不經 `apiClient` 的 export 會列在
  契約表尾的「未解析的端點」並印 WARN,不算失敗——改回公版寫法後重跑。
- DTO 欄位的 JSDoc(`/** 建立時間,ISO 8601 */`)會進契約表的「說明」欄;單位、格式、可空的條件寫在這裡。
- `docs/api-contract.md` **不手改**;改了端點或 DTO 就重跑。CI 的 `npm run api-contract:check` 擋下沒重跑的 PR。
- 契約表是「前端實際呼叫什麼」,不取代 `docs/spec/` 的需求;兩者不一致時以 SPEC 為準,回去改程式碼再重產。
