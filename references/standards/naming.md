# 命名規範

> 名字讓人不開檔就知道「這是哪一層、做什麼」。能用工具強制的不多,主要靠 review。

## 1. 檔案與資料夾

| 種類               | 規則                              | ✅ 範例                              | ❌ 範例                                    |
| ------------------ | --------------------------------- | ------------------------------------ | ------------------------------------------ |
| 元件               | PascalCase,檔名 = 元件名          | `ItemTable.tsx`                      | `item-table.tsx`、`itemTable.tsx`          |
| 頁面               | `pages/<Name>/<Name>Page.tsx`     | `pages/Items/ItemsPage.tsx`          | `pages/items.tsx`、`pages/Items/index.tsx` |
| 元件樣式           | 與元件同名 + `.module.css`        | `LoadErrorPanel.module.css`          | `styles.css`、`LoadErrorPanel.css`         |
| hook               | camelCase,`use` 開頭              | `useItems.ts`、`useItemMutations.ts` | `itemsHook.ts`                             |
| store              | `use<Name>Store.ts`               | `useLayoutStore.ts`                  | `layoutStore.ts`                           |
| endpoint module    | `<資源>Api.ts`(單數)              | `itemApi.ts`、`permissionApi.ts`     | `items.service.ts`、`api.ts`               |
| DTO 型別檔         | 資源名單數小寫                    | `types/api/item.ts`                  | `types/api/Items.d.ts`                     |
| 純函式             | camelCase,動詞開頭                | `describeError.ts`                   | `ErrorUtils.ts`                            |
| 常數檔             | camelCase 名詞                    | `routes.ts`、`permissions.ts`        | `ROUTES.ts`                                |
| 測試               | 被測檔名 + `.test.ts(x)`,同資料夾 | `ItemsPage.test.tsx`                 | `__tests__/items.spec.tsx`                 |
| 元件 domain 資料夾 | 小寫單字                          | `components/items/`                  | `components/Items/`                        |

**原因**:檔名與匯出的識別字一致,搜尋檔名就能找到定義;`.module.css` 讓 Vite 套用 CSS Modules。

## 2. 識別字

| 種類                               | 規則                                  | ✅ 範例                                                         |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| 元件、型別、interface              | PascalCase                            | `ItemTable`、`ApiErrorBody`、`ThemeTokens`                      |
| props interface                    | `<元件名>Props`,放元件正上方          | `ItemTableProps`                                                |
| 函式、變數                         | camelCase                             | `listItems`、`visibleItems`                                     |
| 模組層級常數(不可變的設定、對照表) | SCREAMING_SNAKE_CASE                  | `NAV_ENTRIES`、`NAV_PAGES`、`LIGHT_TOKENS`、`KNOWN_ERROR_CODES` |
| 「唯一來源」常數物件               | SCREAMING_SNAKE_CASE,key 用 camelCase | `ROUTES.items`、`ACCESS_GATE_RULES`                             |
| 由常數推導的型別                   | 單數 PascalCase                       | `Permission`、`RoutePath`、`KnownErrorCode`                     |
| 列舉值(與後端一致)                 | 照後端拼法                            | `'ACTIVE' \| 'ARCHIVED'`                                        |

**規則**:型別用 `interface` 描述物件形狀;union、由常數推導的型別用 `type`。不用 TypeScript `enum`
(`tsconfig` 的 `erasableSyntaxOnly` 會擋下)。

- ✅ `export const ROUTES = { home: '/', items: '/items' } as const;` + `type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];`
- ❌ `export enum Permission { ItemsRead = 'items:read' }`

## 3. Boolean

**規則**:用 `is` / `has` / `can` / `should` 開頭;對應的 setter 是 `set` + 去掉 `is` 的名字。

- ✅ `isSiderCollapsed` / `setSiderCollapsed`、`isCreateOpen` / `setCreateOpen`、`isDarkMode` / `setDarkMode`
- ❌ `collapsed`、`open`、`dark`(與動作或元件 prop 混淆)

例外:antd 元件的 prop 照 antd 命名(`open`、`loading`、`collapsed`)。

## 4. 函式動詞

| 層                         | 動詞                                                   | ✅ 範例                                    |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| endpoint module            | `list` / `get` / `create` / `update` / `delete` + 資源 | `listItems`、`getItem`、`createItem`       |
| 資料 hook(讀)              | `use` + 資源(複數表示清單)                             | `useItems`、`useItem`                      |
| 資料 hook(寫)              | `use` + 動作 + 資源                                    | `useCreateItem`、`useDeleteItem`           |
| 判斷                       | `is` / `has`                                           | `isNotFound`、`isOffline`                  |
| 產生文案                   | `describe`                                             | `describeLoadError`、`describeActionError` |
| 元件內事件處理             | 動作本身,不加 `handle` 前綴也可;同一檔案內一致         | `submit`、`retry`                          |
| 傳給子元件的 callback prop | `on` + 事件                                            | `onClose`、`onRetry`                       |

- ❌ `fetchItemsData`、`getItemsList`(同一件事多種動詞,搜尋時漏掉)

## 5. TanStack Query

**規則**:每種資料一組 `<資源>QueryKey` + `<資源>Query`,與讀它的 hook 同檔。

```ts
export const itemsQueryKey = ['items'] as const;
export const itemsQuery = queryOptions({ queryKey: itemsQueryKey, queryFn: listItems });
export const useItems = () => useSuspenseQuery(itemsQuery).data;
```

queryKey 的結構規則見 [data-fetching.md](./data-fetching.md) 的「queryKey 命名」。

## 6. 路由、權限、storage key

| 種類             | 規則                                            | ✅ 範例                               |
| ---------------- | ----------------------------------------------- | ------------------------------------- |
| URL 路徑         | 小寫、kebab-case、資源複數                      | `/items`、`/items/:id`、`/audit-logs` |
| `ROUTES` key     | camelCase,與 `NavKey` 一致                      | `ROUTES.items` ↔ `NavKey 'items'`     |
| 權限代碼         | `<資源>:<動作>`,與後端逐字一致                  | `'items:read'`、`'items:write'`       |
| URL query 參數   | 短、小寫                                        | `?q=`、`?page=`、`?tab=`              |
| localStorage key | `app:<名稱>`,一律在 `constants/storage.ts` 定義 | `LAYOUT_STORAGE_KEY = 'app:layout'`   |

## 7. 文案字典 key(選了 i18n 模組時)

**規則**:巢狀物件,第一層是 domain(`items`、`errors`、`common`),最後一層描述用途而非內容。

- ✅ `t.items.create.nameRequired`、`t.common.retry`
- ❌ `t.pleaseEnterName`、`t.items.text1`

詳見 `i18n.md`。

## 8. CSS Modules class

**規則**:camelCase,描述角色而非外觀。

- ✅ `.header`、`.sider`、`.technical`
- ❌ `.blue-text`、`.mt16`、`.left-box`
