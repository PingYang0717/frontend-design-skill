# 錯誤處理

讀取失敗與寫入失敗走兩條不同的路,文案都由前端依後端的 `code` 決定;整個系統此刻不能用的情況(閘門)另外走整頁遮罩。
決策背景見 [ADR-0006](../adr/0006-api-errors-judged-in-one-place.md)、
[ADR-0007](../adr/0007-error-copy-owned-by-frontend.md)、[ADR-0017](../adr/0017-access-gate.md)。

## 0. 一句話:狀態碼決定全域動作,code 決定文案

後端的錯誤有兩種表達方式,公版把它們分工:

| 看什麼             | 決定什麼                                                      | 在哪裡判                              |
| ------------------ | ------------------------------------------------------------- | ------------------------------------- |
| **HTTP 狀態碼**    | 要不要做**全域動作**:401 交給公司 SDK 跳轉;閘門狀態碼整頁遮罩 | `app/accessGate.ts`(唯一一處)         |
| **body 的 `code`** | 顯示**哪一句話**:錯誤卡的 detail、toast 的那一行              | `utils/describeError.ts`(查 `byCode`) |
| 404 / 403 / 斷線   | 錯誤卡的固定句子(「找不到」「沒有權限」「無法連線」)          | `describeError.ts`,透過 `apiError.ts` |

畫面與 hook 兩種都不自己判:全域動作交給閘門,文案交給 `describeError`。狀態碼與 code 重疊時(閘門與一般拒絕都用 403),
閘門規則加上 `code` 區分,收件時跟後端確認([access.md](./access.md) 第 3 節)。

## 總覽

| 情境                              | 誰接                                | 呈現                           | 文案函式                                      |
| --------------------------------- | ----------------------------------- | ------------------------------ | --------------------------------------------- |
| 讀取失敗(`useSuspenseQuery` 丟出) | `DataBoundary` 內的 `ErrorBoundary` | `LoadErrorPanel` 錯誤卡 + 重試 | `describeLoadError`                           |
| 寫入失敗(mutation)                | `useActionMutation` 的 `onError`    | 一行 toast                     | `describeActionError`                         |
| 「這是什麼錯」的判讀              | `src/api/apiError.ts`               | —                              | `isOffline`、`isNotFound`、`errorCode`…       |
| 不在公司網路 / 沒有系統權限(閘門) | `app/accessGate.ts` 的 interceptor  | `AccessMask` 整頁遮罩,不能關   | —(公司的遮罩元件,見 [access.md](./access.md)) |
| 401(未登入 / 逾期)                | 公司登入 SDK                        | 跳轉公司登入畫面               | —(前端不處理)                                 |

## 1. 錯誤判讀只在 `api/apiError.ts`

**規則:** 判斷錯誤種類一律用 `src/api/apiError.ts` 的函式:`isOffline`、`isCanceled`、
`httpStatus`、`isNotFound`、`isForbidden`、`errorCode`、`errorMessage`。呼叫端不自己挖
`error.response.data`、不自己比對 `error.name`。

**原因:** 同一個事實(例如「請求被取消」)在 axios 與 fetch 長得不一樣;各處自己判斷就會各判各的。

- 只有 404 代表「東西不在了」。500、逾時、斷線都不能說成「已刪除」——使用者會照著行動。
- 取消判斷以 `name` 比對(`CanceledError` / `AbortError`),不用 `instanceof`。

❌ 錯誤

```ts
if (error.response?.status === 404 || error.code === 'ERR_NETWORK') { … }
```

元件與頁面可以 import `@/api/apiError`(分層規則唯一允許的 `@/api/*`,見 [tooling.md](./tooling.md))。

## 2. 讀取錯誤:`DataBoundary` → `LoadErrorPanel`

**規則:** 讀取用 `useSuspenseQuery`,元件**不處理** loading 與 error;由外層
`<DataBoundary what={…}>` 接住。每個獨立窗格各包一個。

**原因:** 一個區塊失敗不該把整頁換成錯誤卡;`DataBoundary` 內含 `QueryErrorResetBoundary`,
按「重試」才會真的重新抓取,而不是立刻再丟出快取裡的錯誤。

✅ 正確(`src/pages/Items/ItemsPage.tsx`)

```tsx
<DataBoundary what="項目">
  <ItemTable keyword={debouncedKeyword} />
</DataBoundary>
```

❌ 錯誤

```tsx
const { data, isLoading, error } = useQuery(itemsQuery);
if (isLoading) return <Spin />;
if (error) return <div>載入失敗</div>;
```

- `what` 傳這個區塊的名詞(「項目」;選了 i18n 時用字典的 `t.items.entity`),它會組進「項目載入失敗」「找不到這筆項目」。
- 例外(用 `useQuery` 自己處理狀態)要在 hook 註解寫理由,見 [data-fetching.md](./data-fetching.md)。
- 錯誤卡需要「讀取失敗」以外的位置時,直接用 `LoadErrorPanel`(傳 `error`、`what`、`onRetry`),
  不要自己用 `Result` 重刻。

## 3. 寫入錯誤:`useActionMutation` 的 toast

**規則:** 所有寫入用 `useActionMutation`(`src/hooks/useActionMutation.ts`)。失敗時預設以
`useActionErrorToast` 顯示一行 toast,呼叫端什麼都不用寫。

✅ 正確(`src/hooks/useItemMutations.ts`)

```ts
return useActionMutation({
  mutationFn: createItem,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
    message.success('已新增項目');
  },
});
```

❌ 錯誤

```ts
useMutation({ mutationFn: createItem, onError: () => message.error('新增失敗') });
```

- 覆寫 `onError` 會**取代** toast(例如錯誤要顯示在表單欄位旁)。這是例外,必須在呼叫端註解寫理由。
- 元件用 `mutateAsync` 時,失敗的 promise 會 reject;toast 已經由 `onError` 處理。元件要 catch
  這個 reject(避免 unhandled rejection),在 catch 裡只停止後續流程(例如不關閉對話框、保留使用者
  填的內容),**不要**再顯示第二次錯誤。

✅ 正確(`src/components/items/ItemCreateDialog.tsx`)

```ts
try {
  await createItem.mutateAsync(values);
} catch {
  // 失敗已由 useActionMutation 以 toast 回報;對話框保持開啟,使用者填的內容不會消失。
  return;
}
form.resetFields();
onClose();
```

❌ 錯誤:`catch (e) { message.error(…) }`(重複回報),或完全不 catch(unhandled rejection)。

## 4. 文案:`describeLoadError` / `describeActionError`

**規則:** 錯誤文案由 `src/utils/describeError.ts` 產生,不在元件裡拼。

- `describeLoadError(error, what, t)` → `{ heading, detail, technical? }`:
  斷線 → `errors.offline`;404 → `errors.notFound(what)`;403(非閘門)→ `errors.forbidden(what)`;
  其他 → 已知 code 查 `errors.byCode`,否則 `errors.loadFailedDetail`。
  後端原話只放 `technical`,在錯誤卡的「技術細節」小字展開。
- `describeActionError(error, t)` → 一行字串:斷線 → `errors.offline`;已知 code → `byCode`;403(非閘門)→
  `errors.forbiddenAction`;否則 `actionFailedWithStatus(status)` 或 `actionFailed`。**toast 不放後端原話。**

**原因:** 後端 `message` 是寫給維運的語彙(堆疊、SQL 錯誤、類別名稱),使用者看不懂也無法照著行動;
`code` 是穩定契約,前端據此寫出能照著做的句子。

## 5. 後端錯誤格式

錯誤回應的 body 是 `ApiErrorBody`(`src/types/api/error.ts`):

```ts
export interface ApiErrorBody {
  code: string;
  message?: string;
}
```

`apiClient` 對錯誤**原樣往外拋**(不包裝、不轉成字串),判讀全部交給 `apiError.ts`。

## 6. 新增一個錯誤 code 的步驟

1. 與後端確認 code 字串(SCREAMING_CASE,規格或後端契約要列出)。
2. 加進 `src/types/api/error.ts` 的 `KNOWN_ERROR_CODES`。
3. 在 `src/utils/describeError.ts` 的 `ERROR_COPY_BY_CODE` 加一句——它是 `Record<KnownErrorCode, string>`,
   漏寫直接 typecheck 失敗。
4. 選了 i18n 模組時,第 3 步改為在 `src/i18n/zhTW.ts` 與 `en.ts` 的 `errors.byCode` 各加一句(同樣由型別強制),
   `src/i18n/errorCodeCoverage.test.ts` 會再逐一檢查每個 code 在每種語言都有非空文案。

✅ 正確

```ts
export const KNOWN_ERROR_CODES = ['VALIDATION_FAILED', 'CONFLICT', 'QUOTA_EXCEEDED'] as const;
// utils/describeError.ts 的 ERROR_COPY_BY_CODE(選了 i18n 時是 zhTW.errors.byCode)
QUOTA_EXCEEDED: '已達到上限,請刪除不需要的項目後再試。',
```

❌ 錯誤

```ts
if (errorCode(error) === 'QUOTA_EXCEEDED') message.error('已達上限'); // 散落在元件,沒集中在一處
```

只寫句子、不決定呈現位置:同一個 code 在錯誤卡或 toast 都查同一句,呈現由呼叫端決定。

## 7. 其他規則

- **未預期的 render 例外**同樣由最近的 `DataBoundary` 接住,顯示泛用文案,例外訊息進技術細節。
- `ErrorBoundary` 的 `componentDidCatch` 只記錯誤名稱與訊息,不印整個錯誤物件(AxiosError 帶著
  整個 request,輸出很吵)。
- 刪除這類無法復原的動作先經過 `useConfirmDestructive`;確認後的失敗照樣走 toast。
- 不用 `window.alert`、`console.error` 當作給使用者的錯誤回報。
- 清單端點用 `expectArray` 守住形狀:回應不是陣列就丟錯,讓錯誤卡接手,而不是在 render 時炸在 `.map`。
