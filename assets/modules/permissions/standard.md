# 細粒度權限(模組:permissions)

> 選了 permissions 模組才有這份規範(`docs/adr/0022-selected-modules.md`;權限清單的 API 記在 0021 第 3 節)。
> 「進得了系統之後能看哪一頁、按哪顆鈕」的寫法。登入與整頁遮罩(公司網路、系統使用權限)是基底的事,見
> [access.md](./access.md);決策背景見 [ADR-0012](../adr/0012-role-based-permission-skeleton.md)。

## 0. 前提:前端守衛只是體驗

**規則:** 前端的權限判斷(隱藏選單、導到 403、藏按鈕)只負責「不讓使用者看到做不了的事」。
真正的授權檢查一定在後端,每一支 API 都要自己擋。

**原因:** 前端程式碼與 `GET /me` 的回應都在使用者手上,改 localStorage、開 DevTools、直接打
API 都能繞過。把前端守衛當安全機制,等於沒有安全機制。

- 後端拒絕時回 403,前端由 `isForbidden`(`src/api/apiError.ts`)判讀,讀取錯誤卡顯示
  `errors.forbidden`、寫入 toast 顯示「沒有執行這個操作的權限」(見 [error-handling.md](./error-handling.md))。
  **注意**:專案的閘門若也用 403 表示「沒有系統使用權限」(`app/accessGate.ts`),那支 403 會先被閘門攔下、整頁遮罩;
  細粒度權限的 403 與閘門的 403 要靠 `code` 區分,收件時跟後端確認。
- ❌ 不要因為「按鈕已經藏起來了」就讓後端省略檢查。

## 1. 權限代碼:`constants/permissions.ts` 是唯一來源

**規則:** 所有權限代碼列在 [`src/constants/permissions.ts`](../../src/constants/permissions.ts),
值與後端回傳的字串**逐字一致**(`資源:動作`)。其他地方只引用 `PERMISSIONS.xxx`,不手打字串。

**原因:** 型別 `Permission` 由這張表推導,打錯字直接 typecheck 失敗;後端改名時只改一處。

✅ 正確

```ts
export const PERMISSIONS = {
  itemsRead: 'items:read',
  itemsWrite: 'items:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
```

❌ 錯誤

```tsx
<RequirePermission permission="items:wirte">  {/* 字串字面值:拼錯也沒人發現 */}
```

## 2. 權限從哪裡來:`permissionApi.ts`

**規則:** 目前使用者的權限清單來自 `src/api/permissionApi.ts` 的 `getPermissions()`(骨架預設 `GET /permissions`,
回 `string[]`;公司沒有統一的 API,路徑與形狀收件時問,記在 ADR-0021 第 3 節),由 `hooks/usePermission.ts` 的
`permissionsQuery`(`useSuspenseQuery`)讀取。元件**不直接讀**清單,一律透過下面的 hook 或元件判斷。
後端回的不是 `string[]`(例如 `{ permissions: [...] }`)時,在 `permissionApi.ts` 轉成 `string[]`,其他地方不知道差別。

**原因:** 判斷邏輯只有一份(「`undefined` 代表不需要權限」這類規則才不會各寫各的);
日後改成角色繼承、萬用權限或換 API 時也只改一處。

## 3. `usePermission` / `usePermissionChecker`

**規則:**

- 判斷**單一**權限用 `usePermission(permission)`,回傳 `boolean`。
- 要逐筆過濾清單(例如選單)用 `usePermissionChecker()`,回傳判斷函式。
  不要在 `.filter` 裡呼叫 `usePermission`——hook 不能在迴圈裡呼叫(oxlint
  `react/rules-of-hooks` 會報錯)。
- 參數是 `undefined` 時一律為 `true`(不需要權限)。

✅ 正確

```ts
const isAllowed = usePermissionChecker();
const menuItems = NAV_ENTRIES.filter((entry) => isAllowed(entry.permission));
```

❌ 錯誤

```ts
const permissions = usePermissions();
const canWrite = permissions.includes('items:write'); // 自己判斷、手打字串
```

## 4. 路由層級:`<RequirePermission onDenied="redirect">`

**規則:** 需要權限的頁面不在頁面元件裡判斷,而是在 `NAV_ENTRIES`
(`src/components/layouts/navEntries.tsx`)該列設定 `permission`。`src/app/routes.tsx`
會自動用 `<RequirePermission onDenied="redirect">` 包住頁面:沒有權限就 `<Navigate to={ROUTES.forbidden} replace />`。

**原因:** 選單、路由、守衛從同一份資料長出來,不會出現「選單藏了但網址打得開」或反過來的情況。
`replace` 讓使用者按上一頁不會又撞回被拒的網址。

✅ 正確

```tsx
{
  key: 'items',
  path: ROUTES.items,
  icon: <AppstoreOutlined />,
  label: '項目管理',
  permission: PERMISSIONS.itemsRead,
},
```

❌ 錯誤

```tsx
const ItemsPage: React.FC = () => {
  const allowed = usePermission(PERMISSIONS.itemsRead);
  if (!allowed) return <ForbiddenPage />; // 每頁自己守,選單卻不知道要藏
  // ...
};
```

不在選單裡的頁面(例如詳細頁)直接在 `routes.tsx` 用 `<RequirePermission onDenied="redirect">` 包住。

### 4.1 沒有權限的畫面是公版,有三種

| 情況                               | 畫面                                                                            | 來源                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 整頁沒有權限(直接打網址、選單已藏) | 403 頁:`pages/Forbidden/ForbiddenPage.tsx`(antd `Result status="403"` + 回首頁) | `RequirePermission` 導向 `ROUTES.forbidden`                  |
| 頁面裡某個區塊 / 按鈕沒有權限      | 不顯示;需要替代內容時給 `fallback`                                              | `<RequirePermission>`(預設 `onDenied="hide"`)                |
| 前端以為有權限、後端回 403         | 該窗格的錯誤卡顯示 `errors.forbidden`,其餘窗格不受影響                          | `DataBoundary` → `LoadErrorPanel`,文案由 `describeLoadError` |

這三個畫面都是公版,**不另寫**:專案只調整 `pages.forbidden` 與 `errors.forbidden` 的文案;prototype 畫了不同的
403 頁時,只改 `ForbiddenPage.tsx` 的版面與 token,路由與導向行為不變。需要「停用並說明原因」而不是隱藏,見第 5 節。

## 5. 元件層級:`<RequirePermission>`(預設 `hide`)

**規則:** 按鈕、欄位、區塊這類「頁面裡的一部分」用 `<RequirePermission permission={...}>` 包住(與路由層同一個元件,
只是不傳 `onDenied`)。沒權限時預設什麼都不顯示;需要替代內容(例如唯讀文字)時傳 `fallback`。

**原因:** 宣告式寫法一眼看得出「這塊受哪個權限管」,review 時容易查;路由與元件同一個名字,不用記兩套。

✅ 正確(Item 範例本身不包權限;新增按鈕要受 `items:write` 管時這樣寫)

```tsx
<RequirePermission permission={PERMISSIONS.itemsWrite}>
  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
    新增
  </Button>
</RequirePermission>
```

❌ 錯誤

```tsx
<Button disabled={!permissions.includes('items:write')}>新增</Button>
```

**隱藏還是停用?** 預設隱藏。只有 prototype 明確畫出「停用並提示原因」時才改成停用,此時用
`usePermission` 取得布林值,並以 Tooltip 說明原因(選了 i18n 時文案進字典)。

## 6. 選單過濾

**規則:** 側欄選單在 `AppShell` 以 `usePermissionChecker` 過濾 `NAV_ENTRIES`。新增入口時只要
在該列設 `permission`,選單與路由守衛會同時生效,不需要另外改 `AppShell`。

## 7. 新增一個權限的步驟

1. 與後端確認權限代碼字串(規格或後端契約要列出)。
2. 在 `src/constants/permissions.ts` 加一列。
3. 頁面:在 `navEntries.tsx` 該入口設定 `permission`(不在選單的頁面,於 `routes.tsx` 用
   `RequirePermission` 包住)。
4. 頁面內的按鈕/區塊:用 `<RequirePermission>` 包住。
5. 測試的假權限:選了 msw 模組 → `src/mocks/db.ts` 的 `seedPermissions()` 加入新權限(開發期 `dev:mock` 才看得到畫面);
   沒選 → `src/test/fixtures.ts` 的 `TEST_PERMISSIONS` 加入。
6. 測試:至少一個「沒有權限」的案例——把權限清單改掉,斷言入口或按鈕不存在(範本見
   `src/components/auth/RequirePermission.test.tsx`)。

```ts
// msw
db.permissions = ['items:read'];
// 沒選 msw
vi.mocked(getPermissions).mockResolvedValue(['items:read']);

renderApp('/items');
await screen.findByText('範例項目 A');
expect(screen.queryByRole('button', { name: /新增/ })).not.toBeInTheDocument();
```

## 8. 不做的事

- 不在前端維護「角色 → 權限」對照表:後端直接回權限清單,前端只看權限,不看角色名稱。
- 不把權限清單寫進 Zustand:它是伺服器資料,只走 TanStack Query
  (見 [state-management.md](./state-management.md))。
- 不拿權限清單判斷「能不能進系統」:那是存取閘門的事([access.md](./access.md)),由後端每支 API 檢查、前端整頁遮罩。
