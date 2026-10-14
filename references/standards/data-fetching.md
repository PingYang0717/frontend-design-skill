# 資料讀取與寫入

> 決策理由見 [ADR-0004](../adr/0004-server-state-vs-ui-state.md)、
> [ADR-0005](../adr/0005-suspense-query-and-data-boundary.md)、
> [ADR-0015](../adr/0015-optimistic-updates-and-races.md)。
> 範本:`src/hooks/useItems.ts`(骨架的範例功能)、`src/hooks/useItemMutations.ts`(骨架的範例功能)。

## 1. 資料流

```
元件 / 頁面 → hooks/useXxx(queryOptions + useSuspenseQuery / useActionMutation) → api/xxxApi → apiClient
```

元件不 import `@/api` 的 endpoint module,只用 hook(**強制**:ESLint `no-restricted-imports`;
例外:`@/api/apiError` 的判斷函式)。

## 2. 每種資料一個 `queryOptions`

**規則**:每種資料定義一組 `xxxQueryKey` + `xxxQuery = queryOptions({...})`,放在讀它的 hook 檔裡並具名匯出。
所有讀這份資料的 hook、invalidate、prefetch 都引用同一個定義。

**原因**:key 與 queryFn 只寫一次;mutation 失效時引用同一個 key,不會打錯字而失效不到。

```ts
// ✅ src/hooks/useItems.ts
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { listItems } from '@/api/itemApi';

export const itemsQueryKey = ['items'] as const;

export const itemsQuery = queryOptions({
  queryKey: itemsQueryKey,
  queryFn: listItems,
});

export const useItems = () => useSuspenseQuery(itemsQuery).data;
```

需要調整快取時間時寫在 `queryOptions` 裡並附理由:

```ts
// ✅ src/hooks/useCurrentUser.ts
export const currentUserQuery = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: getCurrentUser,
  // 身分在一次瀏覽中幾乎不變,不必每次回到視窗就重抓。
  staleTime: 5 * 60 * 1000,
});
```

```ts
// ❌ 元件裡直接寫 key 與 queryFn
const { data } = useQuery({ queryKey: ['items'], queryFn: () => apiClient.get('/items') });
```

帶參數的資料寫成函式:

```ts
export const itemQueryKey = (id: string) => ['items', id] as const;
export const itemQuery = (id: string) => queryOptions({ queryKey: itemQueryKey(id), queryFn: () => getItem(id) });
export const useItem = (id: string) => useSuspenseQuery(itemQuery(id)).data;
```

全域預設(`retry`、`refetchOnWindowFocus`)只在 [`app/queryClient.ts`](../../src/app/queryClient.ts) 設定。

## 3. queryKey 命名

**規則**

- 第一段是資源名(複數,與 endpoint 一致):`['items']`。
- 單筆:`['items', id]`;帶篩選條件的清單:`['items', { status, page }]`(物件放最後)。
- 階層由廣到窄,讓 `invalidateQueries({ queryKey: ['items'] })` 能以前綴一次失效整個資源。
- 一律 `as const`;key 只在 `xxxQueryKey` 定義一次。
- 目前使用者等非資源資料用單一名詞:`['currentUser']`。

- ✅ `['items']`、`['items', 'item-1']`、`['items', { status: 'ACTIVE' }]`
- ❌ `['getItems']`、`['item-list']`、``[`items-${id}`]``(字串拼接無法前綴失效)

## 4. 讀取:`useSuspenseQuery` + `DataBoundary`

**規則**:主要資料讀取一律 `useSuspenseQuery`,hook 直接回傳 `.data`。元件不處理 loading / error;
由外層 `DataBoundary` 接。**每個會抓資料的窗格各包一個 `DataBoundary`**,不在 app 頂層只包一層。

**原因**:元件拿到的資料一定存在,不用寫 `if (isLoading)`;一個窗格失敗不會連帶清空旁邊的窗格;
`DataBoundary` 內建 `QueryErrorResetBoundary`,錯誤卡的「重試」會真的重新抓取。

```tsx
// ✅ src/pages/Items/ItemsPage.tsx
<DataBoundary what="項目">
  <ItemTable keyword={debouncedKeyword} />
</DataBoundary>
```

```tsx
// ✅ src/components/items/ItemTable.tsx:資料一定在,直接用
const items = useItems();
```

```tsx
// ❌
const { data, isLoading, error } = useQuery(itemsQuery);
if (isLoading) return <Spin />;
if (error) return <Alert message="載入失敗" />;
```

骨架已有的邊界:`RootLayout`(目前使用者)、`AppShell` 內容區(頁面)、`ItemsPage` 的表格。
新增一個抓資料的窗格,要自己補一個 `DataBoundary`。

## 5. 例外:用 `useQuery`

**規則**:只有在 suspend 會造成不可接受的副作用時才用 `useQuery`,並在該 hook 的註解寫明理由。常見情況:

- 只做裝飾的資料(徽章數字),失敗不該把整個區塊換成錯誤卡。
- 資料在使用者操作後才需要,而該區塊早已在畫面上(suspend 會把它閃成 fallback)。
- 要在對話框開啟時才抓(`enabled: open`)。

```ts
// ✅ 例外要寫理由
/** 側欄徽章的未讀數。用 useQuery 而非 useSuspenseQuery:徽章只是裝飾,
 *  掛在側欄的 boundary 底下,讀不到時不該讓整個側欄變成錯誤卡;失敗時徽章不顯示。 */
export const useUnreadCount = () => useQuery(unreadCountQuery).data;
```

- ❌ 沒有註解就用 `useQuery` + `isLoading`。

## 6. 寫入:`useActionMutation` + invalidate

**規則**

- 所有寫入一律用 [`useActionMutation`](../../src/hooks/useActionMutation.ts),不直接用 `useMutation`。
- 失敗預設以 toast 回報(文案依錯誤 code 決定,見 [error-handling.md](./error-handling.md))。
  覆寫 `onError`(例如錯誤要顯示在表單欄位)時,在呼叫端註解寫理由。
- 成功後 `invalidateQueries` 對應的 queryKey,引用 `xxxQueryKey`;`await` 它,讓 mutation 在清單更新後才結束。
- 成功提示用 `App.useApp()` 的 `message`(選了 i18n 時文案進字典)。

```ts
// ✅ src/hooks/useItemMutations.ts
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useActionMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
      message.success('已新增項目');
    },
  });
};
```

```ts
// ❌ 直接 useMutation、手動 refetch、key 寫死、文案寫死
const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    refetch();
    message.success('新增成功');
  },
});
```

### 失效範圍

| 情況           | 寫法                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| 只影響清單     | `invalidateQueries({ queryKey: itemsQueryKey, exact: true })`                              |
| 影響清單與單筆 | `invalidateQueries({ queryKey: itemsQueryKey })`(前綴,含 `['items', id]`)                  |
| 刪除單筆       | 清單 invalidate + `removeQueries({ queryKey: itemQueryKey(id) })`,避免已刪除的詳細頁再被讀 |

`exact: true` 讓失效範圍明確;需要連子 key 一起失效時才拿掉。

### 在元件使用

```tsx
// ✅ src/components/items/ItemCreateDialog.tsx
const createItem = useCreateItem();
const submit = async () => {
  const values = await form.validateFields();
  await createItem.mutateAsync(values);
  form.resetFields();
  onClose();
};
// confirmLoading={createItem.isPending}
```

`mutateAsync` 失敗會丟錯(toast 已由 `useActionMutation` 顯示),後續的 `onClose()` 不會執行,對話框保持開啟。

樂觀更新與競態處理見 [ADR-0015](../adr/0015-optimistic-updates-and-races.md);預設不做樂觀更新。
