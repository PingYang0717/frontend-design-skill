# 0002. 目錄依「層」分,不依「功能」分

## 背景

`src/` 的切法有兩種主流:依功能(`features/items/` 底下放 api、hook、元件、store),或依層
(`api/`、`hooks/`、`components/<domain>/`、`stores/`)。

依功能切的好處是「一個功能一個資料夾」,但每個功能資料夾都會長出自己的抓資料方式、自己的
錯誤處理、自己的小 store;規則要在每個資料夾各自成立,review 時看不出誰偏了。多人加各自的
coding agent 協作時,這種漂移累積得特別快。

## 決策

**依層放。** 目錄固定為:

```
src/
  api/          apiClient、apiError、apiPath、expectArray 與各資源的 endpoint module
  app/          Router、路由表、Provider、QueryClient(進入點是 src/main.tsx)
  components/   依 domain 切:common / layouts / auth / items …
  constants/    路由、權限、storage key 等共用常數
  hooks/        資料 hook(queryOptions + useSuspenseQuery)與跨元件的 UI hook
  i18n/         介面文案字典
  mocks/        MSW handler 與假資料(開發期 mock 與測試共用)
  pages/        路由頁面:只組裝、只放 DataBoundary
  stores/       Zustand store(只放 UI 狀態)
  test/         測試 setup 與 render helper
  theme/        design token 與它的兩個出口(antd theme、CSS 變數)
  types/api/    與後端 DTO 逐字一致的型別
  utils/        純函式
```

1. **同一層的東西彼此長得像。** `hooks/` 裡每個資料 hook 都是 `queryOptions` +
   `useSuspenseQuery`、`api/` 裡每個檔案都是一個資源的具名函式。規則(讀取方式、匯出形式、
   共用 `apiClient`)因此能在整個目錄上一致地成立,偏離一眼可見。
2. **依賴方向單一。** `pages → components → hooks → api → types / utils / constants`,
   由 ESLint 強制([ADR-0013](0013-lint-enforces-layer-boundaries.md))。依功能切時,同一個
   資料夾裡什麼都能 import 什麼,方向無從檢查。
3. **`components/` 內才依 domain 切。** 元件數量最多,需要第二層分類;`common/` 放共用零件
   (`DataBoundary`、`IconButton`、`LoadErrorPanel`),`layouts/` 放外殼與選單清單。
4. **`app/` 與 `pages/` 不是層,但要獨立。** 路由進入點若混進 `components/`,就看不出哪些
   是進入點;選單清單(`components/layouts/navEntries.tsx`)放 `components/`,是為了不讓
   元件反向 import `app/`。
5. **Zustand store 不放 `hooks/`。** 否則那個目錄同時裝著資料抓取、UI 邏輯與全域狀態三種
   東西。

**一個新功能會同時落在好幾個目錄,這是刻意的。** 以 `Item` 為例:

| 層               | 檔案                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| DTO              | `src/types/api/item.ts`                                                          |
| endpoint         | `src/api/itemApi.ts`                                                             |
| 讀取 / 寫入 hook | `src/hooks/useItems.ts`、`src/hooks/useItemMutations.ts`                         |
| 元件             | `src/components/items/ItemTable.tsx`、`ItemCreateDialog.tsx`                     |
| 頁面             | `src/pages/Items/ItemsPage.tsx`                                                  |
| 入口             | `constants/routes.ts` → `components/layouts/navEntries.tsx` → `app/navPages.tsx` |

✅ `src/hooks/useItems.ts` 匯出 `itemsQuery`,`ItemTable` 呼叫 `useItems()`。

❌ `src/features/items/` 底下自己 `axios.get`、自己開一個 store 存清單。

規則細節見 [`project-structure.md`](../conventions/project-structure.md)。

## 後果

- 改一個功能要跨好幾個資料夾;換來的是任何一個資料夾打開都只有一種寫法。
- 「這個檔案該放哪」幾乎沒有灰帶:看它是什麼(endpoint、hook、元件、純函式),不是看它
  屬於哪個功能。
- 跨功能共用的東西不必搬家:`hooks/useCurrentUser.ts` 從一開始就在大家都找得到的地方。
- 功能刪除時要記得清每一層;沒人 import 的 export 不會被 `noUnusedLocals` 抓到,殘留的
  endpoint 或 hook 靠 review 清掉。

### 何時重新討論

- 專案拆成多個獨立部署的子應用(micro-frontend),或某個 domain 大到需要自己的團隊與發版
  節奏時,考慮在 domain 之內再依層分。
- 層的清單要增減(例如新增 `workers/`),先改本 ADR 與 `eslint.config.js` 的分層規則。
