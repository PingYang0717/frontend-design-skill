# 0005. 讀取用 `useSuspenseQuery`,每個窗格一個 `DataBoundary`

## 背景

`useQuery` 把 loading 與 error 交給每個呼叫端自己處理:每個元件都要寫
`if (isLoading) … if (isError) …`,而且每個人寫出來的 spinner 與錯誤卡都不一樣;資料的型別
也一直帶著 `undefined`。

`useSuspenseQuery` 把這兩件事交給外層:pending 由 Suspense 邊界顯示、失敗由 ErrorBoundary
接住,元件拿到的 `data` 一定有值。問題變成「邊界要放在哪一層」。最省事的做法是在 app 頂層
包一組,但那代表任何一處失敗,整頁都換成錯誤卡。

## 決策

**1. 主要資料一律 `useSuspenseQuery`。** 每種資料在它的 hook 檔定義一個 `queryOptions`
(key + queryFn),讀它的 hook 都引用它,寫入用同一個 key 失效。

**2. `DataBoundary` 包在每個窗格與每個 page 上,不在 app 頂層包一層。**
`components/common/DataBoundary.tsx` 是 `QueryErrorResetBoundary` + `ErrorBoundary` +
`SuspenseLoader` 的組合,帶一個 `what` 描述這塊在載入什麼,loading 與錯誤文案都用得上。
骨架的落點:`RootLayout`(外殼要讀目前使用者)、`AppShell` 的內容區、`ItemsPage` 的表格。

理由:

- **失敗要被關住。** 表格讀不到,搜尋框與「新增」鈕仍該在;外殼也不該因為某一頁失敗而消失。
- **重試真的重抓。** `QueryErrorResetBoundary` 讓「重試」重設 query 的錯誤狀態,而不是立刻
  再丟出快取裡的同一個錯誤。
- **各區塊各自到達。** 沒有理由讓最慢的那塊決定整頁何時可用。

**3. 寫入的錯誤不經過這裡。** mutation 失敗不是 render 期的例外,ErrorBoundary 接不到;
它走 `useActionMutation` 的 `onError`(預設 toast)。

**4. 例外用 `useQuery`,要在 hook 註解寫理由。** 典型理由:那份資料只是裝飾一個不能被它
拖下去的表面(徽章數字、header 的頭像),或 suspend 會把已上畫面的內容閃成 fallback。

✅

```tsx
// pages/Items/ItemsPage.tsx
<DataBoundary what={t.items.entity}>
  <ItemTable keyword={debouncedKeyword} />
</DataBoundary>
```

```tsx
// components/items/ItemTable.tsx:不處理 loading / error
const items = useItems();
```

❌

```tsx
const { data, isLoading, isError } = useQuery(itemsQuery);
if (isLoading) return <Spin />;
if (isError) return <div>Error</div>;
```

規則細節見 [`data-fetching.md`](../conventions/data-fetching.md)、
[`error-handling.md`](../conventions/error-handling.md)。

## 後果

- 新增一個會抓資料的窗格時,要自己補一個 `DataBoundary`;沒有頂層網子兜底(`AppShell`
  內容區那一層只接住整頁的失敗,不取代窗格自己的邊界)。
- 同一頁可能同時出現多個 loading 狀態,這是刻意的。
- `ErrorBoundary` 是專案裡唯一的 class component:React 沒有 `componentDidCatch` 的 hook
  對等物([ADR-0008](0008-component-declaration-and-export.md))。
- `queryClient.ts` 在測試中關掉自動重試,錯誤立刻呈現;正式環境重試一次,吸收一閃而過的
  網路抖動。
- 用 `useSuspenseQuery` 時,依賴另一個 query 結果的讀取會變成串行(waterfall);需要平行
  時在同一個元件裡用 `useSuspenseQueries`。

### 何時重新討論

- 改用支援 route loader 預抓的資料流(例如在路由層統一 prefetch)時,重新評估邊界的落點。
- 例外清單長到超過常規時,代表某類資料的呈現方式需要新的共用元件,而不是更多例外。
