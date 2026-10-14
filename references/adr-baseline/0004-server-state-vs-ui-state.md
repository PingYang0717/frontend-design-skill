# 0004. 伺服器狀態歸 TanStack Query,UI 狀態依範圍分四處

## 背景

前端的「狀態」其實是四種性質不同的東西:後端擁有的資料、跨頁共用的介面設定、應該能分享
與重新整理還在的檢視條件、以及只屬於一個元件的暫態。

最常見的混用是:抓完 API 就 `set` 進全域 store。之後同一份資料就有兩個來源——query 快取
與 store——誰該在寫入後更新、誰是最新的,沒有任何機制保證。另一種混用是把篩選條件放在
`useState` 或 store,重新整理或分享連結時條件就消失。

## 決策

| 狀態         | 範例                         | 放哪裡                                         |
| ------------ | ---------------------------- | ---------------------------------------------- |
| 伺服器狀態   | 清單、詳細資料、目前使用者   | **TanStack Query**(`hooks/` 的 `queryOptions`) |
| 全域 UI 狀態 | 側欄收合、主題、語言         | **Zustand**(`stores/`)                         |
| URL 狀態     | 搜尋字、篩選、分頁、目前 tab | **React Router 的 search params**              |
| 元件區域狀態 | 對話框開關、輸入中的值       | **`useState`**                                 |

**1. 伺服器資料只住在 query 快取,絕不寫進 Zustand。** 寫入後靠 invalidate 讓快取重抓
([ADR-0005](0005-suspense-query-and-data-boundary.md)),不手動同步第二份。
`eslint.config.js` 禁止 `src/stores/**` import `@/api`、`@/hooks`
([ADR-0013](0013-lint-enforces-layer-boundaries.md)),store 拿不到抓資料的函式。

**2. Zustand 只放跨元件、跨頁的介面狀態。** 需要跨重新整理記住的才加 `persist`,storage
key 取自 `constants/storage.ts`;`devtools` 放最外層。範本:`stores/useLayoutStore.ts`。

**3. 能分享的檢視條件放 URL。** 判準:使用者把網址貼給同事,對方該不該看到同一個畫面?
該,就放 search params。範本:`ItemsPage` 的 `?q=`。

**4. 其餘留在元件的 `useState`。** 只有一個元件在乎的東西,不上升到 store。

✅

```tsx
// pages/Items/ItemsPage.tsx
const [searchParams, setSearchParams] = useSearchParams();
const [isCreateOpen, setCreateOpen] = useState(false);

const keyword = searchParams.get('q') ?? '';
```

```ts
// hooks/useItems.ts
export const useItems = () => useSuspenseQuery(itemsQuery).data;
```

❌

```ts
// 把 API 回應複製進 store,之後兩份資料各自過期
const items = await listItems();
useItemStore.getState().setItems(items);
```

```tsx
// 篩選放 store:重新整理、分享連結都會遺失
const keyword = useFilterStore((state) => state.keyword);
```

規則細節見 [`state-management.md`](../conventions/state-management.md)。

## 後果

- 每份伺服器資料只有一個來源;「寫入後畫面沒更新」只可能是 invalidate 的 key 不對,
  查一處就好。
- 樂觀更新也在 query 快取上做,不另開 store
  ([ADR-0015](0015-optimistic-updates-and-races.md))。
- URL 狀態要自己處理型別轉換(search params 都是字串);多個條件時抽成 hook,不散在元件裡。
- 「該放 URL 還是 useState」偶有灰帶(例如對話框要不要能被連結打開),依「分享後該不該
  看到」判斷,判不出來時先用 `useState`。

### 何時重新討論

- 需要離線優先或跨分頁同步伺服器資料時,評估 query 快取的 persist 方案,仍不搬進 Zustand。
- 全域 UI 狀態多到 store 之間互相依賴時,檢查是否有東西其實屬於 URL 或元件。
