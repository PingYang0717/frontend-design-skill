# 路由

> 路由模式(history 或 hash)由**每個專案收件時決定並寫 ADR**(`docs/adr/0020` 起的編號)。
> 選單、路由、權限守衛共用一份來源:[`navEntries.tsx`](../../src/components/layouts/navEntries.tsx)
> 加上 [`app/navPages.tsx`](../../src/app/navPages.tsx)。

## 1. 組成

| 檔案                                | 角色                                                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants/routes.ts`               | `ROUTES`:所有路徑的唯一來源                                                                                                                               |
| `components/layouts/navEntries.tsx` | `NAV_ENTRIES`:選單入口(key、路徑、圖示、文案、權限);`NavKey` 型別                                                                                         |
| `app/navPages.tsx`                  | `NAV_PAGES: Record<NavKey, …>`:入口 → lazy 頁面                                                                                                           |
| `app/subPages.tsx`                  | 不在選單上的頁面(登入頁、詳細頁)的 lazy 宣告                                                                                                              |
| `app/routes.tsx`                    | `appRoutes`:`PublicLayout` 區域(登入頁)+ `RequireAuth` 包住的 `RootLayout` 區域(由 `NAV_ENTRIES` 長出路由,每個入口包 `RequirePermission`;另加 403 與 `*`) |
| `app/router.tsx`                    | 建立 router(路由模式在這一行)                                                                                                                             |
| `test/renderApp.tsx`                | 測試用 `createMemoryRouter(appRoutes)` 載入同一份路由表                                                                                                   |

## 2. 新增一個選單入口

**規則**:依序改三個檔案,不在別處手打路徑字串。

```ts
// 1. src/constants/routes.ts
export const ROUTES = {
  home: '/',
  items: '/items',
  reports: '/reports',
  forbidden: '/403',
} as const;
```

```tsx
// 2. src/components/layouts/navEntries.tsx
export type NavKey = 'home' | 'items' | 'reports';

// NAV_ENTRIES 加一列
{
  key: 'reports',
  path: ROUTES.reports,
  icon: <BarChartOutlined />,
  label: (t) => t.nav.reports,
  permission: PERMISSIONS.reportsRead,
},
```

```tsx
// 3. src/app/navPages.tsx
export const NAV_PAGES: Record<NavKey, React.LazyExoticComponent<React.FC>> = {
  home: lazy(() => import('@/pages/Home/HomePage')),
  items: lazy(() => import('@/pages/Items/ItemsPage')),
  reports: lazy(() => import('@/pages/Reports/ReportsPage')),
};
```

同時:`i18n/zhTW.ts`、`en.ts` 加 `nav.reports`;需要權限時 `constants/permissions.ts` 加一列。

**原因**:選單、路由、權限守衛從同一份資料長出來,不會出現「選單有、路由沒有」或「路由有、沒擋權限」。

**強制**:TypeScript。`NAV_PAGES` 是 `Record<NavKey, …>`——`NavKey` 加了值卻沒對頁面,或對了不存在的 key,
`npm run typecheck` 失敗。

- ❌ 在 `AppShell` 的 `Menu` 直接加一個 `{ key: '/reports', label: '報表' }`
- ❌ 在 `app/routes.tsx` 手寫 `{ path: '/reports', element: <ReportsPage /> }` 卻沒加進選單與權限

## 3. 不在選單上的路由

**規則**:詳細頁、編輯頁等子頁不進 `NAV_ENTRIES`。在 `ROUTES` 加路徑,頁面的 `lazy` 宣告放在
`app/subPages.tsx`(登入頁已在裡面),再加進 `app/routes.tsx` 的 `RootLayout` children;需要權限時一樣包
`RequirePermission`。不需要登入的頁面(目前只有登入頁)放 `PublicLayout` 區域。

**原因**:`app/routes.tsx` 匯出的是路由表(不是元件),在同一個檔案頂層宣告 `lazy` 元件會觸發
`react/only-export-components` 警告,也讓 Fast Refresh 失效。

```ts
// src/constants/routes.ts
itemDetail: '/items/:id',
```

```tsx
// src/app/subPages.tsx:只放不在選單上的頁面
import { lazy } from 'react';

export const ItemDetailPage = lazy(() => import('@/pages/ItemDetail/ItemDetailPage'));
```

```tsx
// src/app/routes.tsx(RootLayout 的 children)
import { ItemDetailPage } from './subPages';
// ...
{
  path: ROUTES.itemDetail,
  element: (
    <RequirePermission permission={PERMISSIONS.itemsRead}>
      <ItemDetailPage />
    </RequirePermission>
  ),
},
```

組帶參數的連結用 react-router 的 `generatePath`,不手拼:

- ✅ `navigate(generatePath(ROUTES.itemDetail, { id: item.id }))`
- ❌ ``navigate(`/items/${item.id}`)``

## 4. Lazy 頁面

**規則**:路由頁面一律 `lazy(() => import('@/pages/...'))`,每個頁面一個 chunk。
lazy 頁面的 `Suspense` 由 `AppShell` 內容區的 `DataBoundary` 提供,不需要每頁再包。
頁面檔必須 `export default` 元件(`lazy` 只接受 default export)。

- ❌ 在 `navPages.tsx` 直接 `import ItemsPage from '@/pages/Items/ItemsPage'`:所有頁面打進首屏 bundle。

## 5. URL state

**規則**:篩選、搜尋、分頁、tab、排序放 URL query string(理由見 [state-management.md](./state-management.md))。

- 讀:`const [searchParams, setSearchParams] = useSearchParams();`,`searchParams.get('q') ?? ''`。
- 寫:輸入框連續輸入時 `{ replace: true }`,不要每個字一筆歷史紀錄;切 tab、換頁等離散操作用預設的 push。
- 預設值不寫進 URL(空字串時移除參數),網址保持乾淨。
- 數字參數讀取時轉型並給預設值:`Number(searchParams.get('page') ?? '1')`。
- 需要 debounce 的條件(搜尋)綁 URL 的原值,過濾或查詢用 `useDebouncedValue` 的結果。
- 路徑參數(`/items/:id`)用 `useParams`,只放「這是哪一筆」,不放檢視條件。

```tsx
// ✅ src/pages/Items/ItemsPage.tsx
const keyword = searchParams.get('q') ?? '';
const debouncedKeyword = useDebouncedValue(keyword);
// ...
onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true })}
```

```tsx
// ❌ 分頁放 useState:重新整理回到第 1 頁,連結無法分享
const [page, setPage] = useState(1);
```

查詢條件會影響後端請求時,把它放進 queryKey(`['items', { q, page }]`,見 [data-fetching.md](./data-fetching.md))。

## 6. 登入與權限守衛

`RootLayout` 整個被 `RequireAuth` 包住:沒有 session 一律導到 `ROUTES.login`(見 [login.md](./login.md))。
每個 `NAV_ENTRIES` 入口的 `permission` 同時決定:選單是否顯示(`AppShell` 過濾)、直接輸入網址時是否導到
`ROUTES.forbidden`(`RequirePermission`)。前端守衛只是體驗,真正的檢查在後端。詳見 [auth.md](./auth.md)。

## 7. 路由模式:history vs hash

**規則**:專案收件時選定一種,寫 ADR,改 `app/router.tsx` 一行。測試一律用 `createMemoryRouter`,不受影響。

|                    | history(`createBrowserRouter`,骨架預設) | hash(`createHashRouter`)    |
| ------------------ | --------------------------------------- | --------------------------- |
| 網址               | `/items?q=A`                            | `/#/items?q=A`              |
| 伺服器需求         | 所有路徑都要 fallback 到 `index.html`   | 無,伺服器只看到 `/`         |
| 部署為子路徑       | 需設定 Vite `base` 與 router `basename` | 只需 Vite `base`            |
| 分享預覽、連結偵測 | 正常                                    | 較差(部分工具截斷 `#` 之後) |
| 錨點 `#section`    | 可用                                    | 不可用(`#` 已被路由佔用)    |

### history 模式注意事項

- 部署端(nginx、IIS、反向代理)**必須**設定 SPA fallback,否則在 `/items` 重新整理會 404。
  這個設定不在本 repo,ADR 要寫明由誰維護、設定在哪裡。
- `/api` 開頭的路徑不可被 fallback 吃掉。

### hash 模式注意事項

- `navigate()`、`<Link>` 由 router 自動補 `#`;**離開 app 的連結不會**——`window.open`、複製到剪貼簿、
  `<a href>`、Email 內的連結,都要自己補 `#`。
- 這種錯誤不會報錯:少了 `#` 的連結指向伺服器沒有的路徑,不是 404 就是落回首頁。
  因此組「給瀏覽器用的網址」集中在一支 `utils/` 函式,不在各處手拼。

```ts
// ✅ hash 模式:給瀏覽器的完整網址集中組裝
export const appHref = (path: string): string => `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;

window.open(appHref(generatePath(ROUTES.itemDetail, { id })), '_blank');
```

```ts
// ❌ hash 模式下少了 #
window.open(generatePath(ROUTES.itemDetail, { id }), '_blank');
```

**什麼情況下該重新討論**:部署環境改變(例如原本無法設定 fallback 的主機換成可以)、
或需要網址被搜尋引擎 / 分享預覽正確讀取。切換時已流出的舊連結會失效,ADR 要記錄處理方式。
