# 模組:permissions(細粒度權限)

「登入之後能看哪一頁、按哪顆鈕」的權限骨架:權限代碼只在 `constants/permissions.ts`、清單來自一支 API、
判斷只走 `usePermission`,三個落點(路由、選單、元件)共用 `<RequirePermission>`。
沒選這個模組時,基底只有存取閘門(公司網路、系統使用權限 → 整頁遮罩),進得來的人每一頁、每顆鈕都能用。
多數公司內部系統不需要這個模組,**建議答案是「否」**。

套用順序第 6 個(最後,在 ag-grid 之後),要看 i18n 與 msw 有沒有選。

## 細項:權限清單從哪支 API 來

收件時追問:路徑、方法、回傳形狀。公司沒有統一的 API;骨架預設 `GET /permissions` 回 `string[]`。
答案寫進 `docs/adr/0021-access-gate.md` 第 3 節,只改 `src/api/permissionApi.ts`(回傳不是 `string[]` 時在那裡轉)。

## 1. 安裝套件

不需要。

## 2. 複製檔案

依序疊,後疊的覆蓋先疊的:

```bash
cp -R <skill>/assets/modules/permissions/files/. <project>/
cp -R <skill>/assets/modules/permissions/files.with-i18n/. <project>/           # 有選 i18n
cp -R <skill>/assets/modules/permissions/files.with-msw/. <project>/            # 有選 msw
cp -R <skill>/assets/modules/permissions/files.with-i18n-and-msw/. <project>/   # i18n 與 msw 都選
```

| 檔案                                             | `files/`                                                                 | 變體                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `src/constants/permissions.ts`                   | 新增:權限代碼表與 `Permission` 型別                                      | —                                                       |
| `src/api/permissionApi.ts`                       | 新增:`getPermissions()`,`GET /permissions`                               | —                                                       |
| `src/hooks/usePermission.ts`                     | 新增:`permissionsQuery`、`usePermission`、`usePermissionChecker`         | —                                                       |
| `src/components/auth/RequirePermission.tsx`      | 新增:路由與元件共用的守衛(`onDenied="redirect"` / 預設 `hide`)           | —                                                       |
| `src/pages/Forbidden/ForbiddenPage.tsx`          | 新增:403 頁,文字寫繁中                                                   | `files.with-i18n/`:文字引用字典                         |
| `src/components/auth/RequirePermission.test.tsx` | 新增:沒權限導 403、選單隱藏;以 `vi.mock('@/api/permissionApi')` 換掉 API | `with-i18n`:斷言引用字典;`with-msw`:改 `db.permissions` |

## 3. 修改既有檔案

改完全部跑一次 `npm run lint:fix`(排 import 順序)再跑 lint / typecheck / test。

**`src/constants/routes.ts`**:`items: '/items',` 的下一行加 `forbidden: '/403',`

**`src/components/layouts/navEntries.tsx`**:

1. import 區加 `import { type Permission, PERMISSIONS } from '@/constants/permissions';`(位置不拘,最後 `npm run lint:fix` 會排序)
2. `interface NavEntry` 裡 `label` 那行的下一行加

   ```ts
     /** 需要的權限;沒有權限時選單隱藏、直接輸入網址會被導到 403。 */
     permission?: Permission;
   ```

3. `items` 入口的 `label` 那行(沒選 i18n 是 `label: '項目管理',`,選了是 `label: (t) => t.nav.items,`)的下一行加
   `permission: PERMISSIONS.itemsRead,`

**`src/components/layouts/AppShell.tsx`**:

1. import 區加 `import { usePermissionChecker } from '@/hooks/usePermission';`(位置不拘,最後 `npm run lint:fix` 會排序)
2. `const isSiderCollapsed = useLayoutStore(...)` 那行的上一行加 `const isAllowed = usePermissionChecker();`
3. `const menuItems = NAV_ENTRIES.map((entry) => ({` 改成 `const menuItems = NAV_ENTRIES.filter((entry) => isAllowed(entry.permission)).map((entry) => ({`

**`src/app/routes.tsx`**:

1. import 區加 `import RequirePermission from '@/components/auth/RequirePermission';`、
   `import ForbiddenPage from '@/pages/Forbidden/ForbiddenPage';`、`import { ROUTES } from '@/constants/routes';`
   (位置不拘,最後 `npm run lint:fix` 會排序)
2. `return { path: entry.path, element: <Page /> };` 改成

   ```tsx
   return {
     path: entry.path,
     element: (
       <RequirePermission permission={entry.permission} onDenied="redirect">
         <Page />
       </RequirePermission>
     ),
   };
   ```

3. `{ path: '*', element: <NotFoundPage /> },` 的上一行加 `{ path: ROUTES.forbidden, element: <ForbiddenPage /> },`

**測試的假權限**(擇一):

- 沒選 msw,**`src/test/fixtures.ts`** 檔尾加

  ```ts
  /** setup.ts 讓 `getPermissions` 預設回傳它:擁有全部權限。測權限時在測試裡覆寫。 */
  export const TEST_PERMISSIONS: string[] = [PERMISSIONS.itemsRead, PERMISSIONS.itemsWrite];
  ```

  並在檔頭加 `import { PERMISSIONS } from '@/constants/permissions';`;**`src/test/setup.ts`**:
  1. import 區加 `import { getPermissions } from '@/api/permissionApi';` 與 `import { TEST_PERMISSIONS } from './fixtures';`
     (位置不拘,最後 `npm run lint:fix` 會排序)
  2. `vi.mock('@/vendor/companyUi', ...)` 的上一行加 `vi.mock('@/api/permissionApi');`
  3. `beforeEach` 裡 `useAccessStore.getState().reset();` 的下一行加 `vi.mocked(getPermissions).mockResolvedValue(TEST_PERMISSIONS);`

- 有選 msw,**`src/mocks/db.ts`**:`const seedItems` 的上一行加

  ```ts
  /** 開發期與測試的權限清單:全部權限。測「沒有權限」時在測試裡改 db.permissions。 */
  const seedPermissions = (): string[] => ['items:read', 'items:write'];
  ```

  `items: seedItems(),` 的下一行加 `permissions: seedPermissions(),`;`db.items = seedItems();` 的下一行加 `db.permissions = seedPermissions();`。
  **`src/mocks/handlers.ts`**:`pendingHandlers` 陣列第一個 handler 的上一行加

  ```ts
    http.get(api('/permissions'), () => HttpResponse.json(db.permissions)),

  ```

**有選 i18n 時,字典**:`src/i18n/zhTW.ts` 與 `en.ts` 的 `pages` 裡 `notFound: {` 的上一行加

```ts
// zhTW.ts
forbidden: {
  title: '沒有權限',
  description: '你的帳號沒有存取這個頁面的權限,如有需要請聯絡系統管理員。',
},
// en.ts
forbidden: {
  title: 'No permission',
  description: 'Your account cannot access this page. Contact the administrator if you need it.',
},
```

**`.azuredevops/pull_request_template.md`**:「自我檢查」最後一項的上一行加

```md
- [ ] 需要權限的入口已設 `permission`、寫入按鈕包 `<RequirePermission>`,並有一個「沒有權限」的測試
```

## 4. 測試

`RequirePermission.test.tsx` 是範本;每個有權限的畫面至少一個「沒有權限」的案例(`standard.md` 第 7 節)。
Item 範例本身不示範權限(基底不包守衛);要看寫入按鈕的寫法見 `standard.md` 第 5 節。

## 5. 與其他模組的互動

| 模組 | 有選時                                                              | 沒選時                                |
| ---- | ------------------------------------------------------------------- | ------------------------------------- |
| i18n | 疊 `files.with-i18n/`:403 頁與測試引用字典;字典加 `pages.forbidden` | 403 頁寫繁中                          |
| msw  | 疊 `files.with-msw/`:測試改 `db.permissions`;handler 與 db 各加一段 | 測試 `vi.mock('@/api/permissionApi')` |
| 其他 | 無                                                                  | 無                                    |

## 6. 規範與 ADR

```bash
cp <skill>/assets/modules/permissions/standard.md <project>/docs/conventions/permissions.md
cp <skill>/assets/modules/permissions/adr.md <project>/docs/adr/0012-role-based-permission-skeleton.md
```

## 7. 之後的開發

- 新權限:`PERMISSIONS` 加一列 → 入口設 `permission` → 寫入按鈕包 `<RequirePermission permission={…}>`
- 不在選單的頁面(詳細頁):`routes.tsx` 裡用 `<RequirePermission onDenied="redirect">` 包住
- 細則見 `docs/conventions/permissions.md`
